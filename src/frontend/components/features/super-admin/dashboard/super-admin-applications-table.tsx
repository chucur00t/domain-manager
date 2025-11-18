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
const statusConfig: Record<string, { text: string; variant: "default" | "secondary" | "destructive"; className: string }> = {
  Pending: { text: "Pending", variant: "default" as const, className: "inline-flex items-center justify-center min-w-[100px] bg-gray-500 hover:bg-gray-600 text-white" },
  pending: { text: "Pending", variant: "default" as const, className: "inline-flex items-center justify-center min-w-[100px] bg-gray-500 hover:bg-gray-600 text-white" },
  pending_review: { text: "Pending", variant: "default" as const, className: "inline-flex items-center justify-center min-w-[100px] bg-gray-500 hover:bg-gray-600 text-white" },
  pending_approval: { text: "Pending", variant: "default" as const, className: "inline-flex items-center justify-center min-w-[100px] bg-gray-500 hover:bg-gray-600 text-white" },
  Approved: { text: "Disetujui", variant: "secondary" as const, className: "inline-flex items-center justify-center min-w-[100px] bg-green-500 hover:bg-green-600 text-white" },
  approved: { text: "Disetujui", variant: "secondary" as const, className: "inline-flex items-center justify-center min-w-[100px] bg-green-500 hover:bg-green-600 text-white" },
  Rejected: { text: "Ditolak", variant: "destructive" as const, className: "inline-flex items-center justify-center min-w-[100px] bg-red-500 hover:bg-red-600 text-white" },
  rejected: { text: "Ditolak", variant: "destructive" as const, className: "inline-flex items-center justify-center min-w-[100px] bg-red-500 hover:bg-red-600 text-white" },
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
            <TableHead>Tanggal</TableHead>
            <TableHead>Domain</TableHead>
            <TableHead>OPD</TableHead>
            <TableHead>Tujuan</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {applications.length > 0 ? (
            applications.map((app) => (
              <TableRow key={app.id}>
                <TableCell className="text-sm">
                  {app.submittedDate || app.submissionDate
                    ? new Date(app.submittedDate || app.submissionDate || "").toLocaleDateString("id-ID")
                    : "-"}
                </TableCell>
                <TableCell className="font-medium">
                  <Link
                    href={`/applications/${app.id}${roleQuery}`}
                    className="hover:underline"
                  >
                    <code className="bg-muted px-2 py-1 rounded text-xs">
                      {app.domainName || `Application ${app.id}`}
                    </code>
                  </Link>
                </TableCell>
                <TableCell className="text-sm">{app.opd}</TableCell>
                <TableCell className="text-sm max-w-xs truncate">
                  {app.description || app.purpose || "-"}
                </TableCell>
                <TableCell>
                  <Badge 
                    variant={statusConfig[app.status]?.variant || "default"}
                    className={statusConfig[app.status]?.className || ""}
                  >
                    {statusConfig[app.status]?.text || app.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
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
