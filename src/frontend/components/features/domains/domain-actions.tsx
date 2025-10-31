import { Button } from '@/components/ui/button';
import { Domain, User } from '@/backend/models/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/frontend/hooks/use-toast';
import { MoreHorizontal, PlayIcon, StopCircleIcon } from 'lucide-react';
import { useState } from 'react';

interface DomainActionsProps {
  domain: Domain;
  currentUser: User | null;
  onAction: () => void;
}

export function DomainActions({ domain, currentUser, onAction }: DomainActionsProps) {
  const [isDeactivateOpen, setIsDeactivateOpen] = useState(false);
  const [deactivateReason, setDeactivateReason] = useState('');
  const { toast } = useToast();

  const handleDeactivateSubmit = async () => {
    if (!currentUser) return;

    try {
      const response = await fetch('/api/domains/activation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': currentUser.role, // ✅ SECURITY: Include user role for backend validation
        },
        body: JSON.stringify({
          domainId: domain.id,
          action: 'deactivate',
          userId: currentUser.id,
          reason: deactivateReason,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to deactivate domain');
      }

      toast({
        title: 'Domain berhasil dinonaktifkan',
        description: `Domain ${domain.hostname} telah dinonaktifkan.`,
      });
      
      setIsDeactivateOpen(false);
      setDeactivateReason('');
      onAction();
    } catch (error) {
      console.error('Error deactivating domain:', error);
      toast({
        title: 'Error',
        description: 'Gagal menonaktifkan domain. Silakan coba lagi.',
        variant: 'destructive',
      });
    }
  };

  const handleActivate = async () => {
    if (!currentUser) return;

    try {
      const response = await fetch('/api/domains/activation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': currentUser.role, // ✅ SECURITY: Include user role for backend validation
        },
        body: JSON.stringify({
          domainId: domain.id,
          action: 'activate',
          userId: currentUser.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to activate domain');
      }

      toast({
        title: 'Domain berhasil diaktifkan',
        description: `Domain ${domain.hostname} telah diaktifkan.`,
      });
      
      onAction();
    } catch (error) {
      console.error('Error activating domain:', error);
      toast({
        title: 'Error',
        description: 'Gagal mengaktifkan domain. Silakan coba lagi.',
        variant: 'destructive',
      });
    }
  };

  // ✅ PERBAIKAN PERMISSION - Sesuai dengan SRS:
  // Only Super Admin can manage domains (activate/deactivate/suspend)
  // Admin Daerah can only submit applications
  const canManageDomains = currentUser && currentUser.role === 'Super Admin';

  if (!canManageDomains) return null;

  return (
    <Dialog open={isDeactivateOpen} onOpenChange={setIsDeactivateOpen}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Buka menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Aksi</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {domain.status === 'inactive' ? (
            <DropdownMenuItem onClick={handleActivate}>
              <PlayIcon className="mr-2 h-4 w-4" />
              Aktifkan Domain
            </DropdownMenuItem>
          ) : (
            <DialogTrigger asChild>
              <DropdownMenuItem>
                <StopCircleIcon className="mr-2 h-4 w-4" />
                Nonaktifkan Domain
              </DropdownMenuItem>
            </DialogTrigger>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nonaktifkan Domain</DialogTitle>
          <DialogDescription>
            Masukkan alasan penonaktifan domain {domain.hostname}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Textarea
            id="reason"
            placeholder="Alasan penonaktifan domain..."
            value={deactivateReason}
            onChange={(e) => setDeactivateReason(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setIsDeactivateOpen(false)}>
            Batal
          </Button>
          <Button 
            type="button" 
            onClick={handleDeactivateSubmit}
            disabled={!deactivateReason.trim()}
          >
            Konfirmasi
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
