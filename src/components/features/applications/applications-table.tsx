'use client';

import type { SubdomainApplication } from '@/backend/models/types';
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
import { Eye, Check, X, Loader2 } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useState, useTransition, useEffect } from 'react';
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
import { approveApplication, rejectApplication } from '@/backend/actions/applications';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/frontend/components/ui/textarea';
import { Label } from '@/frontend/components/ui/label';
import { cn } from '@/utils/utils';
import { useRouter } from 'next/navigation';

type ApplicationsTableProps = {
  applications: SubdomainApplication[];
  showActions?: boolean;
};

type ActionType = 'approve' | 'reject';

import { ApplicationStatus } from "@/backend/models/types";

const statusConfig: Record<ApplicationStatus, { 
  text: string, 
  variant: "default" | "secondary" | "destructive" | "outline", 
  className: string 
}> = {
  pending: { 
    text: 'Menunggu', 
    variant: 'default', 
    className: "bg-amber-500 hover:bg-amber-600" 
  },
  pending_review: { 
    text: 'Review Admin', 
    variant: 'default', 
    className: "bg-amber-500 hover:bg-amber-600" 
  },
  pending_approval: { 
    text: 'Persetujuan Kabid', 
    variant: 'default', 
    className: "bg-amber-500 hover:bg-amber-600" 
  },
  approved: { 
    text: 'Disetujui', 
    variant: 'secondary', 
    className: "bg-green-500 hover:bg-green-600 text-secondary-foreground" 
  },
  rejected: { 
    text: 'Ditolak', 
    variant: 'destructive',
    className: "bg-red-500 hover:bg-red-600" 
  },
};


const ITEMS_PER_PAGE = 5;

export function ApplicationsTable({ applications, showActions = true }: ApplicationsTableProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [isProcessing, startTransition] = useTransition();
  const [selectedApplication, setSelectedApplication] = useState<SubdomainApplication | null>(null);
  const [actionType, setActionType] = useState<ActionType | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    setCurrentPage(0);
  }, [applications]);

  const totalPages = Math.ceil(applications.length / ITEMS_PER_PAGE);
  const startIndex = currentPage * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentApplications = applications.slice(startIndex, endIndex);

  const handleActionClick = (application: SubdomainApplication, action: ActionType) => {
    setSelectedApplication(application);
    setActionType(action);
    setRejectionReason('');
    setIsAlertOpen(true);
  };

  const handleConfirmAction = async () => {
    if (!selectedApplication || !actionType) return;
    
    if (actionType === 'reject' && !rejectionReason.trim()) {
        toast({
            title: 'Validasi Gagal',
            description: 'Alasan penolakan harus diisi.',
            variant: 'destructive'
        });
        return;
    }

    startTransition(async () => {
      let result;
      if (actionType === 'approve') {
        result = await approveApplication(selectedApplication.id, 'Admin Daerah');
      } else {
        result = await rejectApplication(selectedApplication.id, rejectionReason, 'Admin Daerah');
      }

      if (result.success) {
        toast({
          title: 'Sukses',
          description: result.message,
        });
        router.refresh();
      } else {
        toast({
          title: 'Error',
          description: result.message,
          variant: 'destructive',
        });
      }

      setIsAlertOpen(false);
      setSelectedApplication(null);
      setActionType(null);
    });
  };

  const getDialogContent = () => {
    if (!selectedApplication || !actionType) return { title: '', description: ''};
    const actionText = actionType === 'approve' ? 'menyetujui' : 'menolak';
    return {
      title: `Konfirmasi ${actionType === 'approve' ? 'Persetujuan' : 'Penolakan'}`,
      description: `Apakah Anda yakin ingin ${actionText} permohonan untuk subdomain "${selectedApplication.domainName}"?`,
    };
  };

  const { title: dialogTitle, description: dialogDescription } = getDialogContent();


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
                        variant={statusConfig[app.status].variant}
                        className={cn(statusConfig[app.status].className)}
                      >
                        {statusConfig[app.status].text}
                      </Badge>
                    </TableCell>
                    <TableCell>{app.submittedDate}</TableCell>
                    
                      <TableCell>
                        <div className="flex items-center justify-center gap-2">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Link href={`/applications/${app.id}`}>
                                <Button variant="outline" size="icon" disabled={isProcessing}>
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
              disabled={currentPage === 0 || isProcessing}
              >
              Sebelumnya
              </Button>
              <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1))}
              disabled={currentPage >= totalPages - 1 || isProcessing}
              >
              Berikutnya
              </Button>
          </div>
        )}
      </div>
       <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{dialogTitle}</AlertDialogTitle>
            <AlertDialogDescription>
              {dialogDescription}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {actionType === 'reject' && (
              <div className="grid w-full gap-1.5 pt-2">
                <Label htmlFor="rejection-reason-table">Alasan Penolakan</Label>
                <Textarea 
                    id="rejection-reason-table" 
                    placeholder="Berikan alasan yang jelas mengapa permohonan ini ditolak..." 
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    disabled={isProcessing}
                />
              </div>
            )}
          <AlertDialogFooter className="pt-4">
            <AlertDialogCancel disabled={isProcessing}>Batal</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmAction} 
              disabled={isProcessing}
              className={cn(actionType === 'reject' && buttonVariants({ variant: "destructive" }))}
            >
              {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Ya, Lanjutkan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </TooltipProvider>
  );
}
