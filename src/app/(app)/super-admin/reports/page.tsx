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
      if (app.status === "Pending") {
        acc[opd].pending++;
      } else if (app.status === "Approved") {
        acc[opd].approved++;
      } else if (app.status === "Rejected") {
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
      (a) => a.status === "Approved"
    ).length;
    const appApprovalRate =
      totalApps > 0 ? (approvedApps / totalApps) * 100 : 0;

    const totalHosting = filteredHosting.length;
    const approvedHosting = filteredHosting.filter(
      (a) => a.status === "Active"
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
        active: filteredDomains.filter((d) => d.status === "Active").length,
        inactive: filteredDomains.filter((d) => d.status === "Suspended")
          .length,
        expired: filteredDomains.filter((d) => d.status === "Deactivated")
          .length,
        byOpd: Object.entries(domainsByOpd)
          .map(([opd, count]) => ({ opd, count }))
          .sort((a, b) => b.count - a.count),
      },
      applications: {
        total: filteredApps.length,
        pending: filteredApps.filter((a) => a.status === "Pending").length,
        approved: approvedApps,
        rejected: filteredApps.filter((a) => a.status === "Rejected").length,
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
        pending: filteredHosting.filter((a) => a.status === "Deactivated")
          .length,
        approved: approvedHosting,
        rejected: filteredHosting.filter((a) => a.status === "Expired").length,
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
    return now.toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Helper function to get period label
  const getPeriodLabel = () => {
    const labels: Record<ReportPeriod, string> = {
      week: "Minggu Ini",
      month: "Bulan Ini",
      quarter: "Kuartal Ini",
      year: "Tahun Ini",
      all: "Semua Periode",
    };
    return labels[reportPeriod];
  };

  const handleExportCSV = () => {
    let csvContent = "\uFEFF"; // BOM untuk UTF-8
    let filename = "";
    const dateStr = new Date().toISOString().split("T")[0];
    const timeStr = new Date().toLocaleTimeString("id-ID");

    // Header dengan informasi laporan yang lebih profesional
    csvContent += `========================================\n`;
    csvContent += `LAPORAN DOMAIN MANAGER\n`;
    csvContent += `PEMERINTAH PROVINSI KALIMANTAN BARAT\n`;
    csvContent += `Dinas Komunikasi dan Informatika\n`;
    csvContent += `========================================\n\n`;
    csvContent += `Tanggal Export:,${dateStr}\n`;
    csvContent += `Waktu Export:,${timeStr}\n`;
    csvContent += `Periode Laporan:,${getPeriodLabel()}\n`;
    csvContent += `Dicetak oleh:,Super Admin\n\n`;

    switch (reportType) {
      case "domains":
        csvContent += `========================================\n`;
        csvContent += `LAPORAN DOMAIN PER OPD\n`;
        csvContent += `========================================\n\n`;
        csvContent += `No,Nama OPD,Jumlah Domain\n`;
        csvContent += `----------------------------------------\n`;
        reportData.domains.byOpd.forEach((item, index) => {
          csvContent += `${index + 1},"${item.opd}",${item.count}\n`;
        });
        csvContent += `----------------------------------------\n`;
        csvContent += `TOTAL,,${reportData.domains.total}\n\n`;
        csvContent += `========================================\n`;
        csvContent += `RINGKASAN STATUS DOMAIN\n`;
        csvContent += `========================================\n`;
        csvContent += `Status,Jumlah,Persentase\n`;
        csvContent += `----------------------------------------\n`;
        csvContent += `Aktif,${reportData.domains.active},${((reportData.domains.active / reportData.domains.total) * 100).toFixed(1)}%\n`;
        csvContent += `Tidak Aktif,${reportData.domains.inactive},${((reportData.domains.inactive / reportData.domains.total) * 100).toFixed(1)}%\n`;
        csvContent += `Kadaluarsa,${reportData.domains.expired},${((reportData.domains.expired / reportData.domains.total) * 100).toFixed(1)}%\n`;
        csvContent += `----------------------------------------\n`;
        csvContent += `TOTAL,${reportData.domains.total},100.0%\n\n`;
        csvContent += `\n========================================\n`;
        csvContent += `Dokumen ini dicetak dari Domain Manager\n`;
        csvContent += `Diskominfo Provinsi Kalimantan Barat\n`;
        csvContent += `========================================\n`;
        filename = `laporan-domain-${dateStr}.csv`;
        break;

      case "applications":
        csvContent += `LAPORAN PERMOHONAN DOMAIN PER OPD\n\n`;
        csvContent += `No,Nama OPD,Pending,Disetujui,Ditolak,Total Permohonan\n`;
        reportData.applications.byOpd.forEach((item, index) => {
          const total = item.pending + item.approved + item.rejected;
          csvContent += `${index + 1},"${item.opd}",${item.pending},${
            item.approved
          },${item.rejected},${total}\n`;
        });
        csvContent += `\nRingkasan:\n`;
        csvContent += `Total Permohonan:,${reportData.applications.total}\n`;
        csvContent += `Disetujui:,${reportData.applications.approved}\n`;
        csvContent += `Ditolak:,${reportData.applications.rejected}\n`;
        csvContent += `Tingkat Persetujuan:,${reportData.applications.approvalRate.toFixed(
          2
        )}%\n`;
        filename = `laporan-permohonan-domain-${dateStr}.csv`;
        break;

      case "hosting":
        csvContent += `========================================\n`;
        csvContent += `LAPORAN APLIKASI HOSTING PER FRAMEWORK\n`;
        csvContent += `========================================\n\n`;
        csvContent += `No,Framework/Platform,Jumlah Aplikasi,Persentase\n`;
        csvContent += `----------------------------------------\n`;
        reportData.hosting.byFramework.forEach((item, index) => {
          const percentage = ((item.count / reportData.hosting.total) * 100).toFixed(1);
          csvContent += `${index + 1},"${item.framework}",${item.count},${percentage}%\n`;
        });
        csvContent += `----------------------------------------\n`;
        csvContent += `TOTAL,,${reportData.hosting.total},100.0%\n\n`;
        csvContent += `========================================\n`;
        csvContent += `RINGKASAN PERMOHONAN HOSTING\n`;
        csvContent += `========================================\n`;
        csvContent += `Kategori,Jumlah,Persentase\n`;
        csvContent += `----------------------------------------\n`;
        csvContent += `Total Aplikasi,${reportData.hosting.total},100.0%\n`;
        csvContent += `Disetujui,${reportData.hosting.approved},${reportData.hosting.approvalRate.toFixed(1)}%\n`;
        csvContent += `Pending,${reportData.hosting.pending},${((reportData.hosting.pending / reportData.hosting.total) * 100).toFixed(1)}%\n`;
        csvContent += `Ditolak,${reportData.hosting.rejected},${((reportData.hosting.rejected / reportData.hosting.total) * 100).toFixed(1)}%\n`;
        csvContent += `----------------------------------------\n\n`;
        csvContent += `\n========================================\n`;
        csvContent += `Dokumen ini dicetak dari Domain Manager\n`;
        csvContent += `Diskominfo Provinsi Kalimantan Barat\n`;
        csvContent += `========================================\n`;
        filename = `laporan-hosting-${dateStr}.csv`;
        break;

      case "opd":
        csvContent += `========================================\n`;
        csvContent += `LAPORAN AKTIVITAS OPD\n`;
        csvContent += `(Top 5 OPD Paling Aktif)\n`;
        csvContent += `========================================\n\n`;
        csvContent += `Peringkat,Nama OPD,Total Permohonan,Persentase\n`;
        csvContent += `----------------------------------------\n`;
        const totalRequests = reportData.opd.mostActive.reduce((sum, item) => sum + item.totalRequests, 0);
        reportData.opd.mostActive.forEach((item, index) => {
          const percentage = ((item.totalRequests / totalRequests) * 100).toFixed(1);
          csvContent += `${index + 1},"${item.opd}",${item.totalRequests},${percentage}%\n`;
        });
        csvContent += `----------------------------------------\n`;
        csvContent += `TOTAL,,${totalRequests},100.0%\n\n`;
        csvContent += `========================================\n`;
        csvContent += `RINGKASAN ORGANISASI\n`;
        csvContent += `========================================\n`;
        csvContent += `Metrik,Nilai\n`;
        csvContent += `----------------------------------------\n`;
        csvContent += `Total OPD Terdaftar,${reportData.opd.totalOpds}\n`;
        csvContent += `OPD Aktif (dengan permohonan),${reportData.opd.mostActive.length}\n`;
        csvContent += `Rata-rata Permohonan per OPD,${(totalRequests / reportData.opd.mostActive.length).toFixed(1)}\n`;
        csvContent += `----------------------------------------\n\n`;
        csvContent += `\n========================================\n`;
        csvContent += `Dokumen ini dicetak dari Domain Manager\n`;
        csvContent += `Diskominfo Provinsi Kalimantan Barat\n`;
        csvContent += `========================================\n`;
        filename = `laporan-aktivitas-opd-${dateStr}.csv`;
        break;

      default: // overview
        csvContent += `========================================\n`;
        csvContent += `LAPORAN OVERVIEW\n`;
        csvContent += `RINGKASAN SISTEM DOMAIN MANAGER\n`;
        csvContent += `========================================\n\n`;
        csvContent += `========================================\n`;
        csvContent += `1. STATISTIK DOMAIN\n`;
        csvContent += `========================================\n`;
        csvContent += `Metrik,Jumlah,Persentase\n`;
        csvContent += `----------------------------------------\n`;
        csvContent += `Total Domain,${reportData.domains.total},100.0%\n`;
        csvContent += `Domain Aktif,${reportData.domains.active},${((reportData.domains.active / reportData.domains.total) * 100).toFixed(1)}%\n`;
        csvContent += `Domain Tidak Aktif,${reportData.domains.inactive},${((reportData.domains.inactive / reportData.domains.total) * 100).toFixed(1)}%\n`;
        csvContent += `Domain Kadaluarsa,${reportData.domains.expired},${((reportData.domains.expired / reportData.domains.total) * 100).toFixed(1)}%\n`;
        csvContent += `----------------------------------------\n\n`;
        csvContent += `========================================\n`;
        csvContent += `2. PERMOHONAN DOMAIN\n`;
        csvContent += `========================================\n`;
        csvContent += `Metrik,Jumlah,Persentase\n`;
        csvContent += `----------------------------------------\n`;
        csvContent += `Total Permohonan,${reportData.applications.total},100.0%\n`;
        csvContent += `Disetujui,${reportData.applications.approved},${reportData.applications.approvalRate.toFixed(1)}%\n`;
        csvContent += `Pending,${reportData.applications.pending},${((reportData.applications.pending / reportData.applications.total) * 100).toFixed(1)}%\n`;
        csvContent += `Ditolak,${reportData.applications.rejected},${((reportData.applications.rejected / reportData.applications.total) * 100).toFixed(1)}%\n`;
        csvContent += `----------------------------------------\n`;
        csvContent += `Tingkat Persetujuan,,${reportData.applications.approvalRate.toFixed(1)}%\n\n`;
        csvContent += `========================================\n`;
        csvContent += `3. APLIKASI HOSTING\n`;
        csvContent += `========================================\n`;
        csvContent += `Metrik,Jumlah,Persentase\n`;
        csvContent += `----------------------------------------\n`;
        csvContent += `Total Aplikasi,${reportData.hosting.total},100.0%\n`;
        csvContent += `Disetujui,${reportData.hosting.approved},${reportData.hosting.approvalRate.toFixed(1)}%\n`;
        csvContent += `Pending,${reportData.hosting.pending},${((reportData.hosting.pending / reportData.hosting.total) * 100).toFixed(1)}%\n`;
        csvContent += `Ditolak,${reportData.hosting.rejected},${((reportData.hosting.rejected / reportData.hosting.total) * 100).toFixed(1)}%\n`;
        csvContent += `----------------------------------------\n`;
        csvContent += `Tingkat Persetujuan,,${reportData.hosting.approvalRate.toFixed(1)}%\n\n`;
        csvContent += `========================================\n`;
        csvContent += `4. ORGANISASI PERANGKAT DAERAH\n`;
        csvContent += `========================================\n`;
        csvContent += `Metrik,Nilai\n`;
        csvContent += `----------------------------------------\n`;
        csvContent += `Total OPD Terdaftar,${reportData.opd.totalOpds}\n`;
        csvContent += `Total OPD Aktif,${reportData.opd.mostActive.length}\n`;
        csvContent += `----------------------------------------\n\n`;
        csvContent += `\n========================================\n`;
        csvContent += `Dokumen ini dicetak dari Domain Manager\n`;
        csvContent += `Diskominfo Provinsi Kalimantan Barat\n`;
        csvContent += `========================================\n`;
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
    const dateStr = new Date().toISOString().split("T")[0];
    const timeStr = new Date().toLocaleTimeString("id-ID");
    let filename = "";

    // Set font
    doc.setFont("helvetica");

    // Header dengan border profesional
    doc.setDrawColor(41, 128, 185);
    doc.setLineWidth(0.5);
    doc.rect(10, 8, 190, 32);
    
    // Logo placeholder (bisa diganti dengan logo sebenarnya)
    doc.setDrawColor(41, 128, 185);
    doc.setFillColor(240, 248, 255);
    doc.rect(14, 12, 20, 24, 'FD');
    doc.setFontSize(8);
    doc.setTextColor(41, 128, 185);
    doc.text("LOGO", 24, 24, { align: "center" });
    
    // Header text
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("LAPORAN DOMAIN MANAGER", 105, 18, { align: "center" });
    doc.setFontSize(12);
    doc.text("Pemerintah Provinsi Kalimantan Barat", 105, 25, {
      align: "center",
    });
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Dinas Komunikasi dan Informatika", 105, 31, { align: "center" });

    // Info box
    doc.setFillColor(245, 245, 245);
    doc.rect(10, 44, 190, 16, 'F');
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text(`Tanggal Export:`, 14, 50);
    doc.text(`Waktu Export:`, 14, 55);
    doc.setFont("helvetica", "normal");
    doc.text(`${dateStr}`, 50, 50);
    doc.text(`${timeStr}`, 50, 55);
    doc.setFont("helvetica", "bold");
    doc.text(`Periode Laporan:`, 110, 50);
    doc.text(`Dicetak oleh:`, 110, 55);
    doc.setFont("helvetica", "normal");
    doc.text(`${getPeriodLabel()}`, 145, 50);
    doc.text(`Super Admin`, 145, 55);

    doc.setDrawColor(41, 128, 185);
    doc.setLineWidth(0.3);
    doc.line(10, 63, 200, 63);

    switch (reportType) {
      case "domains":
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(41, 128, 185);
        doc.text("Laporan Domain per OPD", 14, 72);
        doc.setTextColor(0, 0, 0);

        autoTable(doc, {
          startY: 77,
          head: [["No", "Nama OPD", "Jumlah Domain"]],
          body: reportData.domains.byOpd.map((item, index) => [
            (index + 1).toString(),
            item.opd,
            item.count.toString(),
          ]),
          theme: "striped",
          headStyles: { 
            fillColor: [41, 128, 185], 
            fontStyle: "bold",
            fontSize: 10,
            halign: "center"
          },
          styles: { 
            fontSize: 9, 
            cellPadding: 4,
            lineColor: [220, 220, 220],
            lineWidth: 0.1
          },
          alternateRowStyles: {
            fillColor: [245, 248, 250]
          },
          columnStyles: {
            0: { cellWidth: 15, halign: "center", fontStyle: "bold" },
            1: { cellWidth: 130 },
            2: { cellWidth: 35, halign: "center", fontStyle: "bold" },
          },
        });

        const finalY1 = (doc as any).lastAutoTable.finalY + 10;
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text("Ringkasan:", 14, finalY1);
        doc.setFont("helvetica", "normal");
        doc.text(`Total Domain: ${reportData.domains.total}`, 14, finalY1 + 6);
        doc.text(
          `Domain Aktif: ${reportData.domains.active}`,
          14,
          finalY1 + 12
        );
        doc.text(
          `Domain Tidak Aktif: ${reportData.domains.inactive}`,
          14,
          finalY1 + 18
        );

        filename = `laporan-domain-${dateStr}.pdf`;
        break;

      case "applications":
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(41, 128, 185);
        doc.text("Laporan Permohonan Domain per OPD", 14, 72);
        doc.setTextColor(0, 0, 0);

        autoTable(doc, {
          startY: 77,
          head: [
            ["No", "Nama OPD", "Pending", "Disetujui", "Ditolak", "Total"],
          ],
          body: reportData.applications.byOpd.map((item, index) => [
            (index + 1).toString(),
            item.opd,
            item.pending.toString(),
            item.approved.toString(),
            item.rejected.toString(),
            (item.pending + item.approved + item.rejected).toString(),
          ]),
          theme: "striped",
          headStyles: { 
            fillColor: [41, 128, 185], 
            fontStyle: "bold",
            fontSize: 9,
            halign: "center"
          },
          styles: { 
            fontSize: 8, 
            cellPadding: 3,
            lineColor: [220, 220, 220],
            lineWidth: 0.1
          },
          alternateRowStyles: {
            fillColor: [245, 248, 250]
          },
          columnStyles: {
            0: { cellWidth: 12, halign: "center", fontStyle: "bold" },
            1: { cellWidth: 90 },
            2: { cellWidth: 20, halign: "center" },
            3: { cellWidth: 22, halign: "center", fontStyle: "bold", textColor: [0, 128, 0] },
            4: { cellWidth: 20, halign: "center", textColor: [200, 0, 0] },
            5: { cellWidth: 20, halign: "center", fontStyle: "bold" },
          },
        });

        const finalY2 = (doc as any).lastAutoTable.finalY + 10;
        
        // Ringkasan dengan box
        doc.setDrawColor(41, 128, 185);
        doc.setFillColor(245, 248, 250);
        doc.rect(14, finalY2 - 3, 180, 28, 'FD');
        
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(41, 128, 185);
        doc.text("RINGKASAN:", 18, finalY2 + 3);
        
        doc.setFontSize(9);
        doc.setTextColor(0, 0, 0);
        doc.setFont("helvetica", "normal");
        doc.text(`Total Permohonan:`, 18, finalY2 + 9);
        doc.setFont("helvetica", "bold");
        doc.text(`${reportData.applications.total}`, 65, finalY2 + 9);
        
        doc.setFont("helvetica", "normal");
        doc.text(`Disetujui:`, 18, finalY2 + 15);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(0, 128, 0);
        doc.text(`${reportData.applications.approved}`, 65, finalY2 + 15);
        
        doc.setTextColor(0, 0, 0);
        doc.setFont("helvetica", "normal");
        doc.text(`Ditolak:`, 18, finalY2 + 21);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(200, 0, 0);
        doc.text(`${reportData.applications.rejected}`, 65, finalY2 + 21);
        
        doc.setTextColor(41, 128, 185);
        doc.setFont("helvetica", "normal");
        doc.text(`Tingkat Persetujuan:`, 110, finalY2 + 9);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.text(
          `${reportData.applications.approvalRate.toFixed(1)}%`,
          170,
          finalY2 + 15
        );

        filename = `laporan-permohonan-domain-${dateStr}.pdf`;
        break;

      case "hosting":
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(41, 128, 185);
        doc.text("Laporan Aplikasi Hosting per Framework", 14, 72);
        doc.setTextColor(0, 0, 0);

        autoTable(doc, {
          startY: 77,
          head: [["No", "Framework/Platform", "Jumlah Aplikasi"]],
          body: reportData.hosting.byFramework.map((item, index) => [
            (index + 1).toString(),
            item.framework,
            item.count.toString(),
          ]),
          theme: "striped",
          headStyles: { 
            fillColor: [41, 128, 185], 
            fontStyle: "bold",
            fontSize: 10,
            halign: "center"
          },
          styles: { 
            fontSize: 9, 
            cellPadding: 4,
            lineColor: [220, 220, 220],
            lineWidth: 0.1
          },
          alternateRowStyles: {
            fillColor: [245, 248, 250]
          },
          columnStyles: {
            0: { cellWidth: 15, halign: "center", fontStyle: "bold" },
            1: { cellWidth: 130 },
            2: { cellWidth: 35, halign: "center", fontStyle: "bold" },
          },
        });

        const finalY3 = (doc as any).lastAutoTable.finalY + 10;
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text("Ringkasan:", 14, finalY3);
        doc.setFont("helvetica", "normal");
        doc.text(
          `Total Aplikasi Hosting: ${reportData.hosting.total}`,
          14,
          finalY3 + 6
        );
        doc.text(
          `Permohonan Disetujui: ${reportData.hosting.approved}`,
          14,
          finalY3 + 12
        );
        doc.text(
          `Permohonan Ditolak: ${reportData.hosting.rejected}`,
          14,
          finalY3 + 18
        );
        doc.text(
          `Tingkat Persetujuan: ${reportData.hosting.approvalRate.toFixed(2)}%`,
          14,
          finalY3 + 24
        );

        filename = `laporan-hosting-${dateStr}.pdf`;
        break;

      case "opd":
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(41, 128, 185);
        doc.text("Laporan Aktivitas OPD", 14, 72);
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(100, 100, 100);
        doc.text("(Top 5 OPD Paling Aktif)", 14, 78);
        doc.setTextColor(0, 0, 0);

        autoTable(doc, {
          startY: 83,
          head: [["Peringkat", "Nama OPD", "Total Permohonan"]],
          body: reportData.opd.mostActive.map((item, index) => [
            (index + 1).toString(),
            item.opd,
            item.totalRequests.toString(),
          ]),
          theme: "striped",
          headStyles: { 
            fillColor: [41, 128, 185], 
            fontStyle: "bold",
            fontSize: 10,
            halign: "center"
          },
          styles: { 
            fontSize: 9, 
            cellPadding: 4,
            lineColor: [220, 220, 220],
            lineWidth: 0.1
          },
          alternateRowStyles: {
            fillColor: [245, 248, 250]
          },
          columnStyles: {
            0: { cellWidth: 25, halign: "center", fontStyle: "bold", fillColor: [255, 215, 0] },
            1: { cellWidth: 120 },
            2: { cellWidth: 35, halign: "center", fontStyle: "bold" },
          },
        });

        const finalY4 = (doc as any).lastAutoTable.finalY + 10;
        
        // Ringkasan dengan box
        doc.setDrawColor(41, 128, 185);
        doc.setFillColor(245, 248, 250);
        doc.rect(14, finalY4 - 3, 180, 12, 'FD');
        
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(41, 128, 185);
        doc.text("RINGKASAN:", 18, finalY4 + 3);
        doc.setTextColor(0, 0, 0);
        doc.setFont("helvetica", "normal");
        doc.text(`Total OPD Terdaftar:`, 80, finalY4 + 3);
        doc.setFont("helvetica", "bold");
        doc.text(`${reportData.opd.totalOpds}`, 140, finalY4 + 3);

        filename = `laporan-aktivitas-opd-${dateStr}.pdf`;
        break;

      default: // overview
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(41, 128, 185);
        doc.text("Laporan Overview - Ringkasan Sistem", 14, 72);
        doc.setTextColor(0, 0, 0);

        // Domain Statistics dengan card style
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(41, 128, 185);
        doc.text("1. STATISTIK DOMAIN", 14, 82);
        doc.setTextColor(0, 0, 0);
        
        autoTable(doc, {
          startY: 85,
          head: [["Metrik", "Jumlah", "Persentase"]],
          body: [
            [
              "Total Domain", 
              reportData.domains.total.toString(),
              "100%"
            ],
            [
              "Domain Aktif", 
              reportData.domains.active.toString(),
              `${((reportData.domains.active / reportData.domains.total) * 100).toFixed(1)}%`
            ],
            [
              "Domain Tidak Aktif", 
              reportData.domains.inactive.toString(),
              `${((reportData.domains.inactive / reportData.domains.total) * 100).toFixed(1)}%`
            ],
            [
              "Domain Kadaluarsa", 
              reportData.domains.expired.toString(),
              `${((reportData.domains.expired / reportData.domains.total) * 100).toFixed(1)}%`
            ],
          ],
          theme: "striped",
          headStyles: { 
            fillColor: [41, 128, 185], 
            fontStyle: "bold",
            fontSize: 9,
            halign: "center"
          },
          styles: { 
            fontSize: 9, 
            cellPadding: 3,
            lineColor: [220, 220, 220],
            lineWidth: 0.1
          },
          alternateRowStyles: {
            fillColor: [245, 248, 250]
          },
          columnStyles: {
            0: { cellWidth: 80 },
            1: { cellWidth: 50, halign: "center", fontStyle: "bold" },
            2: { cellWidth: 50, halign: "center" },
          },
        });

        // Application Statistics
        let yPos = (doc as any).lastAutoTable.finalY + 8;
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(41, 128, 185);
        doc.text("2. PERMOHONAN DOMAIN", 14, yPos);
        doc.setTextColor(0, 0, 0);
        
        autoTable(doc, {
          startY: yPos + 3,
          head: [["Metrik", "Jumlah", "Persentase"]],
          body: [
            [
              "Total Permohonan", 
              reportData.applications.total.toString(),
              "100%"
            ],
            [
              "Disetujui", 
              reportData.applications.approved.toString(),
              `${reportData.applications.approvalRate.toFixed(1)}%`
            ],
            [
              "Pending", 
              reportData.applications.pending.toString(),
              `${((reportData.applications.pending / reportData.applications.total) * 100).toFixed(1)}%`
            ],
            [
              "Ditolak", 
              reportData.applications.rejected.toString(),
              `${((reportData.applications.rejected / reportData.applications.total) * 100).toFixed(1)}%`
            ],
          ],
          theme: "striped",
          headStyles: { 
            fillColor: [41, 128, 185], 
            fontStyle: "bold",
            fontSize: 9,
            halign: "center"
          },
          styles: { 
            fontSize: 9, 
            cellPadding: 3,
            lineColor: [220, 220, 220],
            lineWidth: 0.1
          },
          alternateRowStyles: {
            fillColor: [245, 248, 250]
          },
          columnStyles: {
            0: { cellWidth: 80 },
            1: { cellWidth: 50, halign: "center", fontStyle: "bold" },
            2: { cellWidth: 50, halign: "center" },
          },
        });

        // Hosting Statistics
        yPos = (doc as any).lastAutoTable.finalY + 8;
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(41, 128, 185);
        doc.text("3. APLIKASI HOSTING", 14, yPos);
        doc.setTextColor(0, 0, 0);
        
        autoTable(doc, {
          startY: yPos + 3,
          head: [["Metrik", "Jumlah", "Persentase"]],
          body: [
            [
              "Total Aplikasi", 
              reportData.hosting.total.toString(),
              "100%"
            ],
            [
              "Disetujui", 
              reportData.hosting.approved.toString(),
              `${reportData.hosting.approvalRate.toFixed(1)}%`
            ],
            [
              "Pending", 
              reportData.hosting.pending.toString(),
              `${((reportData.hosting.pending / reportData.hosting.total) * 100).toFixed(1)}%`
            ],
            [
              "Ditolak", 
              reportData.hosting.rejected.toString(),
              `${((reportData.hosting.rejected / reportData.hosting.total) * 100).toFixed(1)}%`
            ],
          ],
          theme: "striped",
          headStyles: { 
            fillColor: [41, 128, 185], 
            fontStyle: "bold",
            fontSize: 9,
            halign: "center"
          },
          styles: { 
            fontSize: 9, 
            cellPadding: 3,
            lineColor: [220, 220, 220],
            lineWidth: 0.1
          },
          alternateRowStyles: {
            fillColor: [245, 248, 250]
          },
          columnStyles: {
            0: { cellWidth: 80 },
            1: { cellWidth: 50, halign: "center", fontStyle: "bold" },
            2: { cellWidth: 50, halign: "center" },
          },
        });

        // OPD Statistics
        yPos = (doc as any).lastAutoTable.finalY + 8;
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(41, 128, 185);
        doc.text("4. ORGANISASI PERANGKAT DAERAH", 14, yPos);
        doc.setTextColor(0, 0, 0);
        
        autoTable(doc, {
          startY: yPos + 3,
          head: [["Metrik", "Nilai"]],
          body: [
            ["Total OPD Terdaftar", reportData.opd.totalOpds.toString()],
            ["OPD Aktif (dengan permohonan)", reportData.opd.mostActive.length.toString()]
          ],
          theme: "striped",
          headStyles: { 
            fillColor: [41, 128, 185], 
            fontStyle: "bold",
            fontSize: 9,
            halign: "center"
          },
          styles: { 
            fontSize: 9, 
            cellPadding: 3,
            lineColor: [220, 220, 220],
            lineWidth: 0.1
          },
          alternateRowStyles: {
            fillColor: [245, 248, 250]
          },
          columnStyles: {
            0: { cellWidth: 130 },
            1: { cellWidth: 50, halign: "center", fontStyle: "bold" },
          },
        });

        filename = `laporan-overview-${dateStr}.pdf`;
    }

    // Footer dengan border dan informasi lengkap
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      
      // Footer border
      const pageHeight = doc.internal.pageSize.height;
      doc.setDrawColor(41, 128, 185);
      doc.setLineWidth(0.3);
      doc.line(10, pageHeight - 20, 200, pageHeight - 20);
      
      // Footer content
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 100, 100);
      
      // Left side - Document info
      doc.text(
        `Dokumen: ${filename}`,
        14,
        pageHeight - 15
      );
      doc.text(
        `Dicetak: ${dateStr} ${timeStr}`,
        14,
        pageHeight - 11
      );
      
      // Center - Page number
      doc.setFont("helvetica", "bold");
      doc.setTextColor(41, 128, 185);
      doc.text(
        `Halaman ${i} dari ${pageCount}`,
        105,
        pageHeight - 13,
        { align: "center" }
      );
      
      // Right side - Organization
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 100, 100);
      doc.text(
        `Domain Manager System`,
        196,
        pageHeight - 15,
        { align: "right" }
      );
      doc.text(
        `Diskominfo Prov. Kalbar`,
        196,
        pageHeight - 11,
        { align: "right" }
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
