"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  FileText,
  Download,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";

interface DeactivationDocument {
  id: number;
  file_name: string;
  file_path: string;
  file_type: string;
  uploaded_at: string;
}

interface DeactivationRequest {
  id: number;
  domain_id: number;
  domain_name: string;
  requester_id: number;
  requester_name: string;
  requester_email: string;
  requester_opd: string;
  reason: string;
  status: "Pending" | "Approved" | "Rejected";
  decision_comment?: string;
  decided_by?: number;
  decider_name?: string;
  requested_at: string;
  decided_at?: string;
  documents?: DeactivationDocument[];
}

export default function DeactivationRequestDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [request, setRequest] = useState<DeactivationRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [decision, setDecision] = useState<"approve" | "reject">("approve");
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchRequest();
  }, [params.id]);

  const fetchRequest = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/deactivation-requests/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setRequest(data);
      } else {
        setError("Gagal memuat data permohonan");
      }
    } catch (error) {
      console.error("Error fetching request:", error);
      setError("Terjadi kesalahan saat memuat data");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (decision === "reject" && !comment.trim()) {
      setError("Komentar wajib diisi untuk penolakan");
      return;
    }

    setProcessing(true);
    setError("");
    setSuccess("");

    try {
      // TODO: Get current user ID from session
      const currentUserId = 1; // Placeholder

      const response = await fetch(`/api/deactivation-requests/${params.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          decision,
          decided_by: currentUserId,
          comment: comment.trim() || undefined,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSuccess(data.message);
        setTimeout(() => {
          router.push("/super-admin/deactivation-requests");
        }, 2000);
      } else {
        const data = await response.json();
        setError(data.error || "Gagal memproses permohonan");
      }
    } catch (error) {
      console.error("Error processing request:", error);
      setError("Terjadi kesalahan saat memproses permohonan");
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Pending":
        return (
          <Badge className="bg-orange-500 text-white">
            Menunggu Persetujuan
          </Badge>
        );
      case "Approved":
        return <Badge className="bg-green-500 text-white">Disetujui</Badge>;
      case "Rejected":
        return <Badge variant="destructive">Ditolak</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center py-12">Loading...</div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="container mx-auto py-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Permohonan tidak ditemukan</AlertDescription>
        </Alert>
      </div>
    );
  }

  const isPending = request.status === "Pending";

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/super-admin/deactivation-requests">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">Detail Permohonan Deaktivasi</h1>
          <p className="text-muted-foreground mt-1">
            ID Permohonan: #{request.id}
          </p>
        </div>
        <div>{getStatusBadge(request.status)}</div>
      </div>

      {/* Alerts */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {success && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            {success}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Domain Information */}
        <Card>
          <CardHeader>
            <CardTitle>Informasi Domain</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-muted-foreground">Nama Domain</Label>
              <div className="text-lg font-semibold mt-1">
                {request.domain_name}
              </div>
            </div>
            <div>
              <Label className="text-muted-foreground">ID Domain</Label>
              <div className="mt-1">{request.domain_id}</div>
            </div>
          </CardContent>
        </Card>

        {/* Requester Information */}
        <Card>
          <CardHeader>
            <CardTitle>Informasi Pemohon</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-muted-foreground">Nama</Label>
              <div className="mt-1">{request.requester_name}</div>
            </div>
            <div>
              <Label className="text-muted-foreground">Email</Label>
              <div className="mt-1">{request.requester_email}</div>
            </div>
            <div>
              <Label className="text-muted-foreground">OPD</Label>
              <div className="mt-1">{request.requester_opd}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Request Details */}
      <Card>
        <CardHeader>
          <CardTitle>Detail Permohonan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-muted-foreground">Tanggal Pengajuan</Label>
            <div className="mt-1">{formatDate(request.requested_at)}</div>
          </div>
          <div>
            <Label className="text-muted-foreground">Alasan Deaktivasi</Label>
            <div className="mt-2 p-4 bg-muted rounded-md whitespace-pre-wrap">
              {request.reason}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documents */}
      {request.documents && request.documents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Dokumen Pendukung</CardTitle>
            <CardDescription>
              {request.documents.length} dokumen dilampirkan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {request.documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-3 border rounded-md"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">{doc.file_name}</div>
                      <div className="text-sm text-muted-foreground">
                        {formatDate(doc.uploaded_at)}
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Unduh
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Decision (if already decided) */}
      {!isPending && (
        <Card>
          <CardHeader>
            <CardTitle>Keputusan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-muted-foreground">Diputuskan oleh</Label>
              <div className="mt-1">{request.decider_name || "N/A"}</div>
            </div>
            <div>
              <Label className="text-muted-foreground">Tanggal Keputusan</Label>
              <div className="mt-1">
                {request.decided_at ? formatDate(request.decided_at) : "N/A"}
              </div>
            </div>
            {request.decision_comment && (
              <div>
                <Label className="text-muted-foreground">Komentar</Label>
                <div className="mt-2 p-4 bg-muted rounded-md">
                  {request.decision_comment}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Approval Form (only for pending requests) */}
      {isPending && (
        <Card>
          <CardHeader>
            <CardTitle>Proses Permohonan</CardTitle>
            <CardDescription>
              Setujui atau tolak permohonan deaktivasi domain ini
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label>Keputusan *</Label>
              <RadioGroup
                value={decision}
                onValueChange={(val) =>
                  setDecision(val as "approve" | "reject")
                }
              >
                <div className="flex items-center space-x-2 p-3 border rounded-md hover:bg-accent">
                  <RadioGroupItem value="approve" id="approve" />
                  <Label
                    htmlFor="approve"
                    className="flex items-center gap-2 cursor-pointer flex-1"
                  >
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <div className="font-medium">Setujui Permohonan</div>
                      <div className="text-sm text-muted-foreground">
                        Domain akan dinonaktifkan
                      </div>
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-md hover:bg-accent">
                  <RadioGroupItem value="reject" id="reject" />
                  <Label
                    htmlFor="reject"
                    className="flex items-center gap-2 cursor-pointer flex-1"
                  >
                    <XCircle className="h-5 w-5 text-red-600" />
                    <div>
                      <div className="font-medium">Tolak Permohonan</div>
                      <div className="text-sm text-muted-foreground">
                        Domain tetap aktif
                      </div>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="comment">
                Komentar{" "}
                {decision === "reject" && (
                  <span className="text-red-500">*</span>
                )}
              </Label>
              <Textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={
                  decision === "approve"
                    ? "Tambahkan komentar (opsional)"
                    : "Jelaskan alasan penolakan (wajib)"
                }
                rows={4}
                className="resize-none"
              />
              <p className="text-sm text-muted-foreground">
                {decision === "reject"
                  ? "Komentar wajib diisi untuk penolakan"
                  : "Komentar bersifat opsional"}
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleSubmit}
                disabled={
                  processing || (decision === "reject" && !comment.trim())
                }
                className="flex-1"
                variant={decision === "approve" ? "default" : "destructive"}
              >
                {processing ? (
                  "Memproses..."
                ) : decision === "approve" ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Setujui Permohonan
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4 mr-2" />
                    Tolak Permohonan
                  </>
                )}
              </Button>
              <Link href="/super-admin/deactivation-requests">
                <Button variant="outline" disabled={processing}>
                  Batal
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
