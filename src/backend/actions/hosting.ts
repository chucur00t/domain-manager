"use server";

import { revalidatePath } from "next/cache";
import { auditService } from "@/backend/services/audit.service";
import {
  createHostingApplication,
  getHostingApplicationById,
  updateHostingApplication,
} from "@/backend/services";
import type {
  HostingApplication,
  User,
  UserRole,
} from "@/backend/models/types";

type ActionResponse = {
  success: boolean;
  message: string;
};

export async function submitHostingApplication(
  formData: FormData
): Promise<ActionResponse> {
  const applicationName = formData.get("applicationName") as string;
  const domainName = formData.get("domainName") as string;
  const applicantName = formData.get("applicantName") as string;
  const opd = formData.get("opd") as string;
  const framework = formData.get(
    "framework"
  ) as HostingApplication["framework"];
  const description = formData.get("description") as string;
  const currentUserRole = formData.get("currentUserRole") as User["role"];

  if (
    !applicationName ||
    !domainName ||
    !applicantName ||
    !opd ||
    !framework ||
    !description
  ) {
    return { success: false, message: "Data tidak lengkap." };
  }

  try {
    const newId = `hosting-${Date.now()}`;
    const newApplication: HostingApplication = {
      id: newId,
      applicationName,
      domainName,
      opd,
      status: "pending",
      submittedDate: new Date().toISOString().split("T")[0],
      applicantName,
      description,
      framework,
      userId: "system", // Since this is manual submission
    };

    const newApp = await createHostingApplication(newApplication);

    // newApp returns a string ID, create log with it
    await auditService.logAction({
      action: "SUBMIT_HOSTING_APP",
      resourceType: "hosting",
      resourceId: typeof newApp === "string" ? newApp : newId,
      description: `Mengajukan permohonan hosting untuk ${applicationName} (ID: ${
        typeof newApp === "string" ? newApp : newId
      })`,
      userId: "system", // Since user is not yet in the system
    });

    revalidatePath("/hosting");
    revalidatePath("/dashboard");
    revalidatePath("/super-admin/dashboard");

    return {
      success: true,
      message: "Permohonan hosting berhasil dikirim untuk ditinjau.",
    };
  } catch (error) {
    console.error("Error submitting hosting application:", error);
    return {
      success: false,
      message: "Terjadi kesalahan pada server saat memproses permohonan.",
    };
  }
}

export async function forwardHostingForApproval(
  applicationId: string,
  currentUserRole: User["role"]
): Promise<{ success: boolean; message: string }> {
  const allowedRoles: User["role"][] = ["Super Admin"];
  if (!allowedRoles.includes(currentUserRole)) {
    return {
      success: false,
      message: "Anda tidak memiliki izin untuk melakukan tindakan ini.",
    };
  }

  const application = await getHostingApplicationById(applicationId);
  if (!application) {
    return { success: false, message: "Permohonan hosting tidak ditemukan." };
  }

  await updateHostingApplication(applicationId, { status: "pending" });

  await auditService.logAction({
    action: "FORWARD_HOSTING_FOR_APPROVAL",
    resourceType: "hosting",
    resourceId: applicationId,
    description: `Meneruskan permohonan hosting ${applicationId} (${application.applicationName}) untuk persetujuan final.`,
    userId: "system", // Use system since we don't track who is forwarding
  });

  revalidatePath("/hosting");
  revalidatePath(`/hosting/${applicationId}`);
  revalidatePath("/super-admin/dashboard");
  revalidatePath("/audit-trail");

  return {
    success: true,
    message: `Permohonan hosting ${applicationId} berhasil diteruskan untuk persetujuan final.`,
  };
}

export async function approveHostingApplication(
  applicationId: string,
  currentUserRole: User["role"]
): Promise<{ success: boolean; message: string }> {
  if (currentUserRole !== "Super Admin") {
    return {
      success: false,
      message: "Anda tidak memiliki izin untuk melakukan tindakan ini.",
    };
  }

  const application = await getHostingApplicationById(applicationId);
  if (!application) {
    return { success: false, message: "Permohonan hosting tidak ditemukan." };
  }

  await updateHostingApplication(applicationId, { status: "approved" });

  // CREATE domain when hosting is approved (domain langsung active karena hosting disetujui)
  if (application.domainName) {
    try {
      const { DomainService } = await import(
        "@/backend/database/services/domain.service"
      );
      const domainService = new DomainService();

      // Check if domain already exists
      const domainsResult = await domainService.getDomains(1, 100);
      const existingDomain = domainsResult.domains.find(
        (d) => d.hostname === application.domainName
      );

      if (existingDomain) {
        // Domain sudah ada, update ke active
        await domainService.updateDomain(parseInt(existingDomain.id), {
          status: "active",
        });

        await auditService.logAction({
          action: "ACTIVATE_DOMAIN",
          resourceType: "domain",
          resourceId: existingDomain.id,
          description: `Mengaktifkan domain ${application.domainName} karena hosting disetujui`,
          userId: "system",
        });
      } else {
        // Domain belum ada, buat baru dengan status active
        const domainData = {
          domain_name: application.domainName,
          opd_id: 1, // TODO: Get actual OPD ID from OPD name
          status: "active" as const,
          expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
        };

        const newDomainId = await domainService.createDomain(domainData);

        await auditService.logAction({
          action: "CREATE_DOMAIN",
          resourceType: "domain",
          resourceId: newDomainId.toString(),
          description: `Membuat domain ${application.domainName} karena hosting disetujui`,
          userId: "system",
        });

        // Auto-create DNS records if provider is configured
        try {
          const { dnsManagerService } = await import(
            "@/backend/services/dns/dns-manager.service"
          );

          const targetIP = process.env.DEFAULT_SERVER_IP || "103.xxx.xxx.xxx";

          const createdDomain = await domainService.getDomain(
            parseInt(newDomainId.toString())
          );

          if (createdDomain) {
            const dnsResult = await dnsManagerService.createDomainRecords({
              domain: createdDomain as any,
              targetIP,
              createWWW: true,
              proxied: true,
              userId: "system",
            });

            if (!dnsResult.success) {
              console.warn(
                `DNS creation warning for ${application.domainName}:`,
                dnsResult.error
              );
            }
          }
        } catch (dnsError) {
          console.error("Error auto-creating DNS records:", dnsError);
          // Don't fail hosting approval if DNS creation fails
        }
      }
    } catch (error) {
      console.error("Error creating/updating domain:", error);
      // Don't fail hosting approval if domain creation fails
    }
  }

  await auditService.logAction({
    action: "APPROVE_HOSTING_APP",
    resourceType: "hosting",
    resourceId: applicationId,
    description: `Menyetujui permohonan hosting ${applicationId} untuk ${application.applicationName}`,
    userId: "system",
  });

  revalidatePath("/hosting");
  revalidatePath(`/hosting/${applicationId}`);
  revalidatePath("/domains");
  revalidatePath("/super-admin/domains");
  revalidatePath("/super-admin/dashboard");
  revalidatePath("/audit-trail");

  return {
    success: true,
    message: `Permohonan hosting ${applicationId} berhasil disetujui.`,
  };
}

export async function rejectHostingApplication(
  applicationId: string,
  reason: string,
  currentUserRole: User["role"]
): Promise<{ success: boolean; message: string }> {
  const allowedRoles: UserRole[] = ["Super Admin", "Admin Daerah"];
  if (!allowedRoles.includes(currentUserRole)) {
    return {
      success: false,
      message: "Anda tidak memiliki izin untuk melakukan tindakan ini.",
    };
  }

  const application = await getHostingApplicationById(applicationId);
  if (!application) {
    return { success: false, message: "Permohonan hosting tidak ditemukan." };
  }

  await updateHostingApplication(applicationId, { status: "rejected" });
  // Note: Reason handling should be done in a separate function or through a different mechanism

  await auditService.logAction({
    action: "REJECT_HOSTING_APP",
    resourceType: "hosting",
    resourceId: applicationId,
    description: `Menolak permohonan hosting ${applicationId} (${application.applicationName}). Alasan: ${reason}`,
    userId: "system",
  });

  revalidatePath("/hosting");
  revalidatePath(`/hosting/${applicationId}`);
  revalidatePath("/super-admin/dashboard");
  revalidatePath("/audit-trail");

  return {
    success: true,
    message: `Permohonan hosting ${applicationId} berhasil ditolak.`,
  };
}
