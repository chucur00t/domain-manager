

'use client';

import type { HostingApplication, User } from '@/backend/models/types';
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
import { Eye, Check, X, Loader2, Send } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useState, useTransition, useEffect, Suspense } from 'react';
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
import { approveHostingApplication, rejectHostingApplication, forwardHostingForApproval } from '@/backend/actions/hosting';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { cn } from '@/utils/utils';
import { useRouter, useSearchParams } from 'next/navigation';

type HostingApplicationsTableProps = {
  applications: HostingApplication[];
};

type ActionType = 'forward' | 'approve' | 'reject';

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

function HostingApplicationsTableContent({ applications }: HostingApplicationsTableProps) {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentUserRole = searchParams.get('role') as User['role'];
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [isProcessing, startTransition] = useTransition();
  const [selectedApplication, setSelectedApplication] = useState<HostingApplication | null>(null);
  const [actionType, setActionType] = useState<ActionType | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [rejectionReason, setRejectionReason] = useState('');

  const isSuperAdmin = currentUserRole === 'Super Admin';
  const isAdministrator = currentUserRole === 'Admin Daerah';

  useEffect(() => {
    setCurrentPage(0);
  }, [applications]);

  const totalPages = Math.ceil(applications.length / ITEMS_PER_PAGE);
  const startIndex = currentPage * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentApplications = applications.slice(startIndex, endIndex);

  const handleActionClick = (application: HostingApplication, action: ActionType) => {
    setSelectedApplication(application);
    setActionType(action);
    setRejectionReason('');
    setIsAlertOpen(true);
  };

  const handleConfirmAction = async () => {
    if (!selectedApplication || !actionType || !currentUserRole) return;
    
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
      if (actionType === 'forward') {
        result = await forwardHostingForApproval(String(selectedApplication.id), currentUserRole);
      } else if (actionType === 'approve') {
        result = await approveHostingApplication(String(selectedApplication.id), currentUserRole);
      } else {
        result = await rejectHostingApplication(String(selectedApplication.id), rejectionReason, currentUserRole);
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
    switch(actionType) {
        case 'forward':
            return {
                title: 'Konfirmasi Lanjutkan Permohonan',
                description: `Lanjutkan permohonan hosting untuk "${selectedApplication.applicationName}" ke tahap persetujuan final?`,
            };
        case 'approve':
            return {
                title: 'Konfirmasi Persetujuan Final',
                description: `Setujui secara final permohonan hosting untuk "${selectedApplication.applicationName}"?`,
            };
        case 'reject':
            return {
                title: 'Konfirmasi Penolakan',
                description: `Tolak permohonan hosting untuk aplikasi "${selectedApplication.applicationName}"?`,
            };
        default:
            return { title: '', description: '' };
    }
  };

  const { title: dialogTitle, description: dialogDescription } = getDialogContent();


  return (
    <TooltipProvider>
      <div className="border rounded-lg">
        <div className="relative w-full overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Aplikasi</TableHead>
                <TableHead>Domain</TableHead>
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
                    <TableCell className="font-medium">{app.applicationName}</TableCell>
                    <TableCell>{app.domainName}</TableCell>
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
                              <Link href={`/hosting/${app.id}?role=${currentUserRole || ''}`}>
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
                          {isSuperAdmin && app.status === 'pending_review' && (
                            <>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="secondary" size="icon" onClick={() => handleActionClick(app, 'forward')} disabled={isProcessing}>
                                  <Send className="h-4 w-4" />
                                  <span className="sr-only">Lanjutkan</span>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent><p>Lanjutkan ke Persetujuan</p></TooltipContent>
                            </Tooltip>
                             <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="destructive" size="icon" onClick={() => handleActionClick(app, 'reject')} disabled={isProcessing}>
                                  <X className="h-4 w-4" />
                                  <span className="sr-only">Tolak</span>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent><p>Tolak</p></TooltipContent>
                            </Tooltip>
                            </>
                          )}
                          {isAdministrator && app.status === 'pending_approval' && (
                            <>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="secondary" size="icon" onClick={() => handleActionClick(app, 'approve')} disabled={isProcessing}>
                                  <Check className="h-4 w-4" />
                                  <span className="sr-only">Setujui</span>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent><p>Setujui (Final)</p></TooltipContent>
                            </Tooltip>
                             <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="destructive" size="icon" onClick={() => handleActionClick(app, 'reject')} disabled={isProcessing}>
                                  <X className="h-4 w-4" />
                                  <span className="sr-only">Tolak</span>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent><p>Tolak</p></TooltipContent>
                            </Tooltip>
                            </>
                          )}
                        </div>
                      </TableCell>
                    
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
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

export function HostingApplicationsTable({ applications }: HostingApplicationsTableProps) {
    return (
        <Suspense fallback={<div className="flex w-full h-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
            <HostingApplicationsTableContent applications={applications} />
        </Suspense>
    )
}

