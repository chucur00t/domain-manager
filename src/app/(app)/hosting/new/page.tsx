"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  ArrowLeft,
  Upload,
  FileText,
  AlertCircle,
  CheckCircle,
  Server,
  X,
} from "lucide-react";
import Link from "next/link";
import type { User } from "@/backend/models/types";
import { MOCK_USERS, MOCK_OPDS } from "@/backend/utils/mock-data";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
}

export default function NewHostingApplicationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const role = searchParams.get("role") as User["role"] | null;

  // Form state
  const [formData, setFormData] = useState({
    applicantName: "",
    opd: "",
    applicationName: "",
    description: "",
    purpose: "",
    domainName: "",
    technicalSpecs: {
      estimatedUsers: "",
      storageNeeds: "",
      databaseType: "",
    },
  });

  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Get current user info and auto-fill for Admin Daerah
  useEffect(() => {
    if (role === "Admin Daerah") {
      const currentUser = MOCK_USERS.find((user) => user.role === role);
      if (currentUser) {
        setFormData((prev) => ({
          ...prev,
          applicantName: currentUser.name || "",
          opd: currentUser.opd || "",
        }));
      }
    }
  }, [role]);

  const handleInputChange = (field: string, value: string) => {
    if (field.includes(".")) {
      const [parent, child] = field.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof typeof prev] as any),
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      // Validate file type
      const allowedTypes = [
        "application/pdf",
        "image/jpeg",
        "image/png",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
      if (!allowedTypes.includes(file.type)) {
        setSubmitError(
          `File ${file.name} tidak didukung. Hanya PDF, JPG, PNG, dan DOC/DOCX yang diperbolehkan.`
        );
        return;
      }

      // Validate file size (10MB for hosting)
      const maxSize = 10;
      if (file.size > maxSize * 1024 * 1024) {
        setSubmitError(
          `File ${file.name} terlalu besar. Maksimal ${maxSize}MB.`
        );
        return;
      }

      const uploadedFile: UploadedFile = {
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        size: file.size,
        type: file.type,
      };

      setUploadedFiles((prev) => [...prev, uploadedFile]);
    });

    // Clear file input
    event.target.value = "";
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles((prev) => prev.filter((file) => file.id !== fileId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('=== FORM SUBMIT STARTED ===');
    console.log('Form Data:', JSON.stringify(formData, null, 2));
    console.log('Uploaded Files:', uploadedFiles);
    
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // No validation - just try to submit
      const applicationData = {
        applicationName: formData.applicationName || "Test Application",
        domainName: formData.domainName || "test",
        applicantName: formData.applicantName || "Test User",
        opd: formData.opd || "Test OPD",
        description: formData.description || "Test description",
        purpose: formData.purpose || "Test purpose",
        technicalSpecs: formData.technicalSpecs,
        documents: uploadedFiles,
      };

      console.log('Sending data:', applicationData);

      const response = await fetch("/api/hosting-applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(applicationData),
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const error = await response.json();
        console.error('Error response:', error);
        throw new Error(error.message || "Gagal mengajukan permohonan");
      }

      const result = await response.json();
      console.log('Success response:', result);

      setSubmitSuccess(true);

      // Redirect after success
      setTimeout(() => {
        router.push(`/hosting?role=${role}`);
      }, 2000);
    } catch (error) {
      console.error('Submit error:', error);
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat mengajukan permohonan"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  const getMaxFileSize = () => "10MB";

  if (submitSuccess) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold">Permohonan Berhasil Diajukan!</h3>
            <p className="text-sm text-muted-foreground">
              Permohonan hosting Anda telah berhasil diajukan dan akan segera diproses.
            </p>
            <Button onClick={() => router.push(`/hosting?role=${role}`)}>
              Kembali ke Daftar Permohonan
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/hosting?role=${role}`}>
          <Button variant="outline" size="icon" className="h-7 w-7">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Kembali</span>
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Ajukan Hosting Aplikasi</h1>
          <p className="text-muted-foreground">
            Isi formulir di bawah untuk mengajukan permohonan hosting aplikasi
          </p>
        </div>
      </div>

      {submitError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{submitError}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            Form Pengajuan Hosting
          </CardTitle>
          <CardDescription>
            Lengkapi informasi berikut untuk mengajukan hosting aplikasi
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Applicant Name */}
            <div className="space-y-2">
              <Label htmlFor="applicantName">Nama Pemohon *</Label>
              <Input
                id="applicantName"
                value={formData.applicantName}
                onChange={(e) =>
                  handleInputChange("applicantName", e.target.value)
                }
                placeholder="Masukkan nama pemohon"
              />
            </div>

            {/* OPD */}
            <div className="space-y-2">
              <Label htmlFor="opd">OPD *</Label>
              <Select
                value={formData.opd}
                onValueChange={(value) => handleInputChange("opd", value)}
              >
                <SelectTrigger id="opd">
                  <SelectValue placeholder="Pilih OPD" />
                </SelectTrigger>
                <SelectContent>
                  {MOCK_OPDS.map((opd) => (
                    <SelectItem key={opd.id} value={opd.name}>
                      {opd.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Application Name */}
            <div className="space-y-2">
              <Label htmlFor="applicationName">Nama Aplikasi *</Label>
              <Input
                id="applicationName"
                value={formData.applicationName}
                onChange={(e) =>
                  handleInputChange("applicationName", e.target.value)
                }
                placeholder="Contoh: Sistem Informasi Kepegawaian"
              />
            </div>

            {/* Domain Name */}
            <div className="space-y-2">
              <Label htmlFor="domainName">Nama Domain/Subdomain *</Label>
              <div className="flex gap-2">
                <Input
                  id="domainName"
                  value={formData.domainName}
                  onChange={(e) =>
                    handleInputChange("domainName", e.target.value)
                  }
                  placeholder="simpeg"
                  className="flex-1"
                />
                <span className="flex items-center text-sm text-muted-foreground">
                  .kalbarprov.go.id
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Hanya huruf, angka, dan tanda hubung yang diperbolehkan
              </p>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Deskripsi Aplikasi *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                placeholder="Jelaskan aplikasi yang akan dihosting..."
                rows={4}
              />
            </div>

            {/* Purpose */}
            <div className="space-y-2">
              <Label htmlFor="purpose">Tujuan Penggunaan *</Label>
              <Textarea
                id="purpose"
                value={formData.purpose}
                onChange={(e) => handleInputChange("purpose", e.target.value)}
                placeholder="Jelaskan tujuan penggunaan hosting..."
                rows={3}
              />
            </div>

            {/* Technical Specifications */}
            <div className="space-y-4">
              <Label className="text-base font-semibold">Spesifikasi Teknis</Label>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="estimatedUsers">Estimasi Jumlah Pengguna</Label>
                  <Input
                    id="estimatedUsers"
                    value={formData.technicalSpecs.estimatedUsers}
                    onChange={(e) =>
                      handleInputChange("technicalSpecs.estimatedUsers", e.target.value)
                    }
                    placeholder="Contoh: 100-500 pengguna"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="storageNeeds">Kebutuhan Storage</Label>
                  <Input
                    id="storageNeeds"
                    value={formData.technicalSpecs.storageNeeds}
                    onChange={(e) =>
                      handleInputChange("technicalSpecs.storageNeeds", e.target.value)
                    }
                    placeholder="Contoh: 10GB"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="databaseType">Jenis Database</Label>
                  <Select
                    value={formData.technicalSpecs.databaseType}
                    onValueChange={(value) =>
                      handleInputChange("technicalSpecs.databaseType", value)
                    }
                  >
                    <SelectTrigger id="databaseType">
                      <SelectValue placeholder="Pilih jenis database" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mysql">MySQL</SelectItem>
                      <SelectItem value="postgresql">PostgreSQL</SelectItem>
                      <SelectItem value="mongodb">MongoDB</SelectItem>
                      <SelectItem value="sqlserver">SQL Server</SelectItem>
                      <SelectItem value="other">Lainnya</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* File Upload */}
            <div className="space-y-4">
              <Label>Dokumen Pendukung *</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <div className="text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-4">
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <span className="mt-2 block text-sm font-medium text-gray-900">
                        Upload dokumen pendukung
                      </span>
                      <span className="mt-1 block text-sm text-gray-500">
                        PDF, JPG, PNG, DOC, DOCX hingga {getMaxFileSize()}
                      </span>
                      <Button
                        type="button"
                        variant="outline"
                        className="mt-2"
                        onClick={() => document.getElementById('file-upload')?.click()}
                      >
                        Pilih File
                      </Button>
                    </label>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      className="sr-only"
                      multiple
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      onChange={handleFileUpload}
                    />
                  </div>
                </div>
              </div>

              {/* Uploaded Files List */}
              {uploadedFiles.length > 0 && (
                <div className="space-y-2">
                  <Label>Dokumen yang Diupload:</Label>
                  {uploadedFiles.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="h-4 w-4 text-gray-500" />
                        <div>
                          <p className="text-sm font-medium">{file.name}</p>
                          <p className="text-xs text-gray-500">
                            {formatFileSize(file.size)}
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(file.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(`/hosting?role=${role}`)}
                disabled={isSubmitting}
              >
                Batal
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Mengirim...
                  </>
                ) : (
                  "Ajukan Permohonan"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
