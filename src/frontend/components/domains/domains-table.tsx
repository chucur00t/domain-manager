
'use client';

import type { Domain } from '@/backend/models/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Eye, GanttChartSquare, Loader2, PlayCircle, Trash2 } from 'lucide-react';
import { useState, useTransition, useEffect } from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { activateDomain, deactivateDomain } from '@/backend/actions/domains';
import { useToast } from '@/hooks/use-toast';
import { buttonVariants } from '../ui/button';
import { useRouter } from 'next/navigation';
import { cn } from '@/utils/utils';

type DomainsTableProps = {
  domains: Domain[];
  showActions?: boolean;
};

type ActionType = 'activate' | 'deactivate';

import { DomainStatus } from '@/backend/models/types';

const statusConfig: Record<DomainStatus, { 
  text: string, 
  variant: "default" | "secondary" | "destructive" | "outline", 
  className: string 
}> = {
  pending: { 
    text: 'Pending', 
    variant: 'default', 
    className: "bg-amber-500 hover:bg-amber-600" 
  },
  active: { 
    text: 'Aktif', 
    variant: 'secondary', 
    className: "bg-green-500 hover:bg-green-600 text-secondary-foreground" 
  },
  inactive: { 
    text: 'Tidak Aktif', 
    variant: 'outline',
    className: "bg-gray-100 hover:bg-gray-200"
  },
  expired: {
    text: 'Kadaluarsa',
    variant: 'destructive',
    className: "bg-red-500 hover:bg-red-600"
  }
};

const ITEMS_PER_PAGE = 10;

export function DomainsTable({ domains, showActions = true }: DomainsTableProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(0);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState<Domain | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [actionType, setActionType] = useState<ActionType | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setCurrentPage(0);
  }, [domains]);

  const totalPages = Math.ceil(domains.length / ITEMS_PER_PAGE);
  const startIndex = currentPage * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentDomains = domains.slice(startIndex, endIndex);
  
  const handleActionClick = (domain: Domain, type: ActionType) => {
    setSelectedDomain(domain);
    setActionType(type);
    setIsAlertOpen(true);
  };
  
  const handleConfirmAction = async () => {
    if (!selectedDomain || !actionType) return;

    startTransition(async () => {
      setProcessingId(selectedDomain.id);
      const result = actionType === 'activate'
        ? await activateDomain(selectedDomain.id, 'Kepala Bidang')
        : await deactivateDomain(selectedDomain.id, 'Kepala Bidang');

      if (result.success) {
        toast({ title: 'Sukses', description: result.message });
        router.refresh();
      } else {
        toast({ title: 'Error', description: result.message, variant: 'destructive' });
      }

      setIsAlertOpen(false);
      setSelectedDomain(null);
      setProcessingId(null);
    });
  };
  
  const getDialogContent = () => {
    if (!selectedDomain || !actionType) return { title: '', description: '', confirmText: '', variant: 'default' as const };
    if (actionType === 'activate') {
      return {
        title: 'Konfirmasi Aktivasi',
        description: `Apakah Anda yakin ingin mengaktifkan domain "${selectedDomain.hostname}"?`,
        confirmText: 'Ya, Aktifkan',
        variant: 'default' as const,
      };
    }
    return {
      title: 'Konfirmasi Penonaktifan',
      description: `Apakah Anda yakin ingin menonaktifkan domain "${selectedDomain.hostname}"?`,
      confirmText: 'Ya, Nonaktifkan',
      variant: 'destructive' as const,
    };
  };

  const { title, description, confirmText, variant } = getDialogContent();

  return (
    <TooltipProvider>
      <div className="border rounded-lg">
        <div className="relative w-full overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Hostname</TableHead>
                <TableHead>Perangkat Daerah</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tgl Dibuat</TableHead>
                <TableHead className="text-center">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentDomains.length > 0 ? (
                currentDomains.map((domain) => (
                <TableRow key={domain.id}>
                  <TableCell className="font-medium">{domain.hostname}</TableCell>
                  <TableCell>{domain.opd}</TableCell>
                  <TableCell>
                    <Badge 
                        variant={statusConfig[domain.status].variant}
                        className={cn(statusConfig[domain.status].className)}
                    >
                      {statusConfig[domain.status].text}
                    </Badge>
                  </TableCell>
                  <TableCell>{domain.activationDate}</TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-2">
                        {processingId === domain.id ? (
                           <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Link href={`/domains/${domain.id}`}>
                                    <Button variant="outline" size="icon" disabled={isPending}>
                                      <Eye className="h-4 w-4" />
                                      <span className="sr-only">Lihat Detail</span>
                                    </Button>
                                </Link>
                              </TooltipTrigger>
                              <TooltipContent><p>Lihat Detail</p></TooltipContent>
                            </Tooltip>
                            {showActions && (
                              <>
                                {domain.status === 'active' && (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button variant="destructive" size="icon" onClick={() => handleActionClick(domain, 'deactivate')} disabled={isPending}>
                                        <Trash2 className="h-4 w-4" />
                                        <span className="sr-only">Nonaktifkan</span>
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent><p>Nonaktifkan</p></TooltipContent>
                                  </Tooltip>
                                )}
                                {(domain.status === 'inactive' || domain.status === 'pending') && (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button variant="secondary" size="icon" onClick={() => handleActionClick(domain, 'activate')} disabled={isPending}>
                                        <PlayCircle className="h-4 w-4" />
                                        <span className="sr-only">Aktifkan</span>
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent><p>Aktifkan</p></TooltipContent>
                                  </Tooltip>
                                )}
                              </>
                            )}
                          </>
                        )}
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
                disabled={currentPage === 0 || isPending}
                >
                Sebelumnya
                </Button>
                <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1))}
                disabled={currentPage >= totalPages - 1 || isPending}
                >
                Berikutnya
                </Button>
            </div>
        )}
      </div>
       <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{title}</AlertDialogTitle>
            <AlertDialogDescription>{description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmAction} disabled={isPending} className={buttonVariants({ variant: variant })}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {confirmText}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </TooltipProvider>
  );
}

