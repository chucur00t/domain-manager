"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Server, Code } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { BackButton } from "@/frontend/components/shared/back-button";

interface HostingApplication {
  id: string | number;
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

  const domainName = application.domainName || application.domain_name || "-";
  const submittedDate =
    application.submittedDate || application.submitted_at || "-";

  // Map status to Indonesian
  const getStatusText = (status: string) => {
    switch (status) {
      case "Active":
        return "Aktif";
      case "Deactivated":
        return "Belum Aktif";
      case "Expired":
        return "Kedaluwarsa";
      default:
        return status;
    }
  };

  const getStatusVariant = (
    status: string
  ): "default" | "secondary" | "destructive" => {
    switch (status) {
      case "Active":
        return "secondary";
      case "Deactivated":
        return "default";
      case "Expired":
        return "destructive";
      default:
        return "default";
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
          variant={getStatusVariant(application.status)}
          className="ml-auto sm:ml-0"
        >
          {getStatusText(application.status)}
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
                <Badge variant={getStatusVariant(application.status)}>
                  {getStatusText(application.status)}
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
          {/* Edit button - jika diperlukan di masa depan */}
          {currentUserRole === "Admin Daerah" &&
            application.status === "Deactivated" && (
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
            )}
          {/* Ajukan Hosting - jika diperlukan di masa depan */}
          {currentUserRole === "Admin Daerah" &&
            application.status === "Deactivated" && (
              <Button
                onClick={() => {
                  // Logic untuk ajukan hosting akan ditambahkan nanti
                  console.log("Ajukan hosting:", application.id);
                }}
              >
                Ajukan Hosting
              </Button>
            )}
        </div>
      </div>
    </div>
  );
}
