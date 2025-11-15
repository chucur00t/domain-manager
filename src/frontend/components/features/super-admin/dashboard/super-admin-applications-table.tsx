"use client";

import type { SubdomainApplication } from "@/backend/models/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import React from "react";

// Simplified status config for dashboard - only 3 main statuses
const statusConfig: Record<string, { text: string; variant: "default" | "secondary" | "destructive" }> = {
  Pending: { text: "Pending", variant: "default" as const },
  pending: { text: "Pending", variant: "default" as const },
  pending_review: { text: "Pending", variant: "default" as const },
  pending_approval: { text: "Pending", variant: "default" as const },
  Approved: { text: "Disetujui", variant: "secondary" as const },
  approved: { text: "Disetujui", variant: "secondary" as const },
  Rejected: { text: "Ditolak", variant: "destructive" as const },
  rejected: { text: "Ditolak", variant: "destructive" as const },
};

function SuperAdminApplicationsTableContent({
  applications,
}: {
  applications: SubdomainApplication[];
}) {
  const searchParams = useSearchParams();
  const role = searchParams.get("role");
  const roleQuery = `?role=${role}`;

  return (
    <div className="border-t">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nama Subdomain</TableHead>
            <TableHead>OPD</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {applications.length > 0 ? (
            applications.map((app) => (
              <TableRow key={app.id}>
                <TableCell className="font-medium">
                  <Link
                    href={`/applications/${app.id}${roleQuery}`}
                    className="hover:underline"
                  >
                    {app.domainName || `Application ${app.id}`}
                  </Link>
                </TableCell>
                <TableCell>{app.opd}</TableCell>
                <TableCell>
                  <Badge variant={statusConfig[app.status]?.variant || "default"}>
                    {statusConfig[app.status]?.text || app.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={3} className="h-24 text-center">
                Tidak ada data permohonan.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

export function SuperAdminApplicationsTable({
  applications,
}: {
  applications: SubdomainApplication[];
}) {
  return (
    <React.Suspense fallback={<div>Loading...</div>}>
      <SuperAdminApplicationsTableContent applications={applications} />
    </React.Suspense>
  );
}
