"use client";

import { useState, useEffect } from "react";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ArrowLeft,
  RefreshCw,
  FileText,
  CheckCircle,
  XCircle,
  Download,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface ReactivationDocument {
  id: number;
  file_name: string;
  file_path: string;
  file_type: string;
  uploaded_at: string;
}

interface ReactivationRequest {
  id: number;
  domain_id: number;
  domain_name: string;
  domain_status: string;
  domain_expires_at?: string;
  requester_id: number;
  requester_name: string;
  requester_email: string;
  requester_opd: string;
  reason: string;
  status: "Pending" | "Approved" | "Rejected";
  decision_comment?: string;
  decided_by?: number;
  decider_name?: string;
  decider_email?: string;
  requested_at: string;
  decided_at?: string;
  documents?: ReactivationDocument[];
}

export default function ReactivationRequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [requestId, setRequestId] = useState<string | null>(null);
  const [request, setRequest] = useState<ReactivationRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [decision, setDecision] = useState<"approve" | "reject">("approve");
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Unwrap params Promise
  useEffect(() => {
    params.then(({ id }) => setRequestId(id));
  }, [params]);

  useEffect(() => {
    if (requestId) {
      fetchRequestDetail();
    }
  }, [requestId]);

  const fetchRequestDetail = async () => {
    if (!requestId) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/reactivation-requests/${requestId}`);
      if (response.ok) {
        const data = await response.json();
        setRequest(data);
      } else {
        setError("Gagal memuat detail permohonan");
      }
    } catch (error) {
      console.error("Error fetching request detail:", error);
      setError("Terjadi kesalahan saat memuat data");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitDecision = async () => {
    if (decision === "reject" && !comment.trim()) {
      setError("Komentar wajib diisi untuk penolakan");
      return;
    }

    setProcessing(true);
    setError("");
    setSuccess("");

    try {
      // TODO: Get actual logged-in Super Admin ID from session
      const decidedBy = 1; // Placeholder

      const response = await fetch(`/api/reactivation-requests/${requestId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          decision: decision,
          decided_by: decidedBy,
          comment: comment.trim() || undefined,
        }),
      });

      if (response.ok) {
        const message =
          decision === "approve"
            ? "Permohonan reaktivasi telah disetujui. Domain akan diaktifkan dan diperpanjang 1 tahun."
            : "Permohonan reaktivasi telah ditolak.";
        setSuccess(message);
        setTimeout(() => {
          router.push("/super-admin/reactivation-requests");
        }, 3000);
      } else {
        const data = await response.json();
        setError(data.error || "Gagal memproses permohonan");
      }
    } catch (error) {
      console.error("Error processing decision:", error);
      setError("Terjadi kesalahan saat memproses permohonan");
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Pending":
        return <Badge className="inline-flex items-center justify-center min-w-[100px] bg-orange-500 text-white">Menunggu</Badge>;
      case "Approved":
        return <Badge className="inline-flex items-center justify-center min-w-[100px] bg-green-500 text-white">Disetujui</Badge>;
      case "Rejected":
        return <Badge className="inline-flex items-center justify-center min-w-[100px] bg-red-500 text-white">Ditolak</Badge>;
      default:
        return <Badge className="inline-flex items-center justify-center min-w-[100px] bg-gray-500 text-white">{status}</Badge>;
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
        <div className="text-center">Loading...</div>
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

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link href="/super-admin/reactivation-requests">
            <Button variant="ghost" className="mb-2">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali ke Daftar
            </Button>
          </Link>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <RefreshCw className="h-8 w-8" />
            Detail Permohonan Reaktivasi
          </h1>
          <p className="text-muted-foreground mt-2">ID: {request.id}</p>
        </div>
        <div>{getStatusBadge(request.status)}</div>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            {success}
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Domain Information */}
      <Card>
        <CardHeader>
          <CardTitle>Informasi Domain</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Nama Domain</p>
              <p className="font-medium">{request.domain_name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status Saat Ini</p>
              <Badge variant="outline" className="mt-1">
                {request.domain_status}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">OPD</p>
              <p className="font-medium">{request.requester_opd}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Expired Date</p>
              <p className="font-medium text-red-600">
                {request.domain_expires_at
                  ? formatDate(request.domain_expires_at)
                  : "-"}
              </p>
            </div>
          </div>

          {request.status === "Pending" && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Jika disetujui, domain akan diaktifkan kembali dan expired date
                akan diperpanjang <strong>1 tahun</strong> dari sekarang.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Requester Information */}
      <Card>
        <CardHeader>
          <CardTitle>Informasi Pemohon</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Nama</p>
              <p className="font-medium">{request.requester_name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{request.requester_email}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">OPD</p>
              <p className="font-medium">{request.requester_opd}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tanggal Pengajuan</p>
              <p className="font-medium">{formatDate(request.requested_at)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Request Details */}
      <Card>
        <CardHeader>
          <CardTitle>Detail Permohonan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-2">
              Alasan Reaktivasi
            </p>
            <div className="bg-muted p-4 rounded-md whitespace-pre-wrap">
              {request.reason}
            </div>
          </div>

          {request.documents && request.documents.length > 0 && (
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                Dokumen Pendukung
              </p>
              <div className="space-y-2">
                {request.documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-3 border rounded-md"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{doc.file_name}</p>
                        <p className="text-sm text-muted-foreground">
                          Diunggah: {formatDate(doc.uploaded_at)}
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Unduh
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Approval Form (Only for Pending) */}
      {request.status === "Pending" && (
        <Card>
          <CardHeader>
            <CardTitle>Form Persetujuan</CardTitle>
            <CardDescription>
              Tinjau permohonan dan berikan keputusan
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <RadioGroup
              value={decision}
              onValueChange={(value: "approve" | "reject") =>
                setDecision(value)
              }
            >
              <div className="flex items-center space-x-2 p-3 border rounded-md">
                <RadioGroupItem value="approve" id="approve" />
                <Label htmlFor="approve" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">Setujui Reaktivasi</p>
                      <p className="text-sm text-muted-foreground">
                        Domain akan diaktifkan dan diperpanjang 1 tahun
                      </p>
                    </div>
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-3 border rounded-md">
                <RadioGroupItem value="reject" id="reject" />
                <Label htmlFor="reject" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <XCircle className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="font-medium">Tolak Reaktivasi</p>
                      <p className="text-sm text-muted-foreground">
                        Domain tetap dalam status expired
                      </p>
                    </div>
                  </div>
                </Label>
              </div>
            </RadioGroup>

            <div>
              <Label htmlFor="comment">
                Komentar{" "}
                {decision === "reject" && (
                  <span className="text-red-500">*</span>
                )}
              </Label>
              <Textarea
                id="comment"
                placeholder={
                  decision === "reject"
                    ? "Jelaskan alasan penolakan..."
                    : "Tambahkan catatan (opsional)"
                }
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                className="mt-2"
              />
            </div>

            <div className="flex gap-3 pt-4">
              {decision === "approve" ? (
                <Button
                  onClick={handleSubmitDecision}
                  disabled={processing}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {processing ? "Memproses..." : "Setujui Reaktivasi"}
                </Button>
              ) : (
                <Button
                  onClick={handleSubmitDecision}
                  disabled={processing}
                  variant="destructive"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  {processing ? "Memproses..." : "Tolak Reaktivasi"}
                </Button>
              )}
              <Link href="/super-admin/reactivation-requests">
                <Button variant="outline" disabled={processing}>
                  Batal
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Decision (If already processed) */}
      {request.status !== "Pending" && (
        <Card>
          <CardHeader>
            <CardTitle>Keputusan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">
                  Status Keputusan
                </p>
                <div className="mt-1">{getStatusBadge(request.status)}</div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Tanggal Keputusan
                </p>
                <p className="font-medium">
                  {request.decided_at ? formatDate(request.decided_at) : "-"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Diputuskan Oleh</p>
                <p className="font-medium">{request.decider_name || "-"}</p>
                {request.decider_email && (
                  <p className="text-sm text-muted-foreground">
                    {request.decider_email}
                  </p>
                )}
              </div>
            </div>

            {request.decision_comment && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">Komentar</p>
                <div className="bg-muted p-4 rounded-md whitespace-pre-wrap">
                  {request.decision_comment}
                </div>
              </div>
            )}

            {request.status === "Approved" && (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Domain telah diaktifkan kembali dan expired date telah
                  diperpanjang 1 tahun dari tanggal persetujuan.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
