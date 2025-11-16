"use client";

import React, { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Eye, Edit, Upload, FileText, Loader2, Server } from "lucide-react";
import { cn } from "@/lib/utils";
import type { HostingApplication, User } from "@/backend/models/types";

interface HostingTableAdminDaerahProps {
  applications: HostingApplication[];
}

const ITEMS_PER_PAGE = 10;

type HostingStatus =
  | "active"
  | "expired"
  | "suspended"
  | "pending"
  | "rejected";

const statusConfig: Record<
  HostingStatus,
  { text: string; variant: any; className: string }
> = {
  active: {
    text: "Aktif",
    variant: "default",
    className: "bg-green-500 hover:bg-green-600",
  },
  expired: {
    text: "Kedaluwarsa",
    variant: "secondary",
    className: "bg-orange-500 hover:bg-orange-600 text-white",
  },
  suspended: {
    text: "Ditangguhkan",
    variant: "secondary",
    className: "bg-red-500 hover:bg-red-600 text-white",
  },
  pending: {
    text: "Pending",
    variant: "secondary",
    className: "bg-yellow-500 hover:bg-yellow-600 text-white",
  },
  rejected: {
    text: "Ditolak",
    variant: "destructive",
    className: "",
  },
};

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
}

function HostingTableAdminDaerahContent({
  applications,
}: HostingTableAdminDaerahProps) {
  const searchParams = useSearchParams();
  const currentUserRole = searchParams.get("role") as User["role"] | null;

  const [currentPage, setCurrentPage] = useState(0);
  const [selectedApplication, setSelectedApplication] =
    useState<HostingApplication | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form states for edit mode
  const [formData, setFormData] = useState({
    applicationName: "",
    domainName: "",
    framework: "",
    description: "",
    purpose: "",
    expectedUsers: "",
    storage: "",
    bandwidth: "",
  });

  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  const totalPages = Math.ceil(applications.length / ITEMS_PER_PAGE);
  const startIndex = currentPage * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentApplications = applications.slice(startIndex, endIndex);

  const handleViewDetail = (app: HostingApplication) => {
    setSelectedApplication(app);
    setFormData({
      applicationName: app.applicationName || "",
      domainName: app.domainName || "",
      framework: app.framework || "",
      description: app.description || "",
      purpose: "",
      expectedUsers: "",
      storage: app.storage_capacity || "",
      bandwidth: app.bandwidth || "",
    });
    setUploadedFiles([]);
    setIsEditMode(false);
    setIsDialogOpen(true);
  };

  const handleEdit = () => {
    setIsEditMode(true);
  };

  const handleCancelEdit = () => {
    if (selectedApplication) {
      setFormData({
        applicationName: selectedApplication.applicationName || "",
        domainName: selectedApplication.domainName || "",
        framework: selectedApplication.framework || "",
        description: selectedApplication.description || "",
        purpose: "",
        expectedUsers: "",
        storage: selectedApplication.storage_capacity || "",
        bandwidth: selectedApplication.bandwidth || "",
      });
      setUploadedFiles([]);
    }
    setIsEditMode(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Here you would call the API to update the application
      console.log("Saving:", formData, uploadedFiles);

      setIsEditMode(false);
      // Refresh data or update local state
    } catch (error) {
      console.error("Error saving:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const uploadedFile: UploadedFile = {
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        size: file.size,
        type: file.type,
      };
      setUploadedFiles((prev) => [...prev, uploadedFile]);
    });

    event.target.value = "";
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles((prev) => prev.filter((file) => file.id !== fileId));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Map application status to hosting status
  const getHostingStatus = (app: HostingApplication | null): HostingStatus => {
    if (!app) return "pending";
    // Jika ini adalah approved domain (belum ada hosting), status pending
    if (app.status === "approved") return "pending";
    // Jika sudah ada hosting
    if (app.status === "Active") return "active";
    if (app.status === "Deactivated") return "suspended";
    // Default pending untuk domain yang baru disetujui
    return "pending";
  };

  const canEdit = (status: HostingStatus) => {
    return status !== "active" && status !== "rejected";
  };

  return (
    <>
      <div className="border rounded-lg">
        <div className="relative w-full overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Aplikasi</TableHead>
                <TableHead>Nama Domain</TableHead>
                <TableHead>Tanggal Pengajuan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentApplications.length > 0 ? (
                currentApplications.map((app) => {
                  const hostingStatus = getHostingStatus(app);
                  return (
                    <TableRow key={app.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Server className="h-4 w-4 text-muted-foreground" />
                          {app.applicationName}
                        </div>
                      </TableCell>
                      <TableCell>{app.domainName || "-"}</TableCell>
                      <TableCell>
                        {app.submittedDate
                          ? formatDate(app.submittedDate)
                          : formatDate(app.activated_at)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={statusConfig[hostingStatus].variant}
                          className={cn(statusConfig[hostingStatus].className)}
                        >
                          {statusConfig[hostingStatus].text}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDetail(app)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Detail
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-8 text-muted-foreground"
                  >
                    Tidak ada permohonan hosting
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-4 border-t">
            <p className="text-sm text-muted-foreground">
              Menampilkan {startIndex + 1} -{" "}
              {Math.min(endIndex, applications.length)} dari{" "}
              {applications.length} permohonan
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
                disabled={currentPage === 0}
              >
                Sebelumnya
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1))
                }
                disabled={currentPage === totalPages - 1}
              >
                Selanjutnya
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Detail/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditMode
                ? "Edit Permohonan Hosting"
                : "Detail Permohonan Hosting"}
            </DialogTitle>
            <DialogDescription>
              {isEditMode
                ? "Ubah informasi permohonan hosting Anda"
                : "Informasi lengkap permohonan hosting"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Nama Aplikasi */}
            <div className="space-y-2">
              <Label>Nama Aplikasi</Label>
              {isEditMode ? (
                <Input
                  value={formData.applicationName}
                  onChange={(e) =>
                    handleInputChange("applicationName", e.target.value)
                  }
                />
              ) : (
                <p className="text-sm">
                  {selectedApplication?.applicationName}
                </p>
              )}
            </div>

            {/* Nama Domain */}
            <div className="space-y-2">
              <Label>Nama Domain</Label>
              {isEditMode ? (
                <Input
                  value={formData.domainName}
                  onChange={(e) =>
                    handleInputChange("domainName", e.target.value)
                  }
                  placeholder="nama-domain.kalbarprov.go.id"
                />
              ) : (
                <p className="text-sm">
                  {selectedApplication?.domainName || "-"}
                </p>
              )}
            </div>

            {/* Framework */}
            <div className="space-y-2">
              <Label>Framework/Teknologi</Label>
              {isEditMode ? (
                <Select
                  value={formData.framework}
                  onValueChange={(value) =>
                    handleInputChange("framework", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="laravel">Laravel (PHP)</SelectItem>
                    <SelectItem value="codeigniter">
                      CodeIgniter (PHP)
                    </SelectItem>
                    <SelectItem value="nodejs">Node.js (Express)</SelectItem>
                    <SelectItem value="nextjs">Next.js (React)</SelectItem>
                    <SelectItem value="vue">Vue.js</SelectItem>
                    <SelectItem value="django">Django (Python)</SelectItem>
                    <SelectItem value="spring">Spring Boot (Java)</SelectItem>
                    <SelectItem value="net">ASP.NET (C#)</SelectItem>
                    <SelectItem value="golang">Golang</SelectItem>
                    <SelectItem value="static">
                      Static HTML/WordPress
                    </SelectItem>
                    <SelectItem value="lainnya">Lainnya</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-sm">
                  {selectedApplication?.framework || "-"}
                </p>
              )}
            </div>

            {/* Expected Users */}
            <div className="space-y-2">
              <Label>Jumlah Pengguna yang Diharapkan</Label>
              {isEditMode ? (
                <Select
                  value={formData.expectedUsers}
                  onValueChange={(value) =>
                    handleInputChange("expectedUsers", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-10">1-10 pengguna</SelectItem>
                    <SelectItem value="11-50">11-50 pengguna</SelectItem>
                    <SelectItem value="51-100">51-100 pengguna</SelectItem>
                    <SelectItem value="101-500">101-500 pengguna</SelectItem>
                    <SelectItem value="501-1000">501-1000 pengguna</SelectItem>
                    <SelectItem value="1000+">
                      Lebih dari 1000 pengguna
                    </SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-sm">
                  {selectedApplication?.expectedUsers || "-"}
                </p>
              )}
            </div>

            {/* Storage */}
            <div className="space-y-2">
              <Label>Kebutuhan Storage</Label>
              {isEditMode ? (
                <Select
                  value={formData.storage}
                  onValueChange={(value) => handleInputChange("storage", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1gb">1 GB</SelectItem>
                    <SelectItem value="5gb">5 GB</SelectItem>
                    <SelectItem value="10gb">10 GB</SelectItem>
                    <SelectItem value="25gb">25 GB</SelectItem>
                    <SelectItem value="50gb">50 GB</SelectItem>
                    <SelectItem value="100gb+">Lebih dari 100 GB</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-sm">
                  {selectedApplication?.storage_capacity || "-"}
                </p>
              )}
            </div>

            {/* Bandwidth */}
            <div className="space-y-2">
              <Label>Kebutuhan Bandwidth per Bulan</Label>
              {isEditMode ? (
                <Select
                  value={formData.bandwidth}
                  onValueChange={(value) =>
                    handleInputChange("bandwidth", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10gb">10 GB</SelectItem>
                    <SelectItem value="50gb">50 GB</SelectItem>
                    <SelectItem value="100gb">100 GB</SelectItem>
                    <SelectItem value="500gb">500 GB</SelectItem>
                    <SelectItem value="1tb">1 TB</SelectItem>
                    <SelectItem value="5tb+">Lebih dari 5 TB</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-sm">
                  {selectedApplication?.bandwidth || "-"}
                </p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label>Deskripsi dan Alasan</Label>
              {isEditMode ? (
                <Textarea
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  rows={4}
                />
              ) : (
                <p className="text-sm whitespace-pre-wrap">
                  {selectedApplication?.description}
                </p>
              )}
            </div>

            {/* Documents */}
            <div className="space-y-2">
              <Label>Dokumen Pendukung</Label>
              {isEditMode ? (
                <>
                  <div className="border-2 border-dashed rounded-lg p-4">
                    <label
                      htmlFor="file-upload-edit"
                      className="cursor-pointer"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <Upload className="h-8 w-8 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          Klik untuk upload file
                        </span>
                        <Button type="button" variant="outline" size="sm">
                          Pilih File
                        </Button>
                      </div>
                      <input
                        id="file-upload-edit"
                        type="file"
                        className="sr-only"
                        multiple
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                        onChange={handleFileUpload}
                      />
                    </label>
                  </div>
                  {uploadedFiles.length > 0 && (
                    <div className="space-y-2 mt-2">
                      {uploadedFiles.map((file) => (
                        <div
                          key={file.id}
                          className="flex items-center justify-between bg-gray-50 p-2 rounded"
                        >
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            <span className="text-sm">{file.name}</span>
                            <span className="text-xs text-gray-500">
                              ({formatFileSize(file.size)})
                            </span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(file.id)}
                          >
                            Hapus
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Tidak ada dokumen
                  </p>
                </div>
              )}
            </div>

            {/* Status and Date Info */}
            {!isEditMode && (
              <>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <div>
                    <Badge
                      variant={
                        statusConfig[getHostingStatus(selectedApplication!)]
                          .variant
                      }
                      className={cn(
                        statusConfig[getHostingStatus(selectedApplication!)]
                          .className
                      )}
                    >
                      {
                        statusConfig[getHostingStatus(selectedApplication!)]
                          .text
                      }
                    </Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Tanggal Pengajuan</Label>
                  <p className="text-sm">
                    {selectedApplication
                      ? formatDate(selectedApplication.submittedDate)
                      : "-"}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>OPD</Label>
                  <p className="text-sm">{selectedApplication?.opd}</p>
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            {isEditMode ? (
              <>
                <Button
                  variant="outline"
                  onClick={handleCancelEdit}
                  disabled={isSaving}
                >
                  Batal
                </Button>
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    "Simpan"
                  )}
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Tutup
                </Button>
                {selectedApplication &&
                  canEdit(getHostingStatus(selectedApplication)) && (
                    <Button onClick={handleEdit}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                  )}
                {selectedApplication && (
                  <Button onClick={handleSave}>
                    <Server className="mr-2 h-4 w-4" />
                    Ajukan Hosting
                  </Button>
                )}
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function HostingTableAdminDaerah(props: HostingTableAdminDaerahProps) {
  return (
    <React.Suspense fallback={<div>Loading...</div>}>
      <HostingTableAdminDaerahContent {...props} />
    </React.Suspense>
  );
}
