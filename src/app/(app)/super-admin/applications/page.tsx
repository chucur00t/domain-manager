'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search, CheckCircle, XCircle, AlertCircle, Filter } from 'lucide-react';
import type { SubdomainApplication } from '@/backend/models/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

type StatusFilter = 'all' | 'Pending' | 'Approved' | 'Rejected';

function SuperAdminApplicationsContent() {
  const searchParams = useSearchParams();
  const [applications, setApplications] = useState<SubdomainApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [opdFilter, setOpdFilter] = useState<string>('all');
  
  // Dialog states
  const [selectedApp, setSelectedApp] = useState<SubdomainApplication | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchApplications = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/applications');
      if (!response.ok) {
        throw new Error('Failed to fetch applications');
      }
      const data = await response.json();
      setApplications(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  // Get unique OPDs for filter
  const allOpds = useMemo(() => {
    const opds = applications
      .map(app => app.opd_name)
      .filter((opd, index, self) => opd && self.indexOf(opd) === index);
    return opds.sort();
  }, [applications]);

  // Filtered applications
  const filteredApplications = useMemo(() => {
    return applications.filter(app => {
      // Status filter
      if (statusFilter !== 'all' && app.status !== statusFilter) {
        return false;
      }
      
      // OPD filter
      if (opdFilter !== 'all' && app.opd_name !== opdFilter) {
        return false;
      }
      
      // Search filter
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        return (
          app.subdomain?.toLowerCase().includes(search) ||
          app.opd_name?.toLowerCase().includes(search) ||
          app.purpose?.toLowerCase().includes(search)
        );
      }
      
      return true;
    });
  }, [applications, statusFilter, opdFilter, searchTerm]);

  // Count pending applications
  const pendingCount = useMemo(() => {
    return applications.filter(app => app.status === 'Pending').length;
  }, [applications]);

  const handleOpenDialog = (app: SubdomainApplication, action: 'approve' | 'reject') => {
    setSelectedApp(app);
    setActionType(action);
    setComment('');
  };

  const handleCloseDialog = () => {
    setSelectedApp(null);
    setActionType(null);
    setComment('');
  };

  const handleSubmitAction = async () => {
    if (!selectedApp || !actionType) return;
    
    // Validation: Reject requires comment
    if (actionType === 'reject' && !comment.trim()) {
      alert('Alasan penolakan harus diisi!');
      return;
    }

    setIsSubmitting(true);
    try {
      // TODO: Call API to update application status
      const newStatus = actionType === 'approve' ? 'Approved' : 'Rejected';
      
      const response = await fetch(`/api/applications/${selectedApp.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
          comment: comment || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update application');
      }

      // Refresh data
      await fetchApplications();
      
      // Close dialog
      handleCloseDialog();
      
      // Show success message
      alert(`Permohonan berhasil ${actionType === 'approve' ? 'disetujui' : 'ditolak'}!`);
      
    } catch (error) {
      console.error(error);
      alert('Gagal memproses permohonan. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
      case 'Approved':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Disetujui</Badge>;
      case 'Rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Ditolak</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Persetujuan Permohonan Domain</CardTitle>
              <CardDescription>
                Tinjau dan proses permohonan domain dari semua OPD
              </CardDescription>
            </div>
            {pendingCount > 0 && (
              <Badge variant="destructive" className="text-lg px-3 py-1">
                {pendingCount} Pending
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari domain, OPD, atau tujuan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as StatusFilter)}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Approved">Disetujui</SelectItem>
                <SelectItem value="Rejected">Ditolak</SelectItem>
              </SelectContent>
            </Select>
            <Select value={opdFilter} onValueChange={setOpdFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Filter OPD" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua OPD</SelectItem>
                {allOpds.map(opd => (
                  <SelectItem key={opd} value={opd}>{opd}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Results info */}
          <div className="text-sm text-muted-foreground">
            Menampilkan {filteredApplications.length} dari {applications.length} permohonan
          </div>

          {/* Applications Table */}
          <div className="border rounded-lg">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr className="border-b">
                    <th className="px-4 py-3 text-left text-sm font-medium">Tanggal</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">OPD</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Domain</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Tujuan</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                    <th className="px-4 py-3 text-right text-sm font-medium">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredApplications.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                        Tidak ada permohonan yang ditemukan
                      </td>
                    </tr>
                  ) : (
                    filteredApplications.map((app) => (
                      <tr key={app.id} className="border-b hover:bg-muted/30">
                        <td className="px-4 py-3 text-sm">
                          {app.created_at ? new Date(app.created_at).toLocaleDateString('id-ID') : '-'}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium">{app.opd_name || '-'}</td>
                        <td className="px-4 py-3 text-sm">
                          <code className="bg-muted px-2 py-1 rounded text-xs">
                            {app.subdomain || '-'}
                          </code>
                        </td>
                        <td className="px-4 py-3 text-sm max-w-xs truncate">{app.purpose || '-'}</td>
                        <td className="px-4 py-3">{getStatusBadge(app.status || 'Pending')}</td>
                        <td className="px-4 py-3 text-right">
                          {app.status === 'Pending' ? (
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-green-600 border-green-200 hover:bg-green-50"
                                onClick={() => handleOpenDialog(app, 'approve')}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Setujui
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 border-red-200 hover:bg-red-50"
                                onClick={() => handleOpenDialog(app, 'reject')}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Tolak
                              </Button>
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">
                              {app.status === 'Approved' ? 'Sudah Disetujui' : 'Sudah Ditolak'}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={!!selectedApp && !!actionType} onOpenChange={(open) => !open && handleCloseDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'approve' ? 'Setujui Permohonan' : 'Tolak Permohonan'}
            </DialogTitle>
            <DialogDescription>
              {actionType === 'approve' 
                ? 'Domain akan diaktifkan dan notifikasi akan dikirim ke OPD.' 
                : 'Mohon berikan alasan penolakan yang jelas.'}
            </DialogDescription>
          </DialogHeader>
          
          {selectedApp && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-muted-foreground">OPD:</div>
                <div className="font-medium">{selectedApp.opd_name}</div>
                <div className="text-muted-foreground">Domain:</div>
                <div className="font-mono text-xs bg-muted px-2 py-1 rounded">{selectedApp.subdomain}</div>
                <div className="text-muted-foreground">Tujuan:</div>
                <div className="col-span-1">{selectedApp.purpose}</div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="comment">
                  {actionType === 'reject' ? 'Alasan Penolakan *' : 'Komentar (Opsional)'}
                </Label>
                <Textarea
                  id="comment"
                  placeholder={actionType === 'reject' 
                    ? 'Jelaskan alasan penolakan...' 
                    : 'Tambahkan catatan jika diperlukan...'}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={4}
                  required={actionType === 'reject'}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog} disabled={isSubmitting}>
              Batal
            </Button>
            <Button
              onClick={handleSubmitAction}
              disabled={isSubmitting || (actionType === 'reject' && !comment.trim())}
              variant={actionType === 'approve' ? 'default' : 'destructive'}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Memproses...
                </>
              ) : (
                <>
                  {actionType === 'approve' ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Setujui & Aktifkan
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 mr-2" />
                      Tolak Permohonan
                    </>
                  )}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function SuperAdminApplicationsPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    }>
      <SuperAdminApplicationsContent />
    </Suspense>
  );
}
