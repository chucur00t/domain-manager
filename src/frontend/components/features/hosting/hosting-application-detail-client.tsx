"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Server, Code, CheckCircle, XCircle } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { BackButton } from "@/frontend/components/shared/back-button";
import { useState, useTransition } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface HostingApplication {
  id: string | number;
  userId?: string; // This contains application_id
  status: string;
  applicationName?: string;
  domainName?: string;
  domain_name?: string;
  framework?: string;
  applicantName?: string;
  opd: string;
  description?: string;
  submittedDate?: string;
  submitted_at?: string;
  storage_capacity?: string;
  bandwidth?: string;
  server_type?: string;
  activated_at?: string;
  expires_at?: string;
}

export function HostingApplicationDetailClient({
  application,
}: {
  application: HostingApplication;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentUserRole = searchParams.get("role");
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const domainName = application.domainName || application.domain_name || "-";
  const submittedDate =
    application.submittedDate || application.submitted_at || "-";

  const handleActionClick = (action: "approve" | "reject") => {
    setActionType(action);
    setRejectionReason("");
    setIsAlertOpen(true);
  };

  const handleConfirmAction = async () => {
    if (!actionType || !currentUserRole) return;

    if (actionType === "reject" && !rejectionReason.trim()) {
      toast({
        title: "Validasi Gagal",
        description: "Alasan penolakan harus diisi.",
        variant: "destructive",
      });
      return;
    }

    startTransition(async () => {
      try {
        // Use application.userId which contains the application_id, not hosting id
        const applicationId = application.userId || application.id;
        const endpoint = actionType === "approve" 
          ? `/api/hosting-applications/${applicationId}/approve`
          : `/api/hosting-applications/${applicationId}/reject`;
        
        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            role: currentUserRole,
            reason: actionType === "reject" ? rejectionReason : undefined,
          }),
        });

        const result = await response.json();

        if (response.ok) {
          toast({
            title: "Sukses",
            description: result.message || `Permohonan hosting berhasil ${actionType === "approve" ? "disetujui" : "ditolak"}.`,
          });
          router.refresh();
        } else {
          toast({
            title: "Error",
            description: result.message || "Terjadi kesalahan.",
            variant: "destructive",
          });
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Terjadi kesalahan saat memproses permohonan.",
          variant: "destructive",
        });
      }
      setIsAlertOpen(false);
    });
  };

  const getDialogContent = () => {
    if (actionType === "approve") {
      return {
        title: "Konfirmasi Persetujuan",
        description: `Apakah Anda yakin ingin menyetujui permohonan hosting "${application.applicationName || domainName}"? Hosting akan segera diaktifkan setelah disetujui.`,
      };
    } else {
      return {
        title: "Konfirmasi Penolakan",
        description: `Apakah Anda yakin ingin menolak permohonan hosting "${application.applicationName || domainName}"? Harap berikan alasan penolakan yang jelas.`,
      };
    }
  };

  const { title: dialogTitle, description: dialogDescription } = getDialogContent();
  const isSuperAdmin = currentUserRole === "Super Admin";
  const isPendingApplication = application.status === "Pending" || application.status === "pending";

  // Debug logging
  console.log("=== HOSTING DETAIL CLIENT ===");
  console.log("Current Role:", currentUserRole);
  console.log("Is Super Admin:", isSuperAdmin);
  console.log("Application Status:", application.status);
  console.log("Is Pending:", isPendingApplication);
  console.log("Should show buttons:", isSuperAdmin && isPendingApplication);

  // Map status to Indonesian with styling
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "Active":
      case "active":
        return {
          text: "Aktif",
          variant: "secondary" as const,
          className: "inline-flex items-center justify-center min-w-[110px] bg-green-500 hover:bg-green-600 text-white"
        };
      case "Deactivated":
      case "deactivated":
        return {
          text: "Belum Aktif",
          variant: "default" as const,
          className: "inline-flex items-center justify-center min-w-[110px] bg-gray-500 hover:bg-gray-600 text-white"
        };
      case "Expired":
      case "expired":
        return {
          text: "Kedaluwarsa",
          variant: "destructive" as const,
          className: "inline-flex items-center justify-center min-w-[110px] bg-amber-500 hover:bg-amber-600 text-white"
        };
      default:
        return {
          text: status,
          variant: "default" as const,
          className: "inline-flex items-center justify-center min-w-[110px] bg-gray-500 hover:bg-gray-600 text-white"
        };
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <BackButton />
        <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
          Detail Hosting
        </h1>
        <Badge
          variant={getStatusConfig(application.status).variant}
          className={getStatusConfig(application.status).className}
        >
          {getStatusConfig(application.status).text}
        </Badge>
      </div>

      {/* Informasi Domain */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            Informasi Domain
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Nama Domain</p>
              <p className="font-medium">{domainName}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Status Domain</p>
              <Badge
                variant={
                  (application as any).domain_status === "Active"
                    ? "secondary"
                    : "default"
                }
              >
                {(application as any).domain_status || "Belum Terdaftar"}
              </Badge>
            </div>
            <div>
              <p className="text-muted-foreground">Tanggal Aktivasi</p>
              <p className="font-medium">
                {application.activated_at || submittedDate}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Tanggal Kadaluarsa</p>
              <p className="font-medium">{application.expires_at || "-"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Informasi Hosting */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            Informasi Hosting
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Nama Aplikasi</p>
                <p className="font-medium">
                  {application.applicationName || "-"}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Status Hosting</p>
                <Badge 
                  variant={getStatusConfig(application.status).variant}
                  className={getStatusConfig(application.status).className}
                >
                  {getStatusConfig(application.status).text}
                </Badge>
              </div>
              <div>
                <p className="text-muted-foreground">Storage Capacity</p>
                <p className="font-medium">
                  {application.storage_capacity || "-"}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Bandwidth</p>
                <p className="font-medium">{application.bandwidth || "-"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Server Type</p>
                <p className="font-medium">{application.server_type || "-"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Framework</p>
                <p className="font-medium">{application.framework || "-"}</p>
              </div>
            </div>
            <Separator />
            <div>
              <p className="text-muted-foreground mb-2">Deskripsi Aplikasi</p>
              <p className="text-sm">{application.description || "-"}</p>
            </div>
            <Separator />
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">OPD</p>
                <p className="font-medium">{application.opd}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Pemohon</p>
                <p className="font-medium">
                  {application.applicantName || "-"}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Tanggal Pengajuan</p>
                <p className="font-medium">{submittedDate}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex items-center justify-between gap-2">
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Tutup
        </Button>
        <div className="flex gap-2">
          {/* Super Admin - Approve/Reject for Pending applications */}
          {isSuperAdmin && isPendingApplication && (
            <>
              <Button
                variant="destructive"
                onClick={() => handleActionClick("reject")}
                disabled={isPending}
                className="gap-2"
              >
                <XCircle className="h-4 w-4" />
                Tolak Permohonan
              </Button>
              <Button
                onClick={() => handleActionClick("approve")}
                disabled={isPending}
                className="gap-2"
              >
                <CheckCircle className="h-4 w-4" />
                Setujui Permohonan
              </Button>
            </>
          )}
          {/* Admin Daerah - Edit/Ajukan buttons */}
          {currentUserRole === "Admin Daerah" &&
            application.status === "Deactivated" && (
              <>
                <Button
                  variant="outline"
                  onClick={() =>
                    router.push(
                      `/hosting/${application.id}/edit?role=${currentUserRole}`
                    )
                  }
                >
                  Edit
                </Button>
                <Button
                  onClick={() => {
                    console.log("Ajukan hosting:", application.id);
                  }}
                >
                  Ajukan Hosting
                </Button>
              </>
            )}
        </div>
      </div>

      {/* Alert Dialog for Approve/Reject */}
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{dialogTitle}</AlertDialogTitle>
            <AlertDialogDescription>{dialogDescription}</AlertDialogDescription>
          </AlertDialogHeader>
          {actionType === "reject" && (
            <div className="space-y-2 py-4">
              <Label htmlFor="rejection-reason">Alasan Penolakan *</Label>
              <Textarea
                id="rejection-reason"
                placeholder="Masukkan alasan penolakan..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
                className="resize-none"
              />
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmAction} disabled={isPending}>
              {isPending ? "Memproses..." : "Konfirmasi"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
