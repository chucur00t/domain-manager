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
          </TableRow>
        </TableHeader>
        <TableBody>
          {applications.length > 0 ? (
            applications.map((app) => (
              <TableRow key={app.id}>
                <TableCell className="text-sm">
                  {(() => {
                    const dateStr = app.submittedDate || app.submissionDate || (app as any).created_at;
                    if (dateStr) {
                      try {
                        const date = new Date(dateStr);
                        if (!isNaN(date.getTime())) {
                          return date.toLocaleDateString("id-ID", {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          });
                        }
                      } catch (e) {
                        console.error('Invalid date:', dateStr);
                      }
                    }
                    return new Date().toLocaleDateString("id-ID", {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    });
                  })()}
                </TableCell>
                <TableCell className="font-medium">
                  <Link
                    href={`/applications/${app.id}${roleQuery}`}
                    className="hover:underline"
                  >
                    <code className="bg-muted px-2 py-1 rounded text-xs">
                      {(() => {
                        const domain = app.domainName || `Application ${app.id}`;
                        console.log('[SuperAdminTable] Domain:', { 
                          id: app.id, 
                          domainName: app.domainName, 
                          final: domain,
                          hasDot: domain.includes('.')
                        });
                        if (domain.startsWith('Application')) return domain;
                        const result = domain.includes('.') ? domain : `${domain}.kalbarprov.go.id`;
                        console.log('[SuperAdminTable] Result:', result);
                        return result;
                      })()}
                    </code>
                  </Link>
                </TableCell>
                <TableCell className="text-sm">{app.opd}</TableCell>
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
