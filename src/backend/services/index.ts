// Main services export - MIGRATED TO MySQL
import { UserService } from "@/backend/database/services/user.service";
import { ApplicationService } from "@/backend/database/services/application.service";
import { DomainService } from "@/backend/database/services/domain.service";
import { HostingService } from "@/backend/database/services/hosting.service";
import { AuditLogService } from "@/backend/database/services/audit-log.service";
import type {
  SubdomainApplication,
  User,
  AuditLog,
  HostingApplication,
  Domain,
  Application,
} from "@/backend/models/types";

// Initialize service instances
const userService = new UserService();
const applicationService = new ApplicationService();
const domainService = new DomainService();
const hostingService = new HostingService();
const auditLogService = new AuditLogService();

// Re-export all services from firebase implementation
export * from "./firebase/services";

// ===========================================
// APPLICATION SERVICES (MySQL Migration)
// ===========================================

export const getApplications = async () => {
  try {
    const result = await applicationService.getApplications(1, 100);
    return result.applications;
  } catch (error) {
    console.error(
      "Error fetching applications from database, using mock data:",
      error
    );
    // Fallback to mock data
    const { MOCK_APPLICATIONS } = await import("@/backend/utils/mock-data");
    return MOCK_APPLICATIONS;
  }
};

export const getApplicationById = async (id: string) => {
  return await applicationService.getApplication(parseInt(id));
};

export const createApplication = async (application: any) => {
  // Map SubdomainApplication to CreateSubdomainApplicationData format
  const appData = {
    userId:
      application.userId || application.submitter_id?.toString() || "system",
    domainName: application.domainName || application.domain_name || "",
    purpose: application.purpose || application.reason || "",
    opd: application.opd || "",
    description: application.description || application.reason || "",
    documents:
      application.documents?.map((doc: any) => ({
        id: doc,
        name: doc,
        size: 0,
        type: "application/pdf",
      })) || [],
  };

  const id = await applicationService.createSubdomainApplication(appData);
  return id;
};

export const updateApplication = async (id: string, application: any) => {
  // Map partial update
  const updateData: any = {};
  if (application.status) updateData.status = application.status;
  if (application.rejectionReason || application.reason)
    updateData.reason = application.rejectionReason || application.reason;

  await applicationService.updateApplication(parseInt(id), updateData);
};

export const deleteApplication = async (id: string) => {
  await applicationService.deleteApplication(parseInt(id));
};

export const updateApplicationStatus = async (
  id: string,
  status: "Pending" | "Approved" | "Rejected",
  reason?: string
) => {
  await applicationService.updateApplication(
    parseInt(id),
    { status, reason }
    // updatedBy omitted - will not update last_updated_by field
  );
};

// ===========================================
// DOMAIN SERVICES (MySQL Migration)
// ===========================================

export const getDomains = async () => {
  const result = await domainService.getDomains(1, 100);
  return result.domains;
};

export const getDomainById = async (id: string) => {
  return await domainService.getDomain(parseInt(id));
};

export const updateDomain = async (id: string, domain: Partial<Domain>) => {
  // Map Domain to DomainService format
  const updateData: any = {};
  if (domain.status) updateData.status = domain.status;
  if (domain.expires_at) updateData.expires_at = new Date(domain.expires_at);

  await domainService.updateDomain(parseInt(id), updateData);
};

export const deleteDomain = async (id: string) => {
  await domainService.deleteDomain(parseInt(id));
};

export const updateDomainStatus = async (
  id: string,
  status: "Active" | "Suspended" | "Deactivated"
) => {
  await domainService.updateDomain(parseInt(id), { status });
};

/**
 * @deprecated Fungsi ini tidak lagi digunakan dalam alur baru.
 * Domain sekarang dibuat langsung saat hosting disetujui (di hosting.ts)
 * Bukan saat application disetujui.
 *
 * Alur baru: Application Approved → Admin pilih hosting → Hosting Approved → Domain Created (active)
 */
export const createDomainFromApplication = async (
  application: any
): Promise<Domain> => {
  const domainData = {
    domain_name: application.domainName || application.domain_name || "",
    status: "Active" as const, // Jika fungsi ini dipanggil, langsung active
    expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
  };

  const domainId = await domainService.createDomain(domainData);

  // Fetch the created domain to return complete object
  const createdDomain = await domainService.getDomain(
    parseInt(domainId.toString())
  );

  if (!createdDomain) {
    throw new Error("Failed to fetch created domain");
  }

  return createdDomain;
};

// ===========================================
// USER SERVICES (MySQL Migration)
// ===========================================

export const getUsers = async () => {
  try {
    const result = await userService.getUsers(1, 100);
    return result.users;
  } catch (error) {
    console.error(
      "Error fetching users from database, using mock data:",
      error
    );
    // Fallback to mock data
    const { MOCK_USERS } = await import("@/backend/utils/mock-data");
    return MOCK_USERS;
  }
};

export const getUserById = async (id: string) => {
  return await userService.getUser(parseInt(id));
};

export const getUsersByOpd = async (opd: string) => {
  // OPD filter will be added to service
  const result = await userService.getUsers(1, 100, { search: opd });
  return result.users;
};

export const createUser = async (user: User) => {
  // Not implemented in service yet - will be added
  throw new Error("createUser not yet implemented in MySQL service");
};

export const updateUser = async (id: string, user: Partial<User>) => {
  // Not implemented in service yet - will be added
  throw new Error("updateUser not yet implemented in MySQL service");
};

export const deleteUser = async (id: string) => {
  await userService.deleteUser(parseInt(id));
};

// ===========================================
// AUDIT LOG & HOSTING SERVICES
// ===========================================

export const getAuditLogs = async () => {
  try {
    const result = await auditLogService.getAuditLogs(1, 100);
    return result.logs;
  } catch (error) {
    console.error(
      "Error fetching audit logs from database, using mock data:",
      error
    );
    // Fallback to mock data
    const { MOCK_AUDIT_LOGS } = await import("@/backend/utils/mock-data");
    return MOCK_AUDIT_LOGS;
  }
};

export const createAuditLog = async (log: any) => {
  const logData = {
    user_id:
      typeof log.user_id === "number"
        ? log.user_id
        : parseInt(log.userId || log.user_id),
    action: log.action,
    application_id:
      log.application_id ||
      (log.resourceId && log.resourceType === "Application"
        ? parseInt(log.resourceId)
        : undefined),
    details: log.details || log.description,
  };

  return await auditLogService.createAuditLog(logData);
};

export const getHostingApplications = async () => {
  try {
    const result = await hostingService.getHostings(1, 100);
    return result.hostings;
  } catch (error) {
    console.error(
      "Error fetching hosting applications from database, using mock data:",
      error
    );
    // Fallback to mock data
    const { MOCK_HOSTING_APPLICATIONS } = await import(
      "@/backend/utils/mock-data"
    );
    return MOCK_HOSTING_APPLICATIONS;
  }
};

export const getHostingApplicationById = async (id: string) => {
  console.log("\n=== getHostingApplicationById called ===");
  console.log("ID requested:", id);

  // First try to get from hostings table (for active hostings)
  console.log("1. Checking hostings table...");
  try {
    const hosting = await hostingService.getHosting(parseInt(id));
    if (hosting) {
      console.log("✓ Found in hostings table:", hosting.id);
      return hosting;
    }
    console.log("✗ Not found in hostings table");
  } catch (error) {
    console.log("✗ Error accessing hostings table:", (error as Error).message);
  }

  // If not found in hostings, check applications table (for pending requests)
  console.log("2. Checking applications table...");
  try {
    const application = await applicationService.getApplication(parseInt(id));
    if (application && (application as any).application_type === "hosting") {
      console.log("✓ Found in applications table:", application.id);
      return application;
    }
    console.log("✗ Not found in applications table");
  } catch (error) {
    console.log(
      "✗ Error accessing applications table:",
      (error as Error).message
    );
  }

  // Fallback to mock data if not found in database
  console.log("3. Checking mock data...");
  try {
    const { MOCK_HOSTINGS } = await import("@/backend/utils/mock-data");
    console.log("Total mock hostings:", MOCK_HOSTINGS.length);
    console.log(
      "Mock hosting IDs:",
      MOCK_HOSTINGS.map((h) => h.id)
    );

    const mockHosting = MOCK_HOSTINGS.find((h) => h.id === parseInt(id));
    if (mockHosting) {
      console.log("✓ Found in mock data:", mockHosting.id);
      console.log("Mock hosting data:", JSON.stringify(mockHosting, null, 2));
      return mockHosting as any;
    }
    console.log("✗ Not found in mock data");
  } catch (error) {
    console.log("✗ Error accessing mock data:", (error as Error).message);
  }

  console.log("=== RESULT: No hosting found with ID", id, "===\n");
  return null;
};

export const createHostingApplication = async (application: any) => {
  const desc = application.description || "";
  // Map HostingApplication to CreateHostingData format
  const hostingData = {
    domain_id:
      application.domain_id ||
      (application.domainName ? parseInt(application.domainName) : undefined),
    storage_capacity: desc.includes("Storage:")
      ? desc.split("Storage:")[1].split(",")[0].trim()
      : application.storage_capacity || "10GB",
    bandwidth: desc.includes("Bandwidth:")
      ? desc.split("Bandwidth:")[1].split(",")[0].trim()
      : application.bandwidth || "100GB",
    server_type: application.framework || application.server_type || "VPS",
    status:
      application.status === "Active" || application.status === "Approved"
        ? ("Active" as const)
        : ("Deactivated" as const),
  };

  return await hostingService.createHosting(hostingData);
};

export const updateHostingApplication = async (
  id: string,
  application: any
) => {
  const updateData: any = {};

  if (application.framework || application.server_type) {
    updateData.server_type = application.framework || application.server_type;
  }

  if (application.status) {
    updateData.status =
      application.status === "Active" || application.status === "Approved"
        ? "Active"
        : "Deactivated";
  }

  await hostingService.updateHosting(parseInt(id), updateData);
};
