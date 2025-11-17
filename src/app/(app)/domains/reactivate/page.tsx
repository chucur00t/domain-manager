"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2, FileText, Upload, X, Loader2, RefreshCw } from "lucide-react";

interface Domain {
  id: number;
  domain_name: string;
  expires_at: string;
  opd_id: number;
}

export default function ReactivateDomainPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = searchParams.get("role");

  const [domains, setDomains] = useState<Domain[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    domainId: "",
    reason: "",
    documents: [] as File[],
  });

  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  useEffect(() => {
    fetchExpiredDomains();
  }, []);

  const fetchExpiredDomains = async () => {
    setIsLoading(true);
    try {
      // TODO: Replace with real API that filters Expired domains for user's OPD
      const response = await fetch('/api/domains?status=Expired');
      if (response.ok) {
        const data = await response.json();
        setDomains(data);
      }
    } catch (error) {
      console.error("Error fetching expired domains:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      
      // Validate file size (max 5MB)
      const invalidFiles = newFiles.filter(file => file.size > 5 * 1024 * 1024);
      if (invalidFiles.length > 0) {
        setSubmitStatus({
          type: "error",
          message: "Beberapa file melebihi ukuran maksimal 5MB",
        });
        return;
      }

      // Validate file type
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/jpeg',
        'image/png'
      ];
      const invalidTypes = newFiles.filter(file => !allowedTypes.includes(file.type));
      if (invalidTypes.length > 0) {
        setSubmitStatus({
          type: "error",
          message: "Format file tidak didukung. Gunakan PDF, DOC, DOCX, JPG, atau PNG",
        });
        return;
      }

      setFormData((prev) => ({
        ...prev,
        documents: [...prev.documents, ...newFiles],
      }));
      setSubmitStatus({ type: null, message: "" });
    }
  };

  const removeFile = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!formData.domainId || !formData.reason) {
      setSubmitStatus({
        type: "error",
        message: "Mohon lengkapi semua field yang wajib diisi.",
      });
      return;
    }

    if (formData.reason.length < 20) {
      setSubmitStatus({
        type: "error",
        message: "Alasan reaktivasi minimal 20 karakter.",
      });
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: "" });

    try {
      // TODO: Get current user ID from session
      const currentUserId = 1; // Placeholder

      // Create the reactivation request
      const response = await fetch("/api/reactivation-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          domain_id: parseInt(formData.domainId),
          requester_id: currentUserId,
          reason: formData.reason,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Gagal mengajukan permohonan");
      }

      const result = await response.json();

      // TODO: Upload documents if any
      // For now, document upload is not implemented

      setSubmitStatus({
        type: "success",
        message:
          "Permohonan reaktivasi domain berhasil diajukan. Menunggu persetujuan Super Admin.",
      });

      // Reset form
      setFormData({
        domainId: "",
        reason: "",
        documents: [],
      });

      // Redirect after 3 seconds
      setTimeout(() => {
        router.push(`/domains?role=${encodeURIComponent(role || "")}`);
      }, 3000);
    } catch (error) {
      console.error(error);
      setSubmitStatus({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Terjadi kesalahan saat mengajukan permohonan. Silakan coba lagi.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Pengajuan Reaktivasi Domain
          </CardTitle>
          <CardDescription>
            Ajukan permohonan untuk mengaktifkan kembali domain yang sudah kedaluwarsa
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Domain Selection */}
            <div className="space-y-2">
              <Label htmlFor="domain">
                Pilih Domain <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.domainId}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, domainId: value }))
                }
                disabled={domains.length === 0}
              >
                <SelectTrigger id="domain">
                  <SelectValue placeholder="Pilih domain yang akan direaktivasi..." />
                </SelectTrigger>
                <SelectContent>
                  {domains.length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground">
                      Tidak ada domain yang kedaluwarsa
                    </div>
                  ) : (
                    domains.map((domain) => (
                      <SelectItem key={domain.id} value={domain.id.toString()}>
                        <div className="flex flex-col">
                          <span>{domain.domain_name}</span>
                          <span className="text-xs text-muted-foreground">
                            Expired: {new Date(domain.expires_at).toLocaleDateString("id-ID")}
                          </span>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                Hanya menampilkan domain dengan status Kedaluwarsa (Expired)
              </p>
            </div>

            {/* Reason */}
            <div className="space-y-2">
              <Label htmlFor="reason">
                Alasan Reaktivasi <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="reason"
                placeholder="Jelaskan mengapa domain perlu diaktifkan kembali... (minimal 20 karakter)"
                value={formData.reason}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, reason: e.target.value }))
                }
                rows={5}
                className="resize-none"
              />
              <p className="text-sm text-muted-foreground">
                Berikan penjelasan detail mengenai alasan reaktivasi domain ({formData.reason.length}/20 karakter minimal)
              </p>
            </div>

            {/* Document Upload */}
            <div className="space-y-2">
              <Label htmlFor="documents">Dokumen Pendukung (Opsional)</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="documents"
                  type="file"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById("documents")?.click()}
                  className="w-full"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Dokumen
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Format: PDF, DOC, DOCX, JPG, PNG (Maksimal 5MB per file)
              </p>

              {/* File List */}
              {formData.documents.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-sm font-medium">File yang diupload:</p>
                  {formData.documents.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 border rounded"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{file.name}</span>
                        <span className="text-xs text-muted-foreground">
                          ({(file.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Status Messages */}
            {submitStatus.type && (
              <Alert
                variant={
                  submitStatus.type === "error" ? "destructive" : "default"
                }
              >
                {submitStatus.type === "success" ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                <AlertDescription>{submitStatus.message}</AlertDescription>
              </Alert>
            )}

            {/* Info Box */}
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Informasi Penting:</strong>
                <ul className="mt-2 space-y-1 text-sm list-disc list-inside">
                  <li>
                    Permohonan reaktivasi memerlukan persetujuan dari Super Admin
                  </li>
                  <li>
                    Setelah disetujui, domain akan aktif kembali dan diperpanjang 1 tahun
                  </li>
                  <li>
                    Domain yang direaktivasi dapat langsung digunakan
                  </li>
                  <li>
                    Anda akan menerima notifikasi mengenai status permohonan ini
                  </li>
                </ul>
              </AlertDescription>
            </Alert>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={isSubmitting || domains.length === 0}
                className="flex-1"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Mengajukan...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Ajukan Reaktivasi
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isSubmitting}
              >
                Batal
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
