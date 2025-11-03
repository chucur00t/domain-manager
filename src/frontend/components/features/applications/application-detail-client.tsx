
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import React, { useState, useTransition } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { ArrowLeft, Check, Download, FileText, X, Loader2, Info, Sparkles, Send, AlertTriangle } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
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
import { useToast } from '@/hooks/use-toast';
import { approveApplication, rejectApplication, forwardForApproval } from '@/backend/actions/applications';
import { cn } from '@/utils/utils';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import type { SubdomainApplication, User } from '@/backend/models/types';
import { WorkflowStepper } from '@/components/shared/workflow-stepper';
import { BackButton } from '@/components/shared/back-button';


const statusConfig = {
  pending: { text: 'Menunggu', variant: 'default' as const, step: 0 },
  pending_review: { text: 'Menunggu Review Admin', variant: 'default' as const, step: 1 },
  pending_approval: { text: 'Menunggu Persetujuan', variant: 'default' as const, step: 2 },
  approved: { text: 'Disetujui', variant: 'secondary' as const, step: 3 },
  rejected: { text: 'Ditolak', variant: 'destructive' as const, step: 0 },
};


function ApplicationDetailContent({ application }: { application: SubdomainApplication }) {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentUserRole = searchParams.get('role') as User['role'];
  const [isPending, startTransition] = useTransition();
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [actionType, setActionType] = useState<'forward' | 'approve' | 'reject' | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  
  const handleActionClick = (action: 'forward' | 'approve' | 'reject') => {
    setActionType(action);
    setRejectionReason('');
    setIsAlertOpen(true);
  };

  const handleConfirmAction = async () => {
    if (!actionType || !currentUserRole) return;
    
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
        result = await forwardForApproval(application.id, currentUserRole);
      } else if (actionType === 'approve') {
        result = await approveApplication(application.id, currentUserRole);
      } else {
        result = await rejectApplication(application.id, rejectionReason, currentUserRole);
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
    });
  };

  const getDialogContent = () => {
    switch(actionType) {
        case 'forward':
            return {
                title: 'Konfirmasi Lanjutkan Permohonan',
                description: `Apakah Anda yakin data permohonan untuk "${application.domainName}" sudah lengkap dan ingin meneruskannya untuk persetujuan final?`,
            };
        case 'approve':
            return {
                title: 'Konfirmasi Persetujuan Final',
                description: `Apakah Anda yakin ingin menyetujui secara final permohonan untuk subdomain "${application.domainName}"?`,
            };
        case 'reject':
            return {
                title: 'Konfirmasi Penolakan',
                description: `Apakah Anda yakin ingin menolak permohonan untuk subdomain "${application.domainName}"?`,
            };
        default:
            return { title: '', description: '' };
    }
  }

  const { title: dialogTitle, description: dialogDescription } = getDialogContent();
  const currentStatusInfo = statusConfig[application.status];
  const isSuperAdmin = currentUserRole === 'Super Admin';
  const isAdministrator = currentUserRole === 'Administrator';


  const renderActionButtons = () => {
    if (isSuperAdmin && application.status === 'pending_review') {
        return (
            <>
                <Button size="sm" variant="destructive" className="gap-1 w-full md:w-auto" onClick={() => handleActionClick('reject')} disabled={isPending}>
                    {isPending && actionType === 'reject' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <X className="h-3.5 w-3.5" />}
                    Tolak
                </Button>
                <Button size="sm" className="gap-1 w-full md:w-auto" onClick={() => handleActionClick('forward')} disabled={isPending}>
                    {isPending && actionType === 'forward' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                    Lanjutkan ke Persetujuan
                </Button>
            </>
        )
    }

    if (isAdministrator && application.status === 'pending_approval') {
         return (
            <>
                <Button size="sm" variant="destructive" className="gap-1 w-full md:w-auto" onClick={() => handleActionClick('reject')} disabled={isPending}>
                    {isPending && actionType === 'reject' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <X className="h-3.5 w-3.5" />}
                    Tolak
                </Button>
                <Button size="sm" className="gap-1 w-full md:w-auto" onClick={() => handleActionClick('approve')} disabled={isPending}>
                    {isPending && actionType === 'approve' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                    Setujui (Final)
                </Button>
            </>
         )
    }

    return null;
  }


  return (
    <>
    <div className="flex flex-col gap-6">
       <div className="flex items-center gap-4">
        <BackButton />
        <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
            Detail Permohonan
        </h1>
        <Badge variant={currentStatusInfo.variant} className="ml-auto sm:ml-0">
            {currentStatusInfo.text}
        </Badge>
        <div className="hidden items-center gap-2 md:ml-auto md:flex">
            {renderActionButtons()}
        </div>
      </div>
      
      <Card>
        <CardHeader>
           <WorkflowStepper
              currentStep={currentStatusInfo.step}
              isRejected={application.status === 'rejected'}
            />
        </CardHeader>
      </Card>


       {application.status === 'rejected' && application.rejectionReason && (
        <Alert variant="destructive">
          <Info className="h-4 w-4" />
          <AlertTitle>Alasan Penolakan</AlertTitle>
          <AlertDescription>
            {application.rejectionReason}
          </AlertDescription>
        </Alert>
      )}

      <Card>
          <CardHeader>
          <CardTitle>{application.domainName}</CardTitle>
          <CardDescription>
              Diajukan oleh {application.applicantName} dari {application.opd} pada {application.submittedDate}.
          </CardDescription>
          </CardHeader>
          <CardContent>
          <div className="space-y-6">
              <div>
              <h3 className="font-semibold text-lg mb-2">Detail Pemohon</h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                  <p className="text-muted-foreground">Nama Pemohon</p>
                  <p className="font-medium">{application.applicantName}</p>
                  </div>
                  <div>
                  <p className="text-muted-foreground">Organisasi Perangkat Daerah (OPD)</p>
                  <p className="font-medium">{application.opd}</p>
                  </div>
              </div>
              </div>
              <Separator />
              <div>
              <h3 className="font-semibold text-lg mb-2">Deskripsi Permohonan</h3>
              <p className="text-sm text-muted-foreground">
                  {application.description}
              </p>
              </div>
              <Separator />
              <div>
              <h3 className="font-semibold text-lg mb-2">Dokumen Pendukung</h3>
              <div className="flex flex-col gap-2">
                  {application.documents && application.documents.length > 0 ? (
                    application.documents.map((doc, index) => (
                      <Button key={index} variant="outline" className="justify-start max-w-xs gap-2">
                          <FileText className="h-4 w-4" />
                          <span>{doc}</span>
                          <Download className="h-4 w-4 ml-auto" />
                      </Button>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">Tidak ada dokumen</p>
                  )}
              </div>
              </div>
          </div>
          </CardContent>
      </Card>
      
      <div className="mt-6 flex items-center justify-end gap-2 md:hidden">
            {renderActionButtons()}
      </div>
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
                <Label htmlFor="rejection-reason">Alasan Penolakan</Label>
                <Textarea 
                    id="rejection-reason" 
                    placeholder="Berikan alasan yang jelas mengapa permohonan ini ditolak..." 
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    disabled={isPending}
                />
              </div>
            )}
          <AlertDialogFooter className="pt-4">
            <AlertDialogCancel disabled={isPending}>Batal</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmAction} 
              disabled={isPending}
              className={cn(actionType === 'reject' && buttonVariants({ variant: "destructive" }))}
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Ya, Lanjutkan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export function ApplicationDetailClient({ application }: { application: SubdomainApplication }) {
    return (
        <React.Suspense fallback={<div className="flex w-full h-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>}>
            <ApplicationDetailContent application={application} />
        </React.Suspense>
    )
}

