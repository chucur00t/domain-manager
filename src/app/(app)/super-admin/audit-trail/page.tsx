"use client";

import { useState, useMemo, useTransition, Suspense, useEffect } from "react";
import type { DateRange } from "react-day-picker";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AuditTrailTable } from "@/components/features/audit/audit-trail-table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Calendar as CalendarIcon,
  Download,
  FileDown,
  ListFilter,
  Loader2,
  Search,
  ShieldAlert,
} from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { format, subDays } from "date-fns";
import { cn } from "@/utils/utils";
import type { AuditLog, User } from "@/backend/models/types";
import { Badge } from "@/components/ui/badge";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

function SuperAdminAuditTrailContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const role = searchParams.get("role") as User["role"] | null;

  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  const [date, setDate] = useState<DateRange | undefined>(() => {
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    if (from && to) {
      return { from: new Date(from), to: new Date(to) };
    }
    return { from: subDays(new Date(), 30), to: new Date() };
  });

  const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "");
  const [selectedActions, setSelectedActions] = useState<Set<string>>(() => {
    const actions = searchParams.get("actions");
    return actions ? new Set(actions.split(",")) : new Set();
  });

  useEffect(() => {
    const fetchLogs = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/audit-logs");
        if (!response.ok) {
          throw new Error("Failed to fetch audit logs");
        }
        const data = await response.json();
        setLogs(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching audit logs:", error);
        // Use empty array when API is not available
        setLogs([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const allActions = useMemo(() => {
    // Predefined actions yang penting dan konsisten (Bahasa Indonesia)
    const predefinedActions = [
      // Autentikasi
      "LOGIN",
      "LOGOUT",
      // Manajemen Domain
      "PERMOHONAN DOMAIN",
      "PERSETUJUAN DOMAIN",
      "PENOLAKAN DOMAIN",
      "AKTIVASI DOMAIN",
      "SUSPENSI DOMAIN",
      "DEAKTIVASI DOMAIN",
      // Manajemen Hosting
      "PERMOHONAN HOSTING",
      "PERSETUJUAN HOSTING",
      "PENOLAKAN HOSTING",
      // Manajemen Pengguna
      "TAMBAH PENGGUNA",
      "UBAH PENGGUNA",
      "HAPUS PENGGUNA",
    ];

    // Combine dengan actions dari logs
    const logActions = [...new Set(logs.map((log) => log.action))];
    const combined = [...new Set([...predefinedActions, ...logActions])];
    return combined.sort();
  }, [logs]);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const logDate = new Date(log.timestamp);

      const isDateInRange =
        !date?.from ||
        !date?.to ||
        (logDate >= date.from && logDate <= date.to);

      const isActionMatch =
        selectedActions.size === 0 || selectedActions.has(log.action);

      const isSearchMatch =
        !searchTerm ||
        (log.username?.toLowerCase() || "").includes(
          searchTerm.toLowerCase()
        ) ||
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (log.details?.toLowerCase() || "").includes(searchTerm.toLowerCase());

      return isDateInRange && isActionMatch && isSearchMatch;
    });
  }, [logs, date, selectedActions, searchTerm]);

  const updateURLParams = (
    newParams: Record<string, string | null | undefined>
  ) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(newParams)) {
        if (value === null || value === undefined) {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      }
      router.replace(`${pathname}?${params.toString()}`);
    });
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchTerm = event.target.value;
    setSearchTerm(newSearchTerm);
    updateURLParams({ q: newSearchTerm || null });
  };

  const handleDateChange = (newDate: DateRange | undefined) => {
    setDate(newDate);
    updateURLParams({
      from: newDate?.from?.toISOString().split("T")[0],
      to: newDate?.to?.toISOString().split("T")[0],
    });
  };

  const handleActionToggle = (action: string) => {
    const newSelectedActions = new Set(selectedActions);
    if (newSelectedActions.has(action)) {
      newSelectedActions.delete(action);
    } else {
      newSelectedActions.add(action);
    }
    setSelectedActions(newSelectedActions);
    updateURLParams({
      actions:
        newSelectedActions.size > 0 ? [...newSelectedActions].join(",") : null,
    });
  };

  const handleExport = () => {
    const dateStr = format(new Date(), "yyyy-MM-dd");
    const timeStr = format(new Date(), "HH:mm:ss");
    const dateRangeStr = date?.from && date?.to 
      ? `${format(date.from, "dd/MM/yyyy")} - ${format(date.to, "dd/MM/yyyy")}`
      : "Semua Periode";
    
    // BOM untuk UTF-8
    let csvContent = "\uFEFF";
    
    // Header dengan informasi laporan
    csvContent += `========================================\n`;
    csvContent += `AUDIT TRAIL - LOG AKTIVITAS SISTEM\n`;
    csvContent += `DOMAIN MANAGER\n`;
    csvContent += `Pemerintah Provinsi Kalimantan Barat\n`;
    csvContent += `========================================\n\n`;
    csvContent += `Tanggal Export:,${dateStr}\n`;
    csvContent += `Waktu Export:,${timeStr}\n`;
    csvContent += `Periode Data:,${dateRangeStr}\n`;
    csvContent += `Total Log:,${filteredLogs.length}\n`;
    csvContent += `Dicetak oleh:,Super Admin\n\n`;
    csvContent += `========================================\n`;
    csvContent += `DATA LOG AKTIVITAS\n`;
    csvContent += `========================================\n\n`;
    
    // Header tabel
    const headers = ["No", "ID", "Tanggal/Waktu", "Pengguna", "Peran", "Aksi", "Detail"];
    csvContent += headers.join(",") + "\n";
    csvContent += `----------------------------------------\n`;
    
    // Data rows
    csvContent += filteredLogs.map((log, index) =>
      [
        index + 1,
        log.id,
        `"${log.timestamp}"`,
        `"${log.username}"`,
        `"${log.user_role}"`,
        `"${log.action}"`,
        `"${log.details?.replace(/"/g, '""') || ""}"`,
      ].join(",")
    ).join("\n");
    
    csvContent += `\n----------------------------------------\n`;
    csvContent += `\nTotal Aktivitas:,${filteredLogs.length}\n\n`;
    csvContent += `========================================\n`;
    csvContent += `Dokumen ini dicetak dari Domain Manager\n`;
    csvContent += `Diskominfo Provinsi Kalimantan Barat\n`;
    csvContent += `========================================\n`;

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    if (link.href) {
      URL.revokeObjectURL(link.href);
    }
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute(
      "download",
      `audit_trail_${dateStr}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF({ orientation: "landscape" }); // Landscape untuk tabel yang lebih lebar
    const dateStr = format(new Date(), "yyyy-MM-dd");
    const timeStr = format(new Date(), "HH:mm:ss");
    const dateRangeStr = date?.from && date?.to 
      ? `${format(date.from, "dd/MM/yyyy")} - ${format(date.to, "dd/MM/yyyy")}`
      : "Semua Periode";
    
    // Set font
    doc.setFont("helvetica");

    // Header dengan border profesional
    doc.setDrawColor(41, 128, 185);
    doc.setLineWidth(0.5);
    doc.rect(10, 8, 277, 32); // Lebar disesuaikan untuk landscape
    
    // Logo placeholder
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
    doc.text("AUDIT TRAIL - LOG AKTIVITAS SISTEM", 148.5, 18, { align: "center" });
    doc.setFontSize(12);
    doc.text("Pemerintah Provinsi Kalimantan Barat", 148.5, 25, { align: "center" });
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Dinas Komunikasi dan Informatika", 148.5, 31, { align: "center" });

    // Info box
    doc.setFillColor(245, 245, 245);
    doc.rect(10, 44, 277, 16, 'F');
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("Tanggal Export:", 14, 50);
    doc.text("Waktu Export:", 14, 55);
    doc.setFont("helvetica", "normal");
    doc.text(dateStr, 50, 50);
    doc.text(timeStr, 50, 55);
    doc.setFont("helvetica", "bold");
    doc.text("Periode Data:", 110, 50);
    doc.text("Total Log:", 110, 55);
    doc.setFont("helvetica", "normal");
    doc.text(dateRangeStr, 145, 50);
    doc.text(filteredLogs.length.toString(), 145, 55);
    doc.setFont("helvetica", "bold");
    doc.text("Dicetak oleh:", 210, 50);
    doc.setFont("helvetica", "normal");
    doc.text("Super Admin", 245, 50);

    doc.setDrawColor(41, 128, 185);
    doc.setLineWidth(0.3);
    doc.line(10, 63, 287, 63);

    // Title
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(41, 128, 185);
    doc.text("Data Log Aktivitas", 14, 72);
    doc.setTextColor(0, 0, 0);

    // Prepare table data - limit detail length for PDF
    const tableData = filteredLogs.map((log, index) => [
      (index + 1).toString(),
      log.id.toString(),
      format(new Date(log.timestamp), "dd/MM/yyyy HH:mm"),
      log.username || "-",
      log.user_role || "-",
      log.action || "-",
      (log.details || "-").substring(0, 100) + (log.details && log.details.length > 100 ? "..." : ""),
    ]);

    // Create table
    autoTable(doc, {
      startY: 77,
      head: [["No", "ID", "Tanggal/Waktu", "Pengguna", "Peran", "Aksi", "Detail"]],
      body: tableData,
      theme: "striped",
      headStyles: { 
        fillColor: [41, 128, 185], 
        fontStyle: "bold",
        fontSize: 9,
        halign: "center"
      },
      styles: { 
        fontSize: 7, 
        cellPadding: 2,
        lineColor: [220, 220, 220],
        lineWidth: 0.1,
        overflow: 'linebreak'
      },
      alternateRowStyles: {
        fillColor: [245, 248, 250]
      },
      columnStyles: {
        0: { cellWidth: 12, halign: "center", fontStyle: "bold" },
        1: { cellWidth: 15, halign: "center" },
        2: { cellWidth: 35, halign: "center" },
        3: { cellWidth: 35 },
        4: { cellWidth: 30, halign: "center" },
        5: { cellWidth: 50 },
        6: { cellWidth: 90 },
      },
    });

    // Footer dengan border dan informasi lengkap
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      
      // Footer border
      const pageHeight = doc.internal.pageSize.height;
      doc.setDrawColor(41, 128, 185);
      doc.setLineWidth(0.3);
      doc.line(10, pageHeight - 20, 287, pageHeight - 20);
      
      // Footer content
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 100, 100);
      
      // Left side
      doc.text(
        `Dokumen: audit_trail_${dateStr}.pdf`,
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
        148.5,
        pageHeight - 13,
        { align: "center" }
      );
      
      // Right side
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 100, 100);
      doc.text(
        "Domain Manager System",
        283,
        pageHeight - 15,
        { align: "right" }
      );
      doc.text(
        "Diskominfo Prov. Kalbar",
        283,
        pageHeight - 11,
        { align: "right" }
      );
    }

    // Save PDF
    doc.save(`audit_trail_${dateStr}.pdf`);
  };

  // Check if user is Super Admin
  if (role !== "Super Admin") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Akses Ditolak</CardTitle>
          <CardDescription>
            Halaman Audit Trail hanya tersedia untuk Super Admin.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-5 w-5" />
          <div>
            <CardTitle className="text-2xl">Audit Trail</CardTitle>
            <CardDescription>
              Lacak semua aktivitas pengguna dalam sistem untuk tujuan keamanan
              dan kepatuhan
            </CardDescription>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-2 pt-4 flex-wrap">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari pengguna, aksi, atau detail..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full pl-8"
            />
          </div>
          <div className="flex gap-2 w-full flex-wrap sm:w-auto">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date"
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal sm:w-[260px]",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date?.from ? (
                    date.to ? (
                      <>
                        {format(date.from, "LLL dd, y")} -{" "}
                        {format(date.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(date.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Pilih tanggal</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={date?.from}
                  selected={date}
                  onSelect={handleDateChange}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
            <div className="flex w-full sm:w-auto gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-10 gap-1 w-full"
                  >
                    <ListFilter className="h-3.5 w-3.5" />
                    <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                      Filter Aksi
                    </span>
                    {selectedActions.size > 0 && (
                      <Badge variant="secondary" className="ml-2 rounded-full">
                        {selectedActions.size}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Filter berdasarkan aksi</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {allActions.map((action) => (
                    <DropdownMenuCheckboxItem
                      key={action}
                      checked={selectedActions.has(action)}
                      onCheckedChange={() => handleActionToggle(action)}
                    >
                      {action}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                size="sm"
                variant="outline"
                className="h-10 gap-1"
                onClick={handleExport}
              >
                <Download className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  CSV
                </span>
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-10 gap-1"
                onClick={handleExportPDF}
              >
                <FileDown className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  PDF
                </span>
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading || isPending ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <div className="text-sm text-muted-foreground mb-4">
              Menampilkan {filteredLogs.length} dari {logs.length} log aktivitas
            </div>
            <AuditTrailTable logs={filteredLogs} />
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default function SuperAdminAuditTrailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <SuperAdminAuditTrailContent />
    </Suspense>
  );
}
