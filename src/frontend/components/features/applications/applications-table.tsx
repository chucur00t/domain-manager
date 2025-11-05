
'use client';

import type { SubdomainApplication, User } from '@/backend/models/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import Link from 'next/link';
import { Eye, Loader2 } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import React from 'react';
import { cn } from '@/utils/utils';

type ApplicationsTableProps = {
  applications: SubdomainApplication[];
};

const statusConfig = {
  pending: { text: 'Menunggu', variant: 'default' as const, className: "bg-gray-500 hover:bg-gray-600" },
  pending_review: { text: 'Review Admin', variant: 'default' as const, className: "bg-amber-500 hover:bg-amber-600" },
  pending_approval: { text: 'Persetujuan', variant: 'default' as const, className: "bg-blue-500 hover:bg-blue-600" },
  approved: { text: 'Disetujui', variant: 'secondary' as const, className: "bg-green-500 hover:bg-green-600 text-secondary-foreground" },
  rejected: { text: 'Ditolak', variant: 'destructive' as const, className: "bg-red-500 hover:bg-red-600" },
  // Database might use different case
  Pending: { text: 'Menunggu', variant: 'default' as const, className: "bg-gray-500 hover:bg-gray-600" },
  Approved: { text: 'Disetujui', variant: 'secondary' as const, className: "bg-green-500 hover:bg-green-600 text-secondary-foreground" },
  Rejected: { text: 'Ditolak', variant: 'destructive' as const, className: "bg-red-500 hover:bg-red-600" },
};

// Helper function to get status config safely
const getStatusConfig = (status: string) => {
  return statusConfig[status as keyof typeof statusConfig] || {
    text: status || 'Unknown',
    variant: 'default' as const,
    className: "bg-gray-500 hover:bg-gray-600"
  };
};

const ITEMS_PER_PAGE = 10;

function ApplicationsTableContent({ applications }: ApplicationsTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentUserRole = searchParams.get('role') as User['role'] | null;
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    setCurrentPage(0);
  }, [applications]);

  const totalPages = Math.ceil(applications.length / ITEMS_PER_PAGE);
  const startIndex = currentPage * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentApplications = applications.slice(startIndex, endIndex);

  return (
    <TooltipProvider>
      <div className="border rounded-lg">
        <div className="relative w-full overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Subdomain</TableHead>
                <TableHead>OPD</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tgl Pengajuan</TableHead>
                <TableHead className="text-center">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentApplications.length > 0 ? (
                currentApplications.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell className="font-medium">{app.domainName}</TableCell>
                    <TableCell>{app.opd}</TableCell>
                    <TableCell>
                       <Badge 
                        variant={getStatusConfig(app.status).variant}
                        className={cn(getStatusConfig(app.status).className)}
                      >
                        {getStatusConfig(app.status).text}
                      </Badge>
                    </TableCell>
                    <TableCell>{app.submittedDate}</TableCell>
                    
                      <TableCell>
                        <div className="flex items-center justify-center gap-2">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Link href={`/applications/${app.id}?role=${currentUserRole || ''}`}>
                                <Button variant="outline" size="icon">
                                  <Eye className="h-4 w-4" />
                                  <span className="sr-only">Lihat Detail</span>
                                </Button>
                              </Link>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Lihat Detail</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </TableCell>
                    
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    Tidak ada hasil yang ditemukan.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-end space-x-2 p-4 border-t">
              <span className="text-sm text-muted-foreground">
                  Halaman {currentPage + 1} dari {totalPages}
              </span>
              <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}
              disabled={currentPage === 0}
              >
              Sebelumnya
              </Button>
              <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1))}
              disabled={currentPage >= totalPages - 1}
              >
              Berikutnya
              </Button>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}

export function ApplicationsTable(props: ApplicationsTableProps) {
    return (
        <Suspense fallback={<div className="flex w-full h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
            <ApplicationsTableContent {...props} />
        </Suspense>
    )
}

