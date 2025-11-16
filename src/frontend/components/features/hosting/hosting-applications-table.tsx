"use client";

import type { HostingApplication, User } from "@/backend/models/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { Eye, Check, X, Loader2, Send, Edit } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useState, useTransition, useEffect, Suspense } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  approveHostingApplication,
  rejectHostingApplication,
  forwardHostingForApproval,
} from "@/backend/actions/hosting";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/utils/utils";
import { useRouter, useSearchParams } from "next/navigation";

type HostingApplicationsTableProps = {
  applications: HostingApplication[];
};

type ActionType = "forward" | "approve" | "reject";

const statusConfig = {
  Active: {
    text: "Aktif",
    variant: "secondary" as const,
    className: "bg-green-500 hover:bg-green-600 text-secondary-foreground",
  },
  active: {
    text: "Aktif",
    variant: "secondary" as const,
    className: "bg-green-500 hover:bg-green-600 text-secondary-foreground",
  },
  Deactivated: {
    text: "Belum Aktif",
    variant: "default" as const,
    className: "bg-gray-500 hover:bg-gray-600",
  },
  deactivated: {
    text: "Belum Aktif",
    variant: "default" as const,
    className: "bg-gray-500 hover:bg-gray-600",
  },
  Expired: {
    text: "Kedaluwarsa",
    variant: "destructive" as const,
    className: "bg-amber-500 hover:bg-amber-600",
  },
  expired: {
    text: "Kedaluwarsa",
    variant: "destructive" as const,
    className: "bg-amber-500 hover:bg-amber-600",
  },
};

// Helper function to get status config safely
const getStatusConfig = (status: string) => {
  return (
    statusConfig[status as keyof typeof statusConfig] || {
      text: status || "Unknown",
      variant: "default" as const,
      className: "bg-gray-500 hover:bg-gray-600",
    }
  );
};

const ITEMS_PER_PAGE = 10;

function HostingApplicationsTableContent({
  applications,
}: HostingApplicationsTableProps) {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentUserRole = searchParams.get("role") as User["role"];
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isProcessing, startTransition] = useTransition();
  const [selectedApplication, setSelectedApplication] =
    useState<HostingApplication | null>(null);
  const [actionType, setActionType] = useState<ActionType | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [rejectionReason, setRejectionReason] = useState("");

  const isSuperAdmin = currentUserRole === "Super Admin";
  const isAdministrator = currentUserRole === "Admin Daerah";

  useEffect(() => {
    setCurrentPage(0);
  }, [applications]);

  const totalPages = Math.ceil(applications.length / ITEMS_PER_PAGE);
  const startIndex = currentPage * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentApplications = applications.slice(startIndex, endIndex);

  const handleViewDetail = async (applicationId: number) => {
    try {
      const response = await fetch(
        `/api/hosting-applications/${applicationId}`
      );
      if (response.ok) {
        const data = await response.json();
        setSelectedApplication(data);
        setIsDetailOpen(true);
      }
    } catch (error) {
      console.error("Error fetching application detail:", error);
      toast({
        title: "Error",
        description: "Gagal memuat detail hosting",
        variant: "destructive",
      });
    }
  };

  const handleActionClick = (
    application: HostingApplication,
    action: ActionType
  ) => {
    setSelectedApplication(application);
    setActionType(action);
    setRejectionReason("");
    setIsAlertOpen(true);
  };

  const handleSubmitHosting = () => {
    toast({
      title: "Info",
      description: "Fitur pengajuan hosting akan segera tersedia",
    });
    setIsDetailOpen(false);
  };

  const handleEditInfo = () => {
    if (selectedApplication) {
      setIsDetailOpen(false);
      router.push(
        `/hosting/${selectedApplication.id}/edit?role=${currentUserRole}`
      );
    }
  };

  const handleConfirmAction = async () => {
    if (!selectedApplication || !actionType || !currentUserRole) return;

    startTransition(async () => {
      let result;
      if (actionType === "approve") {
        // Aktivkan hosting
        result = await approveHostingApplication(
          String(selectedApplication.id),
          currentUserRole
        );
      } else if (actionType === "reject") {
        // Nonaktifkan hosting
        result = await rejectHostingApplication(
          String(selectedApplication.id),
          "Hosting dinonaktifkan oleh administrator",
          currentUserRole
        );
      }

      if (result && result.success) {
        toast({
          title: "Sukses",
          description: result.message,
        });
        router.refresh();
      } else {
        toast({
          title: "Error",
          description: result?.message || "Terjadi kesalahan",
          variant: "destructive",
        });
      }

      setIsAlertOpen(false);
      setSelectedApplication(null);
      setActionType(null);
    });
  };

  const getDialogContent = () => {
    if (!selectedApplication || !actionType)
      return { title: "", description: "" };
    switch (actionType) {
      case "approve":
        return {
          title: "Konfirmasi Aktivasi Hosting",
          description: `Aktifkan hosting untuk "${selectedApplication.applicationName}" pada domain ${selectedApplication.domainName}?`,
        };
      case "reject":
        return {
          title: "Konfirmasi Nonaktifkan Hosting",
          description: `Nonaktifkan hosting untuk aplikasi "${selectedApplication.applicationName}"? Hosting akan berhenti dan tidak dapat diakses.`,
        };
      default:
        return { title: "", description: "" };
    }
  };

  const { title: dialogTitle, description: dialogDescription } =
    getDialogContent();

  const getStatusText = (status: string) => {
    const statusLower = status?.toLowerCase();
    if (statusLower === "active") return "Aktif";
    if (statusLower === "deactivated") return "Belum Aktif";
    if (statusLower === "expired") return "Kedaluwarsa";
    return status || "Unknown";
  };

  const getStatusVariant = (status: string) => {
    const statusLower = status?.toLowerCase();
    if (statusLower === "active") return "secondary";
    if (statusLower === "deactivated") return "default";
    if (statusLower === "expired") return "destructive";
    return "default";
  };

  const isDeactivated = (status: string) => {
    return status?.toLowerCase() === "deactivated";
  };

  const isExpired = (status: string) => {
    return status?.toLowerCase() === "expired";
  };

  const calculateRemainingDuration = (activatedAt: string, status: string) => {
    if (!activatedAt || isDeactivated(status)) {
      return "Hosting belum aktif";
    }

    if (isExpired(status)) {
      return "Sudah kedaluwarsa";
    }

    try {
      // Parse tanggal aktivasi
      const activationDate = new Date(activatedAt);

      // Hitung tanggal berakhir (1 tahun dari aktivasi)
      const expiryDate = new Date(activationDate);
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);

      // Tanggal sekarang
      const now = new Date();

      // Hitung selisih dalam milidetik
      const diffTime = expiryDate.getTime() - now.getTime();

      // Jika sudah lewat, kembalikan kedaluwarsa
      if (diffTime <= 0) {
        return "Sudah kedaluwarsa";
      }

      // Hitung hari tersisa
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // Hitung bulan dan hari
      const months = Math.floor(diffDays / 30);
      const days = diffDays % 30;

      if (months > 0) {
        return `${months} bulan ${days} hari lagi`;
      } else {
        return `${days} hari lagi`;
      }
    } catch (error) {
      return "Format tanggal tidak valid";
    }
  };

  return (
    <TooltipProvider>
      <div className="border rounded-lg">
        <div className="relative w-full overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Aplikasi</TableHead>
                <TableHead>Domain</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tgl Pengajuan</TableHead>
                <TableHead className="text-center">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentApplications.length > 0 ? (
                currentApplications.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell className="font-medium">
                      {app.applicationName}
                    </TableCell>
                    <TableCell>{app.domainName}</TableCell>
                    <TableCell>
                      <Badge
                        variant={getStatusConfig(app.status).variant}
                        className={cn(getStatusConfig(app.status).className)}
                      >
                        {getStatusConfig(app.status).text}
                      </Badge>
                    </TableCell>
                    <TableCell>{app.submittedDate}</TableCell>

                    <TableCell>
                      <div className="flex items-center justify-center gap-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleViewDetail(app.id)}
                              disabled={isProcessing}
                            >
                              <Eye className="h-4 w-4" />
                              <span className="sr-only">Lihat Detail</span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Lihat Detail</p>
                          </TooltipContent>
                        </Tooltip>
                        {isSuperAdmin &&
                          (app.status === "Deactivated" ||
                            app.status === "deactivated") && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="secondary"
                                  size="icon"
                                  onClick={() =>
                                    handleActionClick(app, "approve")
                                  }
                                  disabled={isProcessing}
                                >
                                  <Check className="h-4 w-4" />
                                  <span className="sr-only">Aktifkan</span>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Aktifkan Hosting</p>
                              </TooltipContent>
                            </Tooltip>
                          )}
                        {isSuperAdmin &&
                          (app.status === "Active" ||
                            app.status === "active") && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="destructive"
                                  size="icon"
                                  onClick={() =>
                                    handleActionClick(app, "reject")
                                  }
                                  disabled={isProcessing}
                                >
                                  <X className="h-4 w-4" />
                                  <span className="sr-only">Nonaktifkan</span>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Nonaktifkan Hosting</p>
                              </TooltipContent>
                            </Tooltip>
                          )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    Tidak ada hasil yang ditemukan.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-end space-x-2 p-4 border-t">
            <span className="text-sm text-muted-foreground">
              Halaman {currentPage + 1} dari {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}
              disabled={currentPage === 0 || isProcessing}
            >
              Sebelumnya
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1))
              }
              disabled={currentPage >= totalPages - 1 || isProcessing}
            >
              Berikutnya
            </Button>
          </div>
        )}
      </div>
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{dialogTitle}</AlertDialogTitle>
            <AlertDialogDescription>{dialogDescription}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="pt-4">
            <AlertDialogCancel disabled={isProcessing}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmAction}
              disabled={isProcessing}
              className={cn(
                actionType === "reject" &&
                  buttonVariants({ variant: "destructive" })
              )}
            >
              {isProcessing && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Ya, Lanjutkan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detail Informasi Hosting</DialogTitle>
            <DialogDescription>
              Informasi lengkap hosting dan domain yang digunakan
            </DialogDescription>
          </DialogHeader>

          {selectedApplication && (
            <div className="space-y-6 py-4">
              {/* Informasi Domain */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Informasi Domain</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-sm font-medium text-muted-foreground">
                      Nama Domain:
                    </span>
                    <span className="col-span-2 text-sm">
                      {(selectedApplication as any).domain_name ||
                        selectedApplication.domainName}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-sm font-medium text-muted-foreground">
                      Status Domain:
                    </span>
                    <span className="col-span-2">
                      <Badge
                        variant={getStatusVariant(
                          (selectedApplication as any).domain_status ||
                            selectedApplication.status
                        )}
                        className={cn(
                          getStatusConfig(
                            (selectedApplication as any).domain_status ||
                              selectedApplication.status
                          ).className
                        )}
                      >
                        {getStatusText(
                          (selectedApplication as any).domain_status ||
                            selectedApplication.status
                        )}
                      </Badge>
                    </span>
                  </div>
                  {(selectedApplication as any).activated_at && (
                    <div className="grid grid-cols-3 gap-2">
                      <span className="text-sm font-medium text-muted-foreground">
                        Tanggal Aktivasi:
                      </span>
                      <span className="col-span-2 text-sm">
                        {(selectedApplication as any).activated_at}
                      </span>
                    </div>
                  )}
                  {(selectedApplication as any).expires_at && (
                    <div className="grid grid-cols-3 gap-2">
                      <span className="text-sm font-medium text-muted-foreground">
                        Tanggal Berakhir:
                      </span>
                      <span className="col-span-2 text-sm">
                        {(selectedApplication as any).expires_at}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Informasi Hosting */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Informasi Hosting</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-sm font-medium text-muted-foreground">
                      Nama Aplikasi:
                    </span>
                    <span className="col-span-2 text-sm font-medium">
                      {selectedApplication.applicationName}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-sm font-medium text-muted-foreground">
                      Status Hosting:
                    </span>
                    <span className="col-span-2">
                      <Badge
                        variant={getStatusVariant(selectedApplication.status)}
                        className={cn(
                          getStatusConfig(selectedApplication.status).className
                        )}
                      >
                        {getStatusText(selectedApplication.status)}
                      </Badge>
                    </span>
                  </div>
                  {(selectedApplication as any).storage_capacity && (
                    <div className="grid grid-cols-3 gap-2">
                      <span className="text-sm font-medium text-muted-foreground">
                        Kapasitas Storage:
                      </span>
                      <span className="col-span-2 text-sm">
                        {(selectedApplication as any).storage_capacity}
                      </span>
                    </div>
                  )}
                  {(selectedApplication as any).bandwidth && (
                    <div className="grid grid-cols-3 gap-2">
                      <span className="text-sm font-medium text-muted-foreground">
                        Bandwidth:
                      </span>
                      <span className="col-span-2 text-sm">
                        {(selectedApplication as any).bandwidth}
                      </span>
                    </div>
                  )}
                  {(selectedApplication as any).server_type && (
                    <div className="grid grid-cols-3 gap-2">
                      <span className="text-sm font-medium text-muted-foreground">
                        Tipe Server:
                      </span>
                      <span className="col-span-2 text-sm">
                        {(selectedApplication as any).server_type}
                      </span>
                    </div>
                  )}
                  {selectedApplication.framework && (
                    <div className="grid grid-cols-3 gap-2">
                      <span className="text-sm font-medium text-muted-foreground">
                        Framework:
                      </span>
                      <span className="col-span-2 text-sm">
                        {selectedApplication.framework}
                      </span>
                    </div>
                  )}
                  {selectedApplication.description && (
                    <div className="grid grid-cols-3 gap-2">
                      <span className="text-sm font-medium text-muted-foreground">
                        Deskripsi:
                      </span>
                      <span className="col-span-2 text-sm">
                        {selectedApplication.description}
                      </span>
                    </div>
                  )}
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-sm font-medium text-muted-foreground">
                      OPD:
                    </span>
                    <span className="col-span-2 text-sm">
                      {selectedApplication.opd}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-sm font-medium text-muted-foreground">
                      Pengaju:
                    </span>
                    <span className="col-span-2 text-sm">
                      {selectedApplication.applicantName}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-sm font-medium text-muted-foreground">
                      Durasi Aktif Domain:
                    </span>
                    <span className="col-span-2 text-sm font-medium">
                      {calculateRemainingDuration(
                        (selectedApplication as any).activated_at || "",
                        selectedApplication.status
                      )}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Peringatan khusus untuk status Expired */}
          {selectedApplication && isExpired(selectedApplication.status) && (
            <div className="px-6 pb-4">
              <Card className="border-amber-500 bg-amber-50 dark:bg-amber-950">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <div className="rounded-full bg-amber-500 p-2 text-white">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-amber-900 dark:text-amber-100 mb-2">
                        Hosting Kedaluwarsa
                      </h4>
                      <p className="text-sm text-amber-800 dark:text-amber-200">
                        Hosting untuk aplikasi ini telah kedaluwarsa. Untuk
                        mengaktifkan kembali hosting ini, silakan lakukan
                        reaktivasi melalui menu <strong>Reaktivasi</strong>.
                      </p>
                      <p className="text-sm text-amber-800 dark:text-amber-200 mt-2">
                        Hubungi administrator untuk informasi lebih lanjut
                        mengenai proses reaktivasi.
                      </p>
                      <div className="mt-4">
                        <Button
                          variant="default"
                          className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                          onClick={() => {
                            setIsDetailOpen(false);
                            window.location.href = "/reaktivasi";
                          }}
                        >
                          Reaktivasi Domain
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
              Tutup
            </Button>
            {selectedApplication &&
              !isExpired(selectedApplication.status) &&
              isDeactivated(selectedApplication.status) &&
              isAdministrator && (
                <>
                  <Button variant="secondary" onClick={handleEditInfo}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Informasi
                  </Button>
                  <Button onClick={handleSubmitHosting}>
                    <Send className="h-4 w-4 mr-2" />
                    Ajukan Hosting
                  </Button>
                </>
              )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}

export function HostingApplicationsTable({
  applications,
}: HostingApplicationsTableProps) {
  return (
    <Suspense
      fallback={
        <div className="flex w-full h-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      }
    >
      <HostingApplicationsTableContent applications={applications} />
    </Suspense>
  );
}
