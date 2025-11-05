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
import { Loader2, Search, CheckCircle, XCircle, Server, HardDrive, Gauge } from 'lucide-react';
import type { HostingApplication } from '@/backend/models/types';
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

type StatusFilter = 'all' | 'pending_review' | 'pending_approval' | 'approved' | 'rejected';

function SuperAdminHostingApplicationsContent() {
  const searchParams = useSearchParams();
  const [applications, setApplications] = useState<HostingApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [opdFilter, setOpdFilter] = useState<string>('all');
  
  // Dialog states
  const [selectedApp, setSelectedApp] = useState<HostingApplication | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Resource allocation states (for approve action)
  const [allocatedStorage, setAllocatedStorage] = useState<number>(10); // GB
  const [allocatedBandwidth, setAllocatedBandwidth] = useState<number>(100); // GB/month
  const [hostingType, setHostingType] = useState<'cPanel' | 'Container'>('Container');

  const fetchApplications = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/hosting-applications');
      if (!response.ok) {
        throw new Error('Failed to fetch hosting applications');
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
      .map(app => app.opd)
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
      if (opdFilter !== 'all' && app.opd !== opdFilter) {
        return false;
      }
      
      // Search filter
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        return (
          app.applicationName?.toLowerCase().includes(search) ||
          app.domainName?.toLowerCase().includes(search) ||
          app.opd?.toLowerCase().includes(search) ||
          app.framework?.toLowerCase().includes(search)
        );
      }
      
      return true;
    });
  }, [applications, statusFilter, opdFilter, searchTerm]);

  // Count pending applications
  const pendingCount = useMemo(() => {
    return applications.filter(app => 
      app.status === 'pending_review' || app.status === 'pending_approval'
    ).length;
  }, [applications]);

  const handleOpenDialog = (app: HostingApplication, action: 'approve' | 'reject') => {
    setSelectedApp(app);
    setActionType(action);
    setComment('');
    
    // Reset allocation values untuk approve
    if (action === 'approve') {
      setAllocatedStorage(10);
      setAllocatedBandwidth(100);
      setHostingType('Container');
    }
  };

  const handleCloseDialog = () => {
    setSelectedApp(null);
    setActionType(null);
    setComment('');
    setAllocatedStorage(10);
    setAllocatedBandwidth(100);
    setHostingType('Container');
  };

  const handleSubmitAction = async () => {
    if (!selectedApp || !actionType) return;
    
    // Validation
    if (actionType === 'reject' && !comment.trim()) {
      alert('Alasan penolakan harus diisi!');
      return;
    }
    
    if (actionType === 'approve') {
      if (allocatedStorage <= 0) {
        alert('Kapasitas storage harus lebih dari 0 GB!');
        return;
      }
      if (allocatedBandwidth <= 0) {
        alert('Bandwidth harus lebih dari 0 GB!');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      // TODO: Call API to update hosting application status
      const newStatus = actionType === 'approve' ? 'approved' : 'rejected';
      
      const requestBody: any = {
        status: newStatus,
        comment: comment || undefined,
      };
      
      // Add resource allocation for approve
      if (actionType === 'approve') {
        requestBody.allocatedStorage = allocatedStorage;
        requestBody.allocatedBandwidth = allocatedBandwidth;
        requestBody.hostingType = hostingType;
      }
      
      const response = await fetch(`/api/hosting-applications/${selectedApp.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error('Failed to update hosting application');
      }

      // Refresh data
      await fetchApplications();
      
      // Close dialog
      handleCloseDialog();
      
      // Show success message
      alert(`Permohonan hosting berhasil ${actionType === 'approve' ? 'disetujui & dialokasikan' : 'ditolak'}!`);
      
    } catch (error) {
      console.error(error);
      alert('Gagal memproses permohonan. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending_review':
      case 'pending_approval':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Disetujui</Badge>;
      case 'rejected':
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
              <CardTitle className="text-2xl">Persetujuan Permohonan Hosting</CardTitle>
              <CardDescription>
                Tinjau, setujui, dan alokasikan sumber daya hosting untuk semua OPD
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
                placeholder="Cari aplikasi, domain, OPD, atau framework..."
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
                <SelectItem value="pending_review">Pending Review</SelectItem>
                <SelectItem value="pending_approval">Pending Approval</SelectItem>
                <SelectItem value="approved">Disetujui</SelectItem>
                <SelectItem value="rejected">Ditolak</SelectItem>
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
                    <th className="px-4 py-3 text-left text-sm font-medium">Aplikasi</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Domain</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Framework</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                    <th className="px-4 py-3 text-right text-sm font-medium">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredApplications.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                        Tidak ada permohonan yang ditemukan
                      </td>
                    </tr>
                  ) : (
                    filteredApplications.map((app) => (
                      <tr key={app.id} className="border-b hover:bg-muted/30">
                        <td className="px-4 py-3 text-sm">
                          {app.submittedDate ? new Date(app.submittedDate).toLocaleDateString('id-ID') : '-'}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium">{app.opd || '-'}</td>
                        <td className="px-4 py-3 text-sm">{app.applicationName || '-'}</td>
                        <td className="px-4 py-3 text-sm">
                          <code className="bg-muted px-2 py-1 rounded text-xs">
                            {app.domainName || '-'}
                          </code>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <Badge variant="secondary" className="text-xs">
                            {app.framework || '-'}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">{getStatusBadge(app.status || 'pending_review')}</td>
                        <td className="px-4 py-3 text-right">
                          {(app.status === 'pending_review' || app.status === 'pending_approval') ? (
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
                              {app.status === 'approved' ? 'Sudah Disetujui' : 'Sudah Ditolak'}
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {actionType === 'approve' ? 'Setujui & Alokasikan Hosting' : 'Tolak Permohonan Hosting'}
            </DialogTitle>
            <DialogDescription>
              {actionType === 'approve' 
                ? 'Atur alokasi sumber daya hosting untuk aplikasi ini' 
                : 'Mohon berikan alasan penolakan yang jelas'}
            </DialogDescription>
          </DialogHeader>
          
          {selectedApp && (
            <div className="space-y-4 py-4">
              {/* Application Details */}
              <div className="grid grid-cols-2 gap-3 text-sm bg-muted/50 p-4 rounded-lg">
                <div className="text-muted-foreground">OPD:</div>
                <div className="font-medium">{selectedApp.opd}</div>
                
                <div className="text-muted-foreground">Aplikasi:</div>
                <div className="font-medium">{selectedApp.applicationName}</div>
                
                <div className="text-muted-foreground">Domain:</div>
                <div className="font-mono text-xs bg-background px-2 py-1 rounded">{selectedApp.domainName}</div>
                
                <div className="text-muted-foreground">Framework:</div>
                <div><Badge variant="secondary">{selectedApp.framework}</Badge></div>
                
                <div className="text-muted-foreground">Deskripsi:</div>
                <div className="col-span-1 text-sm">{selectedApp.description || '-'}</div>
              </div>

              {/* Resource Allocation Form (for approve) */}
              {actionType === 'approve' && (
                <div className="space-y-4 border-t pt-4">
                  <h4 className="font-semibold text-sm flex items-center gap-2">
                    <Server className="h-4 w-4" />
                    Alokasi Sumber Daya Hosting
                  </h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {/* Hosting Type */}
                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="hostingType">Jenis Hosting *</Label>
                      <Select value={hostingType} onValueChange={(value: 'cPanel' | 'Container') => setHostingType(value)}>
                        <SelectTrigger id="hostingType">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Container">Container Hosting (Docker)</SelectItem>
                          <SelectItem value="cPanel">cPanel Hosting</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {/* Storage */}
                    <div className="space-y-2">
                      <Label htmlFor="storage" className="flex items-center gap-2">
                        <HardDrive className="h-4 w-4" />
                        Kapasitas Storage (GB) *
                      </Label>
                      <Input
                        id="storage"
                        type="number"
                        min="1"
                        max="1000"
                        value={allocatedStorage}
                        onChange={(e) => setAllocatedStorage(Number(e.target.value))}
                        placeholder="10"
                      />
                      <p className="text-xs text-muted-foreground">Minimal 1 GB, Maksimal 1000 GB</p>
                    </div>
                    
                    {/* Bandwidth */}
                    <div className="space-y-2">
                      <Label htmlFor="bandwidth" className="flex items-center gap-2">
                        <Gauge className="h-4 w-4" />
                        Bandwidth (GB/bulan) *
                      </Label>
                      <Input
                        id="bandwidth"
                        type="number"
                        min="1"
                        max="10000"
                        value={allocatedBandwidth}
                        onChange={(e) => setAllocatedBandwidth(Number(e.target.value))}
                        placeholder="100"
                      />
                      <p className="text-xs text-muted-foreground">Minimal 1 GB, Maksimal 10000 GB</p>
                    </div>
                  </div>
                  
                  {/* Summary */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm text-blue-900 font-medium mb-2">Ringkasan Alokasi:</p>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Jenis: <strong>{hostingType}</strong></li>
                      <li>• Storage: <strong>{allocatedStorage} GB</strong></li>
                      <li>• Bandwidth: <strong>{allocatedBandwidth} GB/bulan</strong></li>
                    </ul>
                  </div>
                </div>
              )}

              {/* Comment/Reason */}
              <div className="space-y-2">
                <Label htmlFor="comment">
                  {actionType === 'reject' ? 'Alasan Penolakan *' : 'Catatan (Opsional)'}
                </Label>
                <Textarea
                  id="comment"
                  placeholder={actionType === 'reject' 
                    ? 'Jelaskan alasan penolakan...' 
                    : 'Tambahkan catatan jika diperlukan...'}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
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
                      Setujui & Alokasikan
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

export default function SuperAdminHostingApplicationsPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    }>
      <SuperAdminHostingApplicationsContent />
    </Suspense>
  );
}
