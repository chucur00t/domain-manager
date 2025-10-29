
'use client';

import { useState, useEffect } from 'react';
import type { AuditLog } from '@/backend/models/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';

type AuditTrailTableProps = {
  logs: AuditLog[];
};

const ITEMS_PER_PAGE = 10;

export function AuditTrailTable({ logs }: AuditTrailTableProps) {
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    setCurrentPage(0);
  }, [logs]);

  const totalPages = Math.ceil(logs.length / ITEMS_PER_PAGE);
  const startIndex = currentPage * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentLogs = logs.slice(startIndex, endIndex);

  return (
    <div className="border rounded-lg">
      <div className="relative w-full overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[180px]">Waktu</TableHead>
              <TableHead>Pengguna</TableHead>
              <TableHead>Peran</TableHead>
              <TableHead>Aksi</TableHead>
              <TableHead>Detail</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentLogs.length > 0 ? (
              currentLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-mono text-xs">{log.timestamp}</TableCell>
                  <TableCell className="font-medium">{log.user}</TableCell>
                  <TableCell>{log.userRole}</TableCell>
                  <TableCell>
                    <span className="font-mono text-xs p-1 bg-muted rounded-sm">{log.action}</span>
                  </TableCell>
                  <TableCell className="text-xs">{log.details}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                      Tidak ada data log yang cocok dengan filter Anda.
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
  );
}
