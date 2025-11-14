"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Filter,
} from "lucide-react";
import type {
  Domain,
  SubdomainApplication,
  HostingApplication,
} from "@/backend/models/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type ReportPeriod = "week" | "month" | "quarter" | "year" | "all";
type ReportType = "overview" | "domains" | "applications" | "hosting" | "opd";

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
    byOpd: {
      opd: string;
      pending: number;
      approved: number;
      rejected: number;
    }[];
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
  const [reportPeriod, setReportPeriod] = useState<ReportPeriod>("month");
  const [reportType, setReportType] = useState<ReportType>("overview");

  const [domains, setDomains] = useState<Domain[]>([]);
  const [applications, setApplications] = useState<SubdomainApplication[]>([]);
  const [hostingApps, setHostingApps] = useState<HostingApplication[]>([]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [domainsRes, appsRes, hostingRes] = await Promise.all([
        fetch("/api/domains").catch((e) => ({
          ok: false,
          json: async () => [],
        })),
        fetch("/api/applications").catch((e) => ({
          ok: false,
          json: async () => [],
        })),
        fetch("/api/hosting-applications").catch((e) => ({
          ok: false,
          json: async () => [],
        })),
      ]);

      const [domainsData, appsData, hostingData] = await Promise.all([
        domainsRes.ok ? domainsRes.json() : [],
        appsRes.ok ? appsRes.json() : [],
        hostingRes.ok ? hostingRes.json() : [],
      ]);

      setDomains(Array.isArray(domainsData) ? domainsData : []);
      setApplications(Array.isArray(appsData) ? appsData : []);
      setHostingApps(Array.isArray(hostingData) ? hostingData : []);
    } catch (error) {
      console.error("Failed to fetch report data:", error);
      // Set empty arrays on error to prevent crash
      setDomains([]);
      setApplications([]);
      setHostingApps([]);
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
      const opd = domain.opd || "Unknown";
      acc[opd] = (acc[opd] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Application statistics by OPD
    const appsByOpd = filteredApps.reduce((acc, app) => {
      const opd = app.opd || "Unknown";
      if (!acc[opd]) {
        acc[opd] = { opd, pending: 0, approved: 0, rejected: 0 };
      }
      if (
        app.status === "pending_review" ||
        app.status === "pending_approval"
      ) {
        acc[opd].pending++;
      } else if (app.status === "approved") {
        acc[opd].approved++;
      } else if (app.status === "rejected") {
        acc[opd].rejected++;
      }
      return acc;
    }, {} as Record<string, { opd: string; pending: number; approved: number; rejected: number }>);

    // Hosting by framework
    const hostingByFramework = filteredHosting.reduce((acc, app) => {
      const framework = app.framework || "Unknown";
      acc[framework] = (acc[framework] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calculate approval rates
    const totalApps = filteredApps.length;
    const approvedApps = filteredApps.filter(
      (a) => a.status === "approved"
    ).length;
    const appApprovalRate =
      totalApps > 0 ? (approvedApps / totalApps) * 100 : 0;

    const totalHosting = filteredHosting.length;
    const approvedHosting = filteredHosting.filter(
      (a) => a.status === "approved"
    ).length;
    const hostingApprovalRate =
      totalHosting > 0 ? (approvedHosting / totalHosting) * 100 : 0;

    // Most active OPDs
    const opdActivity = filteredApps.reduce((acc, app) => {
      const opd = app.opd || "Unknown";
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
        active: filteredDomains.filter((d) => d.status === "active").length,
        inactive: filteredDomains.filter((d) => d.status === "inactive").length,
        expired: filteredDomains.filter((d) => d.status === "expired").length,
        byOpd: Object.entries(domainsByOpd)
          .map(([opd, count]) => ({ opd, count }))
          .sort((a, b) => b.count - a.count),
      },
      applications: {
        total: filteredApps.length,
        pending: filteredApps.filter(
          (a) =>
            a.status === "pending_review" || a.status === "pending_approval"
        ).length,
        approved: approvedApps,
        rejected: filteredApps.filter((a) => a.status === "rejected").length,
        approvalRate: appApprovalRate,
        byOpd: Object.values(appsByOpd).sort(
          (a, b) =>
            b.approved +
            b.pending +
            b.rejected -
            (a.approved + a.pending + a.rejected)
        ),
      },
      hosting: {
        total: filteredHosting.length,
        pending: filteredHosting.filter(
          (a) =>
            a.status === "pending_review" || a.status === "pending_approval"
        ).length,
        approved: approvedHosting,
        rejected: filteredHosting.filter((a) => a.status === "rejected").length,
        approvalRate: hostingApprovalRate,
        byFramework: Object.entries(hostingByFramework)
          .map(([framework, count]) => ({ framework, count }))
          .sort((a, b) => b.count - a.count),
      },
      opd: {
        totalOpds: new Set([
          ...filteredApps.map((a) => a.opd),
          ...filteredDomains.map((d) => d.opd),
        ]).size,
        mostActive,
      },
    };
  }, [domains, applications, hostingApps, reportPeriod]);

  // Helper function to format date
  const getFormattedDate = () => {
    const now = new Date();
    return now.toLocaleDateString('id-ID', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Helper function to get period label
  const getPeriodLabel = () => {
    const labels: Record<ReportPeriod, string> = {
      week: "Minggu Ini",
      month: "Bulan Ini",
      quarter: "Kuartal Ini",
      year: "Tahun Ini",
      all: "Semua Periode"
    };
    return labels[reportPeriod];
  };

  const handleExportCSV = () => {
    let csvContent = "\uFEFF"; // BOM untuk UTF-8
    let filename = "";
    const dateStr = new Date().toISOString().split('T')[0];

    // Header dengan informasi laporan
    csvContent += `Laporan Domain Manager - Pemerintah Provinsi Kalimantan Barat\n`;
    csvContent += `Tanggal Export: ${getFormattedDate()}\n`;
    csvContent += `Periode: ${getPeriodLabel()}\n\n`;

    switch (reportType) {
      case "domains":
        csvContent += `LAPORAN DOMAIN PER OPD\n\n`;
        csvContent += `No,Nama OPD,Jumlah Domain\n`;
        reportData.domains.byOpd.forEach((item, index) => {
          csvContent += `${index + 1},"${item.opd}",${item.count}\n`;
        });
        csvContent += `\nTotal Domain Keseluruhan:,${reportData.domains.total}\n`;
        csvContent += `Domain Aktif:,${reportData.domains.active}\n`;
        csvContent += `Domain Tidak Aktif:,${reportData.domains.inactive}\n`;
        filename = `laporan-domain-${dateStr}.csv`;
        break;

      case "applications":
        csvContent += `LAPORAN PERMOHONAN DOMAIN PER OPD\n\n`;
        csvContent += `No,Nama OPD,Pending,Disetujui,Ditolak,Total Permohonan\n`;
        reportData.applications.byOpd.forEach((item, index) => {
          const total = item.pending + item.approved + item.rejected;
          csvContent += `${index + 1},"${item.opd}",${item.pending},${item.approved},${item.rejected},${total}\n`;
        });
        csvContent += `\nRingkasan:\n`;
        csvContent += `Total Permohonan:,${reportData.applications.total}\n`;
        csvContent += `Disetujui:,${reportData.applications.approved}\n`;
        csvContent += `Ditolak:,${reportData.applications.rejected}\n`;
        csvContent += `Tingkat Persetujuan:,${reportData.applications.approvalRate.toFixed(2)}%\n`;
        filename = `laporan-permohonan-domain-${dateStr}.csv`;
        break;

      case "hosting":
        csvContent += `LAPORAN APLIKASI HOSTING PER FRAMEWORK\n\n`;
        csvContent += `No,Framework/Platform,Jumlah Aplikasi\n`;
        reportData.hosting.byFramework.forEach((item, index) => {
          csvContent += `${index + 1},"${item.framework}",${item.count}\n`;
        });
        csvContent += `\nRingkasan:\n`;
        csvContent += `Total Aplikasi Hosting:,${reportData.hosting.total}\n`;
        csvContent += `Permohonan Disetujui:,${reportData.hosting.approved}\n`;
        csvContent += `Permohonan Ditolak:,${reportData.hosting.rejected}\n`;
        csvContent += `Tingkat Persetujuan:,${reportData.hosting.approvalRate.toFixed(2)}%\n`;
        filename = `laporan-hosting-${dateStr}.csv`;
        break;

      case "opd":
        csvContent += `LAPORAN AKTIVITAS OPD\n\n`;
        csvContent += `No,Nama OPD,Total Permohonan\n`;
        reportData.opd.mostActive.forEach((item, index) => {
          csvContent += `${index + 1},"${item.opd}",${item.totalRequests}\n`;
        });
        csvContent += `\nTotal OPD Aktif:,${reportData.opd.totalOpds}\n`;
        filename = `laporan-aktivitas-opd-${dateStr}.csv`;
        break;

      default: // overview
        csvContent += `LAPORAN OVERVIEW - RINGKASAN SISTEM\n\n`;
        csvContent += `Kategori,Metrik,Nilai\n`;
        csvContent += `\nDOMAIN\n`;
        csvContent += `,"Total Domain",${reportData.domains.total}\n`;
        csvContent += `,"Domain Aktif",${reportData.domains.active}\n`;
        csvContent += `,"Domain Tidak Aktif",${reportData.domains.inactive}\n`;
        csvContent += `,"Domain Kadaluarsa",${reportData.domains.expired}\n`;
        csvContent += `\nPERMOHONAN DOMAIN\n`;
        csvContent += `,"Total Permohonan",${reportData.applications.total}\n`;
        csvContent += `,"Pending",${reportData.applications.pending}\n`;
        csvContent += `,"Disetujui",${reportData.applications.approved}\n`;
        csvContent += `,"Ditolak",${reportData.applications.rejected}\n`;
        csvContent += `,"Tingkat Persetujuan",${reportData.applications.approvalRate.toFixed(2)}%\n`;
        csvContent += `\nAPLIKASI HOSTING\n`;
        csvContent += `,"Total Aplikasi",${reportData.hosting.total}\n`;
        csvContent += `,"Pending",${reportData.hosting.pending}\n`;
        csvContent += `,"Disetujui",${reportData.hosting.approved}\n`;
        csvContent += `,"Ditolak",${reportData.hosting.rejected}\n`;
        csvContent += `,"Tingkat Persetujuan",${reportData.hosting.approvalRate.toFixed(2)}%\n`;
        csvContent += `\nORGANISASI\n`;
        csvContent += `,"Total OPD Aktif",${reportData.opd.totalOpds}\n`;
        filename = `laporan-overview-${dateStr}.csv`;
    }

    // Create and download CSV
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const dateStr = new Date().toISOString().split('T')[0];
    let filename = "";
    
    // Set font
    doc.setFont("helvetica");
    
    // Header
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("LAPORAN DOMAIN MANAGER", 105, 15, { align: "center" });
    doc.setFontSize(12);
    doc.text("Pemerintah Provinsi Kalimantan Barat", 105, 22, { align: "center" });
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Tanggal Export: ${getFormattedDate()}`, 14, 32);
    doc.text(`Periode: ${getPeriodLabel()}`, 14, 38);
    
    doc.setDrawColor(200, 200, 200);
    doc.line(14, 42, 196, 42);

    switch (reportType) {
      case "domains":
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("Laporan Domain per OPD", 14, 50);
        
        autoTable(doc, {
          startY: 55,
          head: [['No', 'Nama OPD', 'Jumlah Domain']],
          body: reportData.domains.byOpd.map((item, index) => [
            (index + 1).toString(),
            item.opd,
            item.count.toString()
          ]),
          theme: 'grid',
          headStyles: { fillColor: [41, 128, 185], fontStyle: 'bold' },
          styles: { fontSize: 9, cellPadding: 3 },
          columnStyles: {
            0: { cellWidth: 15, halign: 'center' },
            1: { cellWidth: 130 },
            2: { cellWidth: 35, halign: 'center' }
          }
        });

        const finalY1 = (doc as any).lastAutoTable.finalY + 10;
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text("Ringkasan:", 14, finalY1);
        doc.setFont("helvetica", "normal");
        doc.text(`Total Domain: ${reportData.domains.total}`, 14, finalY1 + 6);
        doc.text(`Domain Aktif: ${reportData.domains.active}`, 14, finalY1 + 12);
        doc.text(`Domain Tidak Aktif: ${reportData.domains.inactive}`, 14, finalY1 + 18);
        
        filename = `laporan-domain-${dateStr}.pdf`;
        break;

      case "applications":
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("Laporan Permohonan Domain per OPD", 14, 50);
        
        autoTable(doc, {
          startY: 55,
          head: [['No', 'Nama OPD', 'Pending', 'Disetujui', 'Ditolak', 'Total']],
          body: reportData.applications.byOpd.map((item, index) => [
            (index + 1).toString(),
            item.opd,
            item.pending.toString(),
            item.approved.toString(),
            item.rejected.toString(),
            (item.pending + item.approved + item.rejected).toString()
          ]),
          theme: 'grid',
          headStyles: { fillColor: [41, 128, 185], fontStyle: 'bold' },
          styles: { fontSize: 8, cellPadding: 2 },
          columnStyles: {
            0: { cellWidth: 12, halign: 'center' },
            1: { cellWidth: 90 },
            2: { cellWidth: 20, halign: 'center' },
            3: { cellWidth: 22, halign: 'center' },
            4: { cellWidth: 20, halign: 'center' },
            5: { cellWidth: 20, halign: 'center' }
          }
        });

        const finalY2 = (doc as any).lastAutoTable.finalY + 10;
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text("Ringkasan:", 14, finalY2);
        doc.setFont("helvetica", "normal");
        doc.text(`Total Permohonan: ${reportData.applications.total}`, 14, finalY2 + 6);
        doc.text(`Disetujui: ${reportData.applications.approved}`, 14, finalY2 + 12);
        doc.text(`Ditolak: ${reportData.applications.rejected}`, 14, finalY2 + 18);
        doc.text(`Tingkat Persetujuan: ${reportData.applications.approvalRate.toFixed(2)}%`, 14, finalY2 + 24);
        
        filename = `laporan-permohonan-domain-${dateStr}.pdf`;
        break;

      case "hosting":
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("Laporan Aplikasi Hosting per Framework", 14, 50);
        
        autoTable(doc, {
          startY: 55,
          head: [['No', 'Framework/Platform', 'Jumlah Aplikasi']],
          body: reportData.hosting.byFramework.map((item, index) => [
            (index + 1).toString(),
            item.framework,
            item.count.toString()
          ]),
          theme: 'grid',
          headStyles: { fillColor: [41, 128, 185], fontStyle: 'bold' },
          styles: { fontSize: 9, cellPadding: 3 },
          columnStyles: {
            0: { cellWidth: 15, halign: 'center' },
            1: { cellWidth: 130 },
            2: { cellWidth: 35, halign: 'center' }
          }
        });

        const finalY3 = (doc as any).lastAutoTable.finalY + 10;
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text("Ringkasan:", 14, finalY3);
        doc.setFont("helvetica", "normal");
        doc.text(`Total Aplikasi Hosting: ${reportData.hosting.total}`, 14, finalY3 + 6);
        doc.text(`Permohonan Disetujui: ${reportData.hosting.approved}`, 14, finalY3 + 12);
        doc.text(`Permohonan Ditolak: ${reportData.hosting.rejected}`, 14, finalY3 + 18);
        doc.text(`Tingkat Persetujuan: ${reportData.hosting.approvalRate.toFixed(2)}%`, 14, finalY3 + 24);
        
        filename = `laporan-hosting-${dateStr}.pdf`;
        break;

      case "opd":
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("Laporan Aktivitas OPD", 14, 50);
        
        autoTable(doc, {
          startY: 55,
          head: [['No', 'Nama OPD', 'Total Permohonan']],
          body: reportData.opd.mostActive.map((item, index) => [
            (index + 1).toString(),
            item.opd,
            item.totalRequests.toString()
          ]),
          theme: 'grid',
          headStyles: { fillColor: [41, 128, 185], fontStyle: 'bold' },
          styles: { fontSize: 9, cellPadding: 3 },
          columnStyles: {
            0: { cellWidth: 15, halign: 'center' },
            1: { cellWidth: 130 },
            2: { cellWidth: 35, halign: 'center' }
          }
        });

        const finalY4 = (doc as any).lastAutoTable.finalY + 10;
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text("Ringkasan:", 14, finalY4);
        doc.setFont("helvetica", "normal");
        doc.text(`Total OPD Aktif: ${reportData.opd.totalOpds}`, 14, finalY4 + 6);
        
        filename = `laporan-aktivitas-opd-${dateStr}.pdf`;
        break;

      default: // overview
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("Laporan Overview - Ringkasan Sistem", 14, 50);
        
        // Domain Statistics
        doc.setFontSize(11);
        doc.text("DOMAIN", 14, 60);
        autoTable(doc, {
          startY: 63,
          head: [['Metrik', 'Nilai']],
          body: [
            ['Total Domain', reportData.domains.total.toString()],
            ['Domain Aktif', reportData.domains.active.toString()],
            ['Domain Tidak Aktif', reportData.domains.inactive.toString()],
            ['Domain Kadaluarsa', reportData.domains.expired.toString()]
          ],
          theme: 'grid',
          headStyles: { fillColor: [52, 152, 219], fontStyle: 'bold' },
          styles: { fontSize: 9, cellPadding: 3 },
          columnStyles: {
            0: { cellWidth: 100 },
            1: { cellWidth: 80, halign: 'center' }
          }
        });

        // Application Statistics
        let yPos = (doc as any).lastAutoTable.finalY + 10;
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.text("PERMOHONAN DOMAIN", 14, yPos);
        autoTable(doc, {
          startY: yPos + 3,
          head: [['Metrik', 'Nilai']],
          body: [
            ['Total Permohonan', reportData.applications.total.toString()],
            ['Pending', reportData.applications.pending.toString()],
            ['Disetujui', reportData.applications.approved.toString()],
            ['Ditolak', reportData.applications.rejected.toString()],
            ['Tingkat Persetujuan', `${reportData.applications.approvalRate.toFixed(2)}%`]
          ],
          theme: 'grid',
          headStyles: { fillColor: [52, 152, 219], fontStyle: 'bold' },
          styles: { fontSize: 9, cellPadding: 3 },
          columnStyles: {
            0: { cellWidth: 100 },
            1: { cellWidth: 80, halign: 'center' }
          }
        });

        // Hosting Statistics
        yPos = (doc as any).lastAutoTable.finalY + 10;
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.text("APLIKASI HOSTING", 14, yPos);
        autoTable(doc, {
          startY: yPos + 3,
          head: [['Metrik', 'Nilai']],
          body: [
            ['Total Aplikasi', reportData.hosting.total.toString()],
            ['Pending', reportData.hosting.pending.toString()],
            ['Disetujui', reportData.hosting.approved.toString()],
            ['Ditolak', reportData.hosting.rejected.toString()],
            ['Tingkat Persetujuan', `${reportData.hosting.approvalRate.toFixed(2)}%`]
          ],
          theme: 'grid',
          headStyles: { fillColor: [52, 152, 219], fontStyle: 'bold' },
          styles: { fontSize: 9, cellPadding: 3 },
          columnStyles: {
            0: { cellWidth: 100 },
            1: { cellWidth: 80, halign: 'center' }
          }
        });

        // OPD Statistics
        yPos = (doc as any).lastAutoTable.finalY + 10;
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.text("ORGANISASI", 14, yPos);
        autoTable(doc, {
          startY: yPos + 3,
          head: [['Metrik', 'Nilai']],
          body: [
            ['Total OPD Aktif', reportData.opd.totalOpds.toString()]
          ],
          theme: 'grid',
          headStyles: { fillColor: [52, 152, 219], fontStyle: 'bold' },
          styles: { fontSize: 9, cellPadding: 3 },
          columnStyles: {
            0: { cellWidth: 100 },
            1: { cellWidth: 80, halign: 'center' }
          }
        });
        
        filename = `laporan-overview-${dateStr}.pdf`;
    }

    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.text(
        `Halaman ${i} dari ${pageCount}`,
        105,
        doc.internal.pageSize.height - 10,
        { align: "center" }
      );
      doc.text(
        `Dicetak dari Domain Manager - Diskominfo Kalbar`,
        105,
        doc.internal.pageSize.height - 6,
        { align: "center" }
      );
    }

    // Save PDF
    doc.save(filename);
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
            <Select
              value={reportPeriod}
              onValueChange={(value) => setReportPeriod(value as ReportPeriod)}
            >
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
            <Select
              value={reportType}
              onValueChange={(value) => setReportType(value as ReportType)}
            >
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
      {reportType === "overview" && (
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
                <div className="text-2xl font-bold">
                  {reportData.domains.total}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {reportData.domains.active} aktif,{" "}
                  {reportData.domains.inactive} tidak aktif
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
                <div className="text-2xl font-bold">
                  {reportData.applications.total}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Approval rate:{" "}
                  {reportData.applications.approvalRate.toFixed(1)}%
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
                <div className="text-2xl font-bold">
                  {reportData.hosting.total}
                </div>
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
                <div className="text-2xl font-bold">
                  {reportData.opd.totalOpds}
                </div>
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
                    <Badge
                      variant="outline"
                      className="bg-green-50 text-green-700"
                    >
                      {reportData.applications.approved}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm">Pending</span>
                    </div>
                    <Badge
                      variant="outline"
                      className="bg-yellow-50 text-yellow-700"
                    >
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
                    <Badge
                      variant="outline"
                      className="bg-green-50 text-green-700"
                    >
                      {reportData.hosting.approved}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm">Pending</span>
                    </div>
                    <Badge
                      variant="outline"
                      className="bg-yellow-50 text-yellow-700"
                    >
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
      {reportType === "domains" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Laporan Domain per OPD
            </CardTitle>
            <CardDescription>
              Total: {reportData.domains.total} domain terdaftar
            </CardDescription>
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
      {reportType === "applications" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Laporan Permohonan Domain per OPD
            </CardTitle>
            <CardDescription>
              Total: {reportData.applications.total} permohonan
            </CardDescription>
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
                      <Badge
                        variant="outline"
                        className="bg-yellow-50 text-yellow-700"
                      >
                        {item.pending}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge
                        variant="outline"
                        className="bg-green-50 text-green-700"
                      >
                        {item.approved}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge
                        variant="outline"
                        className="bg-red-50 text-red-700"
                      >
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
      {reportType === "hosting" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              Laporan Hosting per Framework
            </CardTitle>
            <CardDescription>
              Total: {reportData.hosting.total} aplikasi
            </CardDescription>
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
                    <TableCell className="font-medium">
                      {item.framework}
                    </TableCell>
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
      {reportType === "opd" && (
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
                      <Badge variant={index === 0 ? "default" : "outline"}>
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
    <Suspense
      fallback={
        <div className="flex justify-center items-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <SuperAdminReportsContent />
    </Suspense>
  );
}
