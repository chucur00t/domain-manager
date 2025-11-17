"use client";

import { useState, useEffect, Suspense } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { Loader2, Upload, X, AlertCircle, CheckCircle2 } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import type { User, Domain } from "@/backend/models/types";
import { MOCK_USERS } from "@/backend/utils/mock-data";
import { Alert, AlertDescription } from "@/components/ui/alert";

function DeactivateDomainContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = searchParams.get("role") as User["role"] | null;

  const [domains, setDomains] = useState<Domain[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  const [formData, setFormData] = useState({
    domainId: "",
    reason: "",
    documents: [] as File[],
  });

  const currentUser = MOCK_USERS.find((user) => user.role === role) || null;
  const USER_OPD = currentUser?.opd;

  useEffect(() => {
    const fetchDomains = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/domains");
        if (!response.ok) {
          throw new Error("Failed to fetch domains");
        }
        const data = await response.json();

        // Filter only active domains for the user's OPD
        const activeDomains = data.filter(
          (domain: Domain) =>
            domain.status === "Active" &&
            (currentUser?.role === "Admin Daerah"
              ? domain.opd === USER_OPD
              : true)
        );
        setDomains(activeDomains);
      } catch (error) {
        console.error(error);
        setSubmitStatus({
          type: "error",
          message: "Gagal memuat data domain.",
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchDomains();
  }, [USER_OPD, currentUser?.role]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files);
      setFormData((prev) => ({
        ...prev,
        documents: [...prev.documents, ...newFiles],
      }));
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

    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: "" });

    try {
      // TODO: Get current user ID from session
      const currentUserId = 1; // Placeholder - should come from auth session

      // Create the deactivation request
      const response = await fetch("/api/deactivation-requests", {
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
      // Will need to create a separate endpoint for file uploads

      setSubmitStatus({
        type: "success",
        message:
          "Permohonan deaktivasi domain berhasil diajukan. Menunggu persetujuan Super Admin.",
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
          <CardTitle>Pengajuan Deaktivasi Domain</CardTitle>
          <CardDescription>
            Admin Daerah dapat mengajukan permohonan deaktivasi domain yang
            memerlukan persetujuan Super Admin. Sistem juga akan secara otomatis
            mensuspensi domain yang tidak diperbarui setelah masa berlaku satu
            tahun habis.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Domain Selection */}
            <div className="space-y-2">
              <Label htmlFor="domain">
                Domain <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.domainId}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, domainId: value }))
                }
              >
                <SelectTrigger id="domain">
                  <SelectValue placeholder="Pilih domain yang akan dideaktivasi" />
                </SelectTrigger>
                <SelectContent>
                  {domains.length === 0 ? (
                    <SelectItem value="no-domain" disabled>
                      Tidak ada domain aktif
                    </SelectItem>
                  ) : (
                    domains.map((domain) => (
                      <SelectItem key={domain.id} value={domain.id.toString()}>
                        {domain.domain_name || domain.hostname} ({domain.opd})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                Pilih domain yang ingin Anda ajukan untuk dideaktivasi
              </p>
            </div>

            {/* Reason */}
            <div className="space-y-2">
              <Label htmlFor="reason">
                Alasan Penonaktifan <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="reason"
                placeholder="Jelaskan alasan mengapa domain perlu dideaktivasi..."
                value={formData.reason}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, reason: e.target.value }))
                }
                rows={5}
                className="resize-none"
              />
              <p className="text-sm text-muted-foreground">
                Berikan penjelasan detail mengenai alasan deaktivasi domain
              </p>
            </div>

            {/* Document Upload */}
            <div className="space-y-2">
              <Label htmlFor="documents">Dokumen Pendukung</Label>
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
                      className="flex items-center justify-between p-3 bg-muted rounded-md"
                    >
                      <span className="text-sm truncate flex-1">
                        {file.name}
                      </span>
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
                    Permohonan deaktivasi memerlukan persetujuan dari Super
                    Admin
                  </li>
                  <li>
                    Setelah disetujui, status domain akan berubah menjadi
                    "Kedaluwarsa"
                  </li>
                  <li>
                    Domain yang kedaluwarsa tidak dapat diakses dan perlu
                    reaktivasi untuk digunakan kembali
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
                    Mengirim Permohonan...
                  </>
                ) : (
                  "Ajukan Deaktivasi"
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  router.push(`/domains?role=${encodeURIComponent(role || "")}`)
                }
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

export default function DeactivateDomainPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <DeactivateDomainContent />
    </Suspense>
  );
}
