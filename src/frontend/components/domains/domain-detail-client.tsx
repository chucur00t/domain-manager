

'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Edit, GanttChartSquare, CheckCircle, Trash2, Loader2, PlayCircle } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { EditDomainForm } from '@/components/features/domains/edit-domain-form';
import type { Domain, User } from '@/backend/models/types';
import { useTransition, useState, Suspense } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useRouter, useSearchParams } from 'next/navigation';
import { activateDomain, deactivateDomain } from '@/backend/actions/domains';
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { BackButton } from '../shared/back-button';

const statusVariantMap = {
  pending: 'default',
  active: 'secondary',
  inactive: 'outline',
  expired: 'destructive',
  error: 'destructive',
} as const;

function DomainDetailContent({ domain }: { domain: Domain }) {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentUserRole = searchParams.get('role') as User['role'];
  const roleQuery = `?role=${currentUserRole || ''}`;

  const [isPending, startTransition] = useTransition();
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [actionType, setActionType] = useState<'activate' | 'deactivate' | null>(null);

  const handleActionClick = (action: 'activate' | 'deactivate') => {
    setActionType(action);
    setIsAlertOpen(true);
  };

  const handleConfirmAction = () => {
    if (!actionType || !currentUserRole) return;
    
    startTransition(async () => {
      const result = actionType === 'activate' 
        ? await activateDomain(domain.id, currentUserRole)
        : await deactivateDomain(domain.id, currentUserRole);

      if (result.success) {
        toast({ title: 'Sukses', description: result.message });
        router.refresh();
      } else {
        toast({ title: 'Error', description: result.message, variant: 'destructive' });
      }
      setIsAlertOpen(false);
    });
  };

  const getDialogContent = () => {
    if (actionType === 'activate') {
      return {
        title: 'Konfirmasi Aktivasi Domain',
        description: `Apakah Anda yakin ingin mengaktifkan domain "${domain.hostname}"? Ini akan membuatnya dapat diakses publik.`,
        confirmText: 'Ya, Aktifkan',
        variant: 'default' as const,
      };
    }
    return {
      title: 'Konfirmasi Penonaktifan Domain',
      description: `Apakah Anda yakin ingin menonaktifkan domain "${domain.hostname}"? Tindakan ini dapat mengganggu layanan yang terkait.`,
      confirmText: 'Ya, Nonaktifkan',
      variant: 'destructive' as const,
    };
  };
  
  const { title, description, confirmText, variant } = getDialogContent();
  const isPengelola = currentUserRole === 'Pengelola Sistem';
  const isKabid = currentUserRole === 'Kepala Bidang';

  const ActionButton = () => {
    if (!isKabid) return null;

    if (domain.status === 'active') {
      return (
        <Button size="sm" variant="destructive" className="gap-1" onClick={() => handleActionClick('deactivate')} disabled={isPending}>
          <Trash2 className="h-3.5 w-3.5" />
          Nonaktifkan
        </Button>
      );
    }
    if (domain.status === 'pending' || domain.status === 'inactive') {
      return (
        <Button size="sm" className="gap-1" onClick={() => handleActionClick('activate')} disabled={isPending}>
          <PlayCircle className="h-3.5 w-3.5" />
          Aktifkan Domain
        </Button>
      );
    }
    return null;
  };

  return (
    <TooltipProvider>
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <BackButton />
          <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
              Detail Domain
          </h1>
          <Badge variant={statusVariantMap[domain.status]} className="ml-auto sm:ml-0">
              {domain.status.charAt(0).toUpperCase() + domain.status.slice(1)}
          </Badge>
          <div className="hidden items-center gap-2 md:ml-auto md:flex">
              <ActionButton />
              <Link href={`/domains/${domain.id}/monitor${roleQuery}`}>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button size="sm" variant="outline" className="gap-1" disabled={isPending}>
                            <GanttChartSquare className="h-3.5 w-3.5" />
                            Monitor
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Monitor Performa Domain</p>
                    </TooltipContent>
                </Tooltip>
              </Link>
              {isPengelola && (
                <EditDomainForm domain={domain}>
                  <Tooltip>
                      <TooltipTrigger asChild>
                          <Button size="sm" variant="outline" className="gap-1" disabled={isPending}>
                              <Edit className="h-3.5 w-3.5" />
                              Ubah
                          </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                          <p>Ubah Informasi Teknis</p>
                      </TooltipContent>
                  </Tooltip>
                </EditDomainForm>
              )}
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>{domain.hostname}</CardTitle>
            <CardDescription>
              Subdomain milik {domain.opd}.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-lg mb-2">Informasi Domain</h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Domain Induk</p>
                    <p className="font-medium">{domain.parentDomain}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Organisasi Perangkat Daerah (OPD)</p>
                    <p className="font-medium">{domain.opd}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Status</p>
                    <p className="font-medium capitalize">{domain.status}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Tanggal Dibuat/Aktivasi</p>
                    <p className="font-medium">{domain.activationDate}</p>
                  </div>
                </div>
              </div>
              <Separator />
              <div>
                <h3 className="font-semibold text-lg mb-2">Informasi Teknis</h3>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Hostname</p>
                    <p className="font-mono">{domain.hostname || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">TTL</p>
                    <p className="font-mono">{domain.ttl || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Record Type</p>
                    <p className="font-mono">{domain.recordType || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Priority</p>
                    <p className="font-mono">{domain.priority || 'N/A'}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-muted-foreground">Destination</p>
                    <p className="font-mono">{domain.destination || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <div className="items-center gap-2 md:ml-auto flex md:hidden">
            <ActionButton />
            <Link href={`/domains/${domain.id}/monitor${roleQuery}`} className="w-full">
              <Button size="sm" variant="outline" className="gap-1 w-full">
                  <GanttChartSquare className="h-3.5 w-3.5" />
                  Monitor
              </Button>
            </Link>
            {isPengelola && (
              <EditDomainForm domain={domain}>
                  <Button size="sm" variant="outline" className="gap-1 w-full">
                      <Edit className="h-3.5 w-3.5" />
                      Ubah
                  </Button>
              </EditDomainForm>
            )}
        </div>
      </div>
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{title}</AlertDialogTitle>
            <AlertDialogDescription>{description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Batal</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmAction} 
              disabled={isPending} 
              className={buttonVariants({ variant: variant })}
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {confirmText}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </TooltipProvider>
  );
}


export function DomainDetailClient({ domain }: { domain: Domain }) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DomainDetailContent domain={domain} />
    </Suspense>
  )
}
