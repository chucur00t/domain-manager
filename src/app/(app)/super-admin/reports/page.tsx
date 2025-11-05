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
import { Badge } from '@/components/ui/badge';
import { 
  Loader2, 
  FileText, 
  Download,
  TrendingUp,
  Globe,
  Server,
  Users,
  Calendar,
  BarChart3,
  PieChart,
  CheckCircle2,
  XCircle,
  Clock,
  Filter
} from 'lucide-react';
import type { Domain, SubdomainApplication, HostingApplication } from '@/backend/models/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

type ReportPeriod = 'week' | 'month' | 'quarter' | 'year' | 'all';
type ReportType = 'overview' | 'domains' | 'applications' | 'hosting' | 'opd';

interface ReportData {
  domains: {
    total: number;
    active: number;
    inactive: number;
    expired: number;
    byOpd: { opd: string; count: number }[];
  };
  applications: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    approvalRate: number;
    byOpd: { opd: string; pending: number; approved: number; rejected: number }[];
  };
  hosting: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    approvalRate: number;
    byFramework: { framework: string; count: number }[];
  };
  opd: {
    totalOpds: number;
    mostActive: { opd: string; totalRequests: number }[];
  };
}

function SuperAdminReportsContent() {
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [reportPeriod, setReportPeriod] = useState<ReportPeriod>('month');
  const [reportType, setReportType] = useState<ReportType>('overview');
  
  const [domains, setDomains] = useState<Domain[]>([]);
  const [applications, setApplications] = useState<SubdomainApplication[]>([]);
  const [hostingApps, setHostingApps] = useState<HostingApplication[]>([]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [domainsRes, appsRes, hostingRes] = await Promise.all([
        fetch('/api/domains'),
        fetch('/api/applications'),
        fetch('/api/hosting-applications'),
      ]);

      const [domainsData, appsData, hostingData] = await Promise.all([
        domainsRes.json(),
        appsRes.json(),
        hostingRes.json(),
      ]);

      setDomains(domainsData);
      setApplications(appsData);
      setHostingApps(hostingData);
    } catch (error) {
      console.error('Failed to fetch report data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Calculate report data
  const reportData: ReportData = useMemo(() => {
    // Filter by period (for now, showing all data - can add date filtering later)
    const filteredDomains = domains;
    const filteredApps = applications;
    const filteredHosting = hostingApps;

    // Domain statistics
    const domainsByOpd = filteredDomains.reduce((acc, domain) => {
      const opd = domain.opd || 'Unknown';
      acc[opd] = (acc[opd] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Application statistics by OPD
    const appsByOpd = filteredApps.reduce((acc, app) => {
      const opd = app.opd || 'Unknown';
      if (!acc[opd]) {
        acc[opd] = { opd, pending: 0, approved: 0, rejected: 0 };
      }
      if (app.status === 'pending_review' || app.status === 'pending_approval') {
        acc[opd].pending++;
      } else if (app.status === 'approved') {
        acc[opd].approved++;
      } else if (app.status === 'rejected') {
        acc[opd].rejected++;
      }
      return acc;
    }, {} as Record<string, { opd: string; pending: number; approved: number; rejected: number }>);

    // Hosting by framework
    const hostingByFramework = filteredHosting.reduce((acc, app) => {
      const framework = app.framework || 'Unknown';
      acc[framework] = (acc[framework] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calculate approval rates
    const totalApps = filteredApps.length;
    const approvedApps = filteredApps.filter(a => a.status === 'approved').length;
    const appApprovalRate = totalApps > 0 ? (approvedApps / totalApps) * 100 : 0;

    const totalHosting = filteredHosting.length;
    const approvedHosting = filteredHosting.filter(a => a.status === 'approved').length;
    const hostingApprovalRate = totalHosting > 0 ? (approvedHosting / totalHosting) * 100 : 0;

    // Most active OPDs
    const opdActivity = filteredApps.reduce((acc, app) => {
      const opd = app.opd || 'Unknown';
      acc[opd] = (acc[opd] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const mostActive = Object.entries(opdActivity)
      .map(([opd, count]) => ({ opd, totalRequests: count }))
      .sort((a, b) => b.totalRequests - a.totalRequests)
      .slice(0, 5);

    return {
      domains: {
        total: filteredDomains.length,
        active: filteredDomains.filter(d => d.status === 'active').length,
        inactive: filteredDomains.filter(d => d.status === 'inactive').length,
        expired: filteredDomains.filter(d => d.status === 'expired').length,
        byOpd: Object.entries(domainsByOpd)
          .map(([opd, count]) => ({ opd, count }))
          .sort((a, b) => b.count - a.count),
      },
      applications: {
        total: filteredApps.length,
        pending: filteredApps.filter(a => a.status === 'pending_review' || a.status === 'pending_approval').length,
        approved: approvedApps,
        rejected: filteredApps.filter(a => a.status === 'rejected').length,
        approvalRate: appApprovalRate,
        byOpd: Object.values(appsByOpd).sort((a, b) => (b.approved + b.pending + b.rejected) - (a.approved + a.pending + a.rejected)),
      },
      hosting: {
        total: filteredHosting.length,
        pending: filteredHosting.filter(a => a.status === 'pending_review' || a.status === 'pending_approval').length,
        approved: approvedHosting,
        rejected: filteredHosting.filter(a => a.status === 'rejected').length,
        approvalRate: hostingApprovalRate,
        byFramework: Object.entries(hostingByFramework)
          .map(([framework, count]) => ({ framework, count }))
          .sort((a, b) => b.count - a.count),
      },
      opd: {
        totalOpds: new Set([...filteredApps.map(a => a.opd), ...filteredDomains.map(d => d.opd)]).size,
        mostActive,
      },
    };
  }, [domains, applications, hostingApps, reportPeriod]);

  const handleExportCSV = () => {
    let csvContent = '';
    let filename = '';

    switch (reportType) {
      case 'domains':
        csvContent = 'OPD,Jumlah Domain\n';
        reportData.domains.byOpd.forEach(item => {
          csvContent += `${item.opd},${item.count}\n`;
        });
        filename = 'laporan-domain.csv';
        break;
      
      case 'applications':
        csvContent = 'OPD,Pending,Disetujui,Ditolak,Total\n';
        reportData.applications.byOpd.forEach(item => {
          csvContent += `${item.opd},${item.pending},${item.approved},${item.rejected},${item.pending + item.approved + item.rejected}\n`;
        });
        filename = 'laporan-permohonan-domain.csv';
        break;
      
      case 'hosting':
        csvContent = 'Framework,Jumlah Aplikasi\n';
        reportData.hosting.byFramework.forEach(item => {
          csvContent += `${item.framework},${item.count}\n`;
        });
        filename = 'laporan-hosting.csv';
        break;
      
      case 'opd':
        csvContent = 'OPD,Total Permohonan\n';
        reportData.opd.mostActive.forEach(item => {
          csvContent += `${item.opd},${item.totalRequests}\n`;
        });
        filename = 'laporan-aktivitas-opd.csv';
        break;
      
      default: // overview
        csvContent = 'Kategori,Metrik,Nilai\n';
        csvContent += `Domain,Total,${reportData.domains.total}\n`;
        csvContent += `Domain,Aktif,${reportData.domains.active}\n`;
        csvContent += `Domain,Tidak Aktif,${reportData.domains.inactive}\n`;
        csvContent += `Permohonan Domain,Total,${reportData.applications.total}\n`;
        csvContent += `Permohonan Domain,Disetujui,${reportData.applications.approved}\n`;
        csvContent += `Permohonan Domain,Ditolak,${reportData.applications.rejected}\n`;
        csvContent += `Permohonan Domain,Approval Rate,${reportData.applications.approvalRate.toFixed(2)}%\n`;
        csvContent += `Hosting,Total,${reportData.hosting.total}\n`;
        csvContent += `Hosting,Disetujui,${reportData.hosting.approved}\n`;
        csvContent += `Hosting,Ditolak,${reportData.hosting.rejected}\n`;
        csvContent += `Hosting,Approval Rate,${reportData.hosting.approvalRate.toFixed(2)}%\n`;
        filename = 'laporan-overview.csv';
    }

    // Create download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = () => {
    alert('Export PDF akan segera tersedia. Untuk saat ini, silakan gunakan Export CSV atau Print halaman ini.');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              <div>
                <CardTitle className="text-2xl">Laporan & Statistik</CardTitle>
                <CardDescription>
                  Analisis lengkap aktivitas domain, hosting, dan permohonan
                </CardDescription>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleExportCSV}>
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
              <Button variant="outline" size="sm" onClick={handleExportPDF}>
                <Download className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Filter:</span>
            </div>
            <Select value={reportPeriod} onValueChange={(value) => setReportPeriod(value as ReportPeriod)}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Periode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">7 Hari Terakhir</SelectItem>
                <SelectItem value="month">30 Hari Terakhir</SelectItem>
                <SelectItem value="quarter">3 Bulan Terakhir</SelectItem>
                <SelectItem value="year">1 Tahun Terakhir</SelectItem>
                <SelectItem value="all">Semua Data</SelectItem>
              </SelectContent>
            </Select>
            <Select value={reportType} onValueChange={(value) => setReportType(value as ReportType)}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Jenis Laporan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="overview">Overview</SelectItem>
                <SelectItem value="domains">Domain</SelectItem>
                <SelectItem value="applications">Permohonan Domain</SelectItem>
                <SelectItem value="hosting">Hosting</SelectItem>
                <SelectItem value="opd">Aktivitas OPD</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Overview Statistics */}
      {reportType === 'overview' && (
        <>
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Total Domain
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{reportData.domains.total}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {reportData.domains.active} aktif, {reportData.domains.inactive} tidak aktif
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Permohonan Domain
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{reportData.applications.total}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Approval rate: {reportData.applications.approvalRate.toFixed(1)}%
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Server className="h-4 w-4" />
                  Permohonan Hosting
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{reportData.hosting.total}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Approval rate: {reportData.hosting.approvalRate.toFixed(1)}%
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Total OPD Aktif
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{reportData.opd.totalOpds}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Organisasi terdaftar
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Applications Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Status Permohonan Domain
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Disetujui</span>
                    </div>
                    <Badge variant="outline" className="bg-green-50 text-green-700">
                      {reportData.applications.approved}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm">Pending</span>
                    </div>
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                      {reportData.applications.pending}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-red-600" />
                      <span className="text-sm">Ditolak</span>
                    </div>
                    <Badge variant="outline" className="bg-red-50 text-red-700">
                      {reportData.applications.rejected}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Hosting Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Status Permohonan Hosting
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Disetujui</span>
                    </div>
                    <Badge variant="outline" className="bg-green-50 text-green-700">
                      {reportData.hosting.approved}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm">Pending</span>
                    </div>
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                      {reportData.hosting.pending}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-red-600" />
                      <span className="text-sm">Ditolak</span>
                    </div>
                    <Badge variant="outline" className="bg-red-50 text-red-700">
                      {reportData.hosting.rejected}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* Domain Report */}
      {reportType === 'domains' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Laporan Domain per OPD
            </CardTitle>
            <CardDescription>Total: {reportData.domains.total} domain terdaftar</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No</TableHead>
                  <TableHead>OPD</TableHead>
                  <TableHead className="text-right">Jumlah Domain</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reportData.domains.byOpd.map((item, index) => (
                  <TableRow key={item.opd}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell className="font-medium">{item.opd}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant="secondary">{item.count}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Applications Report */}
      {reportType === 'applications' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Laporan Permohonan Domain per OPD
            </CardTitle>
            <CardDescription>Total: {reportData.applications.total} permohonan</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No</TableHead>
                  <TableHead>OPD</TableHead>
                  <TableHead className="text-right">Pending</TableHead>
                  <TableHead className="text-right">Disetujui</TableHead>
                  <TableHead className="text-right">Ditolak</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reportData.applications.byOpd.map((item, index) => (
                  <TableRow key={item.opd}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell className="font-medium">{item.opd}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                        {item.pending}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant="outline" className="bg-green-50 text-green-700">
                        {item.approved}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant="outline" className="bg-red-50 text-red-700">
                        {item.rejected}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant="secondary">
                        {item.pending + item.approved + item.rejected}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Hosting Report */}
      {reportType === 'hosting' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              Laporan Hosting per Framework
            </CardTitle>
            <CardDescription>Total: {reportData.hosting.total} aplikasi</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No</TableHead>
                  <TableHead>Framework</TableHead>
                  <TableHead className="text-right">Jumlah Aplikasi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reportData.hosting.byFramework.map((item, index) => (
                  <TableRow key={item.framework}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell className="font-medium">{item.framework}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant="secondary">{item.count}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* OPD Activity Report */}
      {reportType === 'opd' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Top 5 OPD Paling Aktif
            </CardTitle>
            <CardDescription>Berdasarkan jumlah permohonan</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ranking</TableHead>
                  <TableHead>OPD</TableHead>
                  <TableHead className="text-right">Total Permohonan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reportData.opd.mostActive.map((item, index) => (
                  <TableRow key={item.opd}>
                    <TableCell>
                      <Badge variant={index === 0 ? 'default' : 'outline'}>
                        #{index + 1}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{item.opd}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant="secondary">{item.totalRequests}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function SuperAdminReportsPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    }>
      <SuperAdminReportsContent />
    </Suspense>
  );
}
