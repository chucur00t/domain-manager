"use client";

import type { SubdomainApplication, User } from "@/backend/models/types";
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
import { Eye, Loader2, Edit, FileText, X, Upload } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import React from "react";
import { cn } from "@/utils/utils";

type ApplicationsTableProps = {
  applications: SubdomainApplication[];
};

// Simplified status - hanya 3 status untuk Admin Daerah
const statusConfig = {
  pending: {
    text: "Pending",
    variant: "default" as const,
    className: "bg-amber-500 hover:bg-amber-600",
  },
  pending_review: {
    text: "Pending",
    variant: "default" as const,
    className: "bg-amber-500 hover:bg-amber-600",
  },
  pending_approval: {
    text: "Pending",
    variant: "default" as const,
    className: "bg-amber-500 hover:bg-amber-600",
  },
  approved: {
    text: "Disetujui",
    variant: "secondary" as const,
    className: "bg-green-500 hover:bg-green-600 text-white",
  },
  rejected: {
    text: "Ditolak",
    variant: "destructive" as const,
    className: "bg-red-500 hover:bg-red-600",
  },
  // Database might use different case
  Pending: {
    text: "Pending",
    variant: "default" as const,
    className: "bg-amber-500 hover:bg-amber-600",
  },
  Approved: {
    text: "Disetujui",
    variant: "secondary" as const,
    className: "bg-green-500 hover:bg-green-600 text-white",
  },
  Rejected: {
    text: "Ditolak",
    variant: "destructive" as const,
    className: "bg-red-500 hover:bg-red-600",
  },
};

// Helper function to get status config safely
const getStatusConfig = (status: string) => {
  return (
    statusConfig[status as keyof typeof statusConfig] || {
      text: "Pending",
      variant: "default" as const,
      className: "bg-amber-500 hover:bg-amber-600",
    }
  );
};

const ITEMS_PER_PAGE = 10;

function ApplicationsTableContent({ applications }: ApplicationsTableProps) {
  const searchParams = useSearchParams();
  const currentUserRole = searchParams.get("role") as User["role"] | null;
  const [currentPage, setCurrentPage] = useState(0);

  // Dialog states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState<SubdomainApplication | null>(
    null
  );
  const [isEditing, setIsEditing] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    domainName: "",
    description: "",
    purpose: "",
  });
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setCurrentPage(0);
  }, [applications]);

  const totalPages = Math.ceil(applications.length / ITEMS_PER_PAGE);
  const startIndex = currentPage * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentApplications = applications.slice(startIndex, endIndex);

  // Handle open dialog with application details
  const handleViewDetails = (app: SubdomainApplication) => {
    setSelectedApp(app);
    setFormData({
      domainName: app.domainName,
      description: app.description || "",
      purpose: app.purpose || "",
    });
    setIsEditing(false);
    setIsDialogOpen(true);
  };

  // Handle edit mode
  const handleEdit = () => {
    setIsEditing(true);
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    if (selectedApp) {
      setFormData({
        domainName: selectedApp.domainName,
        description: selectedApp.description || "",
        purpose: selectedApp.purpose || "",
      });
    }
    setIsEditing(false);
    setUploadedFiles([]);
  };

  // Handle input change
  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newFiles = Array.from(files);
    setUploadedFiles((prev) => [...prev, ...newFiles]);
  };

  // Handle remove file
  const handleRemoveFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Handle save changes
  const handleSave = async () => {
    setIsSaving(true);
    try {
      // TODO: Implement API call to update application
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call

      // Update local state
      if (selectedApp) {
        selectedApp.domainName = formData.domainName;
        selectedApp.description = formData.description;
        selectedApp.purpose = formData.purpose;
      }

      setIsEditing(false);
      alert("Perubahan berhasil disimpan");
    } catch (error) {
      alert("Gagal menyimpan perubahan");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <div className="border rounded-lg">
        <div className="relative w-full overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Subdomain</TableHead>
                <TableHead>Tanggal Pengajuan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentApplications.length > 0 ? (
                currentApplications.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell className="font-medium">
                      {app.domainName}
                    </TableCell>
                    <TableCell>{app.submittedDate}</TableCell>
                    <TableCell>
                      <Badge
                        variant={getStatusConfig(app.status).variant}
                        className={cn(getStatusConfig(app.status).className)}
                      >
                        {getStatusConfig(app.status).text}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(app)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Detail
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
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
              disabled={currentPage === 0}
            >
              Sebelumnya
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1))
              }
              disabled={currentPage >= totalPages - 1}
            >
              Berikutnya
            </Button>
          </div>
        )}
      </div>

      {/* Detail & Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Edit Pengajuan Domain" : "Detail Pengajuan Domain"}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? "Ubah informasi pengajuan domain Anda"
                : "Informasi lengkap pengajuan domain"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Nama Domain */}
            <div className="space-y-2">
              <Label htmlFor="domainName">Nama Domain</Label>
              {isEditing ? (
                <Input
                  id="domainName"
                  value={formData.domainName}
                  onChange={(e) =>
                    handleInputChange("domainName", e.target.value)
                  }
                  placeholder="contoh.kalbarprov.go.id"
                />
              ) : (
                <p className="text-sm p-2 bg-muted rounded-md">
                  {formData.domainName}
                </p>
              )}
            </div>

            {/* Deskripsi */}
            <div className="space-y-2">
              <Label htmlFor="description">Deskripsi</Label>
              {isEditing ? (
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  placeholder="Jelaskan tentang domain yang diajukan"
                  rows={4}
                />
              ) : (
                <p className="text-sm p-2 bg-muted rounded-md whitespace-pre-wrap">
                  {formData.description || "-"}
                </p>
              )}
            </div>

            {/* Tujuan Penggunaan */}
            <div className="space-y-2">
              <Label htmlFor="purpose">Tujuan Penggunaan</Label>
              {isEditing ? (
                <Textarea
                  id="purpose"
                  value={formData.purpose}
                  onChange={(e) => handleInputChange("purpose", e.target.value)}
                  placeholder="Jelaskan tujuan penggunaan domain"
                  rows={4}
                />
              ) : (
                <p className="text-sm p-2 bg-muted rounded-md whitespace-pre-wrap">
                  {formData.purpose || "-"}
                </p>
              )}
            </div>

            {/* Dokumen Pendukung */}
            <div className="space-y-2">
              <Label>Dokumen Pendukung</Label>
              {isEditing ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Input
                      type="file"
                      onChange={handleFileUpload}
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      multiple
                      className="hidden"
                      id="file-upload"
                    />
                    <Label
                      htmlFor="file-upload"
                      className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md cursor-pointer hover:bg-primary/90"
                    >
                      <Upload className="h-4 w-4" />
                      Upload File
                    </Label>
                    <span className="text-xs text-muted-foreground">
                      PDF, DOC, JPG, PNG (Max 5MB)
                    </span>
                  </div>

                  {uploadedFiles.length > 0 && (
                    <div className="space-y-2">
                      {uploadedFiles.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 bg-muted rounded-md"
                        >
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            <span className="text-sm">{file.name}</span>
                            <span className="text-xs text-muted-foreground">
                              ({(file.size / 1024).toFixed(1)} KB)
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveFile(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  {selectedApp?.documents &&
                  selectedApp.documents.length > 0 ? (
                    selectedApp.documents.map((doc: any, index: number) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 p-2 bg-muted rounded-md"
                      >
                        <FileText className="h-4 w-4" />
                        <span className="text-sm">
                          {doc.name || `Dokumen ${index + 1}`}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Tidak ada dokumen
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Status dan Info Tambahan */}
            {!isEditing && selectedApp && (
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <Label className="text-muted-foreground">ID Pengajuan</Label>
                  <p className="text-sm mt-1 font-mono">#{selectedApp.id}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <Badge
                    variant={getStatusConfig(selectedApp.status).variant}
                    className={cn(
                      getStatusConfig(selectedApp.status).className,
                      "mt-1"
                    )}
                  >
                    {getStatusConfig(selectedApp.status).text}
                  </Badge>
                </div>
                <div>
                  <Label className="text-muted-foreground">
                    Tanggal Pengajuan
                  </Label>
                  <p className="text-sm mt-1">{selectedApp.submittedDate}</p>
                </div>
                {selectedApp.opd && (
                  <div>
                    <Label className="text-muted-foreground">OPD</Label>
                    <p className="text-sm mt-1">{selectedApp.opd}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            {isEditing ? (
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
                    "Simpan Perubahan"
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
                {selectedApp?.status !== "approved" &&
                  selectedApp?.status !== "Approved" && (
                    <Button onClick={handleEdit}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                  )}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function ApplicationsTable(props: ApplicationsTableProps) {
  return (
    <Suspense
      fallback={
        <div className="flex w-full h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      }
    >
      <ApplicationsTableContent {...props} />
    </Suspense>
  );
}
