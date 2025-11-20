"use client";

import { useRouter, useSearchParams } from "next/navigation";
import React, { useState, useTransition, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  ArrowLeft,
  Check,
  Download,
  FileText,
  X,
  Loader2,
  Info,
  Sparkles,
  Send,
  AlertTriangle,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
import {
  approveApplication,
  rejectApplication,
  forwardForApproval,
} from "@/backend/actions/applications";
import { cn } from "@/utils/utils";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { SubdomainApplication, User } from "@/backend/models/types";
import { WorkflowStepper } from "@/components/shared/workflow-stepper";
import { BackButton } from "@/components/shared/back-button";

// Simplified status config - only 3 main statuses
const statusConfig = {
  pending: { text: "Pending", variant: "secondary" as const, step: 0, className: "!bg-gray-500 !text-white border-transparent" },
  pending_review: { text: "Pending", variant: "secondary" as const, step: 1, className: "!bg-gray-500 !text-white border-transparent" },
  pending_approval: { text: "Pending", variant: "secondary" as const, step: 2, className: "!bg-gray-500 !text-white border-transparent" },
  approved: { text: "Disetujui", variant: "secondary" as const, step: 3, className: "!bg-green-500 !text-white border-transparent" },
  rejected: { text: "Ditolak", variant: "destructive" as const, step: 0, className: "!bg-red-500 !text-white border-transparent" },
};

function ApplicationDetailContent({
  application,
}: {
  application: SubdomainApplication;
}) {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentUserRole = searchParams.get("role") as User["role"];
  const [isPending, startTransition] = useTransition();
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [actionType, setActionType] = useState<
    "forward" | "approve" | "reject" | null
  >(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [documents, setDocuments] = useState<any[]>([]);
  const [loadingDocuments, setLoadingDocuments] = useState(true);

  // Fetch documents
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setLoadingDocuments(true);
        const response = await fetch(`/api/applications/${application.id}/documents`);
        if (response.ok) {
          const contentType = response.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const docs = await response.json();
            setDocuments(docs);
          } else {
            console.warn("Documents API returned non-JSON response");
            setDocuments([]);
          }
        } else {
          console.warn("Documents API returned status:", response.status);
          setDocuments([]);
        }
      } catch (error) {
        console.error("Error fetching documents:", error);
        setDocuments([]);
      } finally {
        setLoadingDocuments(false);
      }
    };

    fetchDocuments();
  }, [application.id]);

  const handleActionClick = (action: "forward" | "approve" | "reject") => {
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
      let result;
      if (actionType === "forward") {
        result = await forwardForApproval(
          application.id.toString(),
          currentUserRole
        );
      } else if (actionType === "approve") {
        result = await approveApplication(
          application.id.toString(),
          currentUserRole
        );
      } else {
        result = await rejectApplication(
          application.id.toString(),
          rejectionReason,
          currentUserRole
        );
      }

      if (result.success) {
        toast({
          title: "Sukses",
          description: result.message,
        });
        router.refresh();
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
      }
      setIsAlertOpen(false);
    });
  };

  const getDialogContent = () => {
    switch (actionType) {
      case "forward":
        return {
          title: "Konfirmasi Lanjutkan Permohonan",
          description: `Apakah Anda yakin data permohonan untuk "${application.domainName}" sudah lengkap dan ingin meneruskannya untuk persetujuan final?`,
        };
      case "approve":
        return {
          title: "Konfirmasi Persetujuan",
          description: `Apakah Anda yakin ingin menyetujui permohonan domain "${application.domainName}" dari ${application.opd}? Domain akan segera diaktifkan setelah disetujui.`,
        };
      case "reject":
        return {
          title: "Konfirmasi Penolakan",
          description: `Apakah Anda yakin ingin menolak permohonan domain "${application.domainName}" dari ${application.opd}? Harap berikan alasan penolakan yang jelas di bawah ini.`,
        };
      default:
        return { title: "", description: "" };
    }
  };

  const { title: dialogTitle, description: dialogDescription } =
    getDialogContent();

  // Normalize status to lowercase to match statusConfig keys
  const normalizedStatus =
    application.status.toLowerCase() as keyof typeof statusConfig;
  const currentStatusInfo =
    statusConfig[normalizedStatus] || statusConfig.pending;

  const isSuperAdmin = currentUserRole === "Super Admin";
  const isAdministrator = false; // Role removed

  const renderActionButtons = () => {
    // Super Admin can approve/reject Pending applications
    if (isSuperAdmin && normalizedStatus === "pending") {
      return (
        <>
          <Button
            size="sm"
            variant="destructive"
            className="gap-1 w-full md:w-auto"
            onClick={() => handleActionClick("reject")}
            disabled={isPending}
          >
            {isPending && actionType === "reject" ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <X className="h-3.5 w-3.5" />
            )}
            Tolak
          </Button>
          <Button
            size="sm"
            className="gap-1 w-full md:w-auto"
            onClick={() => handleActionClick("approve")}
            disabled={isPending}
          >
            {isPending && actionType === "approve" ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Check className="h-3.5 w-3.5" />
            )}
            Setujui
          </Button>
        </>
      );
    }

    if (isAdministrator && normalizedStatus === "pending_approval") {
      return (
        <>
          <Button
            size="sm"
            variant="destructive"
            className="gap-1 w-full md:w-auto"
            onClick={() => handleActionClick("reject")}
            disabled={isPending}
          >
            {isPending && actionType === "reject" ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <X className="h-3.5 w-3.5" />
            )}
            Tolak
          </Button>
          <Button
            size="sm"
            className="gap-1 w-full md:w-auto"
            onClick={() => handleActionClick("approve")}
            disabled={isPending}
          >
            {isPending && actionType === "approve" ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Check className="h-3.5 w-3.5" />
            )}
            Setujui (Final)
          </Button>
        </>
      );
    }

    return null;
  };

  return (
    <>
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <BackButton />
          <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
            Detail Permohonan
          </h1>
          <Badge
            variant={currentStatusInfo.variant}
            className={cn("ml-auto sm:ml-0", currentStatusInfo.className)}
          >
            {currentStatusInfo.text}
          </Badge>
          <div className="hidden items-center gap-2 md:ml-auto md:flex">
            {renderActionButtons()}
          </div>
        </div>

        <Card>
          <CardHeader>
            <WorkflowStepper
              currentStep={currentStatusInfo.step}
              isRejected={application.status === "Rejected"}
            />
          </CardHeader>
        </Card>

        {application.status === "Rejected" && application.reason && (
          <Alert variant="destructive">
            <Info className="h-4 w-4" />
            <AlertTitle>Alasan Penolakan</AlertTitle>
            <AlertDescription>{application.reason}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>
              {application.requested_domain_name || application.domainName}
              {application.requested_domain_name && !application.requested_domain_name.includes('.') && '.kalbarprov.go.id'}
            </CardTitle>
            <CardDescription>
              Diajukan oleh {application.submitter_username} dari{" "}
              {application.opd} pada {application.submittedDate}.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-lg mb-2">Detail Pemohon</h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Nama Pemohon</p>
                    <p className="font-medium">
                      {application.submitter_username}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">
                      Organisasi Perangkat Daerah (OPD)
                    </p>
                    <p className="font-medium">{application.opd}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Domain yang Diminta</p>
                    <p className="font-medium">
                      {application.requested_domain_name || application.domainName || "-"}
                      {(application.requested_domain_name && !application.requested_domain_name.includes('.')) && '.kalbarprov.go.id'}
                    </p>
                  </div>
                </div>
              </div>
              <Separator />
              <div>
                <h3 className="font-semibold text-lg mb-2">
                  Tujuan Penggunaan
                </h3>
                <p className="text-sm text-muted-foreground">
                  {(() => {
                    const reason = application.reason || "";
                    const colonIndex = reason.indexOf(":");
                    if (colonIndex === -1) return reason || "Tidak ada tujuan";
                    return reason.substring(0, colonIndex).trim() || "Tidak ada tujuan";
                  })()}
                </p>
              </div>
              <Separator />
              <div>
                <h3 className="font-semibold text-lg mb-2">
                  Deskripsi Permohonan
                </h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {(() => {
                    const reason = application.reason || "";
                    const colonIndex = reason.indexOf(":");
                    if (colonIndex === -1) return "Tidak ada deskripsi";
                    return reason.substring(colonIndex + 1).trim() || "Tidak ada deskripsi";
                  })()}
                </p>
              </div>
              <Separator />
              <div>
                <h3 className="font-semibold text-lg mb-2">
                  Dokumen Pendukung
                </h3>
                <div className="flex flex-col gap-2">
                  {loadingDocuments ? (
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Memuat dokumen...
                    </p>
                  ) : documents && documents.length > 0 ? (
                    documents.map((doc: any) => {
                      console.log('Document:', doc); // Debug log
                      return (
                        <Button
                          key={doc.id}
                          variant="outline"
                          className="justify-start max-w-xs gap-2"
                          onClick={() => {
                            console.log('Clicked document:', doc);
                            console.log('Document URL:', doc.url);
                            console.log('Document file_path:', doc.file_path);
                            
                            // Try different URL fields
                            const url = doc.url || doc.file_path || doc.document_url;
                            
                            if (url) {
                              // If URL is absolute (starts with http/https), open directly
                              if (url.startsWith('http://') || url.startsWith('https://')) {
                                window.open(url, '_blank');
                              } 
                              // If URL is relative or a path, try to construct proper URL
                              else {
                                // Try to open as relative path from API
                                const constructedUrl = url.startsWith('/') ? url : `/${url}`;
                                window.open(constructedUrl, '_blank');
                              }
                            } else {
                              toast({
                                title: "Dokumen Tidak Tersedia",
                                description: "URL dokumen tidak ditemukan. Dokumen mungkin belum diunggah.",
                                variant: "destructive",
                              });
                            }
                          }}
                        >
                          <FileText className="h-4 w-4" />
                          <span className="truncate">{doc.name || doc.file_name || 'Dokumen'}</span>
                          <Download className="h-4 w-4 ml-auto" />
                        </Button>
                      );
                    })
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Tidak ada dokumen
                    </p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 flex items-center justify-end gap-2 md:hidden">
          {renderActionButtons()}
        </div>
      </div>
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{dialogTitle}</AlertDialogTitle>
            <AlertDialogDescription>{dialogDescription}</AlertDialogDescription>
          </AlertDialogHeader>
          {actionType === "reject" && (
            <div className="grid w-full gap-1.5 pt-2">
              <Label htmlFor="rejection-reason">Alasan Penolakan</Label>
              <Textarea
                id="rejection-reason"
                placeholder="Berikan alasan yang jelas mengapa permohonan ini ditolak..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                disabled={isPending}
              />
            </div>
          )}
          <AlertDialogFooter className="pt-4">
            <AlertDialogCancel disabled={isPending}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmAction}
              disabled={isPending}
              className={cn(
                actionType === "reject" &&
                  buttonVariants({ variant: "destructive" })
              )}
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Ya, Lanjutkan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export function ApplicationDetailClient({
  application,
}: {
  application: SubdomainApplication;
}) {
  return (
    <React.Suspense
      fallback={
        <div className="flex w-full h-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <ApplicationDetailContent application={application} />
    </React.Suspense>
  );
}
