
'use client';

import type { SubdomainApplication } from '@/backend/models/types';
import type { ApplicationStatus } from '@/backend/models/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/frontend/components/ui/table';
import { Badge } from '@/frontend/components/ui/badge';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import React from 'react';
import { cn } from '@/frontend/utils/utils';

const statusConfig: Record<ApplicationStatus, {
  text: string;
  variant: 'default' | 'secondary' | 'destructive';
  className?: string;
}> = {
  pending_review: { text: 'Review Admin', variant: 'default', className: "bg-amber-500 hover:bg-amber-600" },
  pending_approval: { text: 'Persetujuan Kabid', variant: 'default', className: "bg-amber-500 hover:bg-amber-600" },
  approved: { text: 'Disetujui', variant: 'secondary', className: "bg-green-500 hover:bg-green-600 text-secondary-foreground" },
  rejected: { text: 'Ditolak', variant: 'destructive' },
  pending: { text: 'Menunggu', variant: 'default', className: "bg-amber-500 hover:bg-amber-600" }
};


function SuperAdminApplicationsTableContent({ applications }: { applications: SubdomainApplication[] }) {
  const searchParams = useSearchParams();
  const role = searchParams.get('role');
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
                        <Link href={`/applications/${app.id}${roleQuery}`} className="hover:underline">
                            {app.domainName}
                        </Link>
                    </TableCell>
                  <TableCell>{app.opd}</TableCell>
                  <TableCell>
                    <Badge 
                        variant={statusConfig[app.status].variant}
                        className={cn(statusConfig[app.status].className)}
                    >
                      {statusConfig[app.status].text}
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

export function SuperAdminApplicationsTable({ applications }: { applications: SubdomainApplication[] }) {
    return (
        <React.Suspense fallback={<div>Loading...</div>}>
            <SuperAdminApplicationsTableContent applications={applications} />
        </React.Suspense>
    )
}

