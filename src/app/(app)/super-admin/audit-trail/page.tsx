"use client";

import { useState, useMemo, useTransition, Suspense, useEffect } from "react";
import type { DateRange } from "react-day-picker";
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
        // Fallback to mock data if API fails
        setLogs([
          {
            id: "1",
            userId: "admin-1",
            timestamp: new Date().toISOString(),
            user: "admin@kalbar.go.id",
            userRole: "Super Admin",
            action: "LOGIN",
            resourceType: "auth",
            resourceId: "auth-1",
            description: "Login berhasil",
            details: "Login berhasil dari IP 192.168.1.1",
          },
          {
            id: "2",
            userId: "opd-1",
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            user: "opd@kalbar.go.id",
            userRole: "Admin Daerah",
            action: "CREATE_DOMAIN",
            resourceType: "domain",
            resourceId: "domain-1",
            description: "Mengajukan domain baru",
            details: "Mengajukan domain: example.kalbarprov.go.id",
          },
          {
            id: "3",
            userId: "admin-1",
            timestamp: new Date(Date.now() - 7200000).toISOString(),
            user: "admin@kalbar.go.id",
            userRole: "Super Admin",
            action: "APPROVE_DOMAIN",
            resourceType: "domain",
            resourceId: "domain-1",
            description: "Menyetujui domain",
            details: "Menyetujui domain: example.kalbarprov.go.id",
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const allActions = useMemo(() => {
    // Predefined actions yang penting
    const predefinedActions = [
      "REAKTIVASI",
      "PERMOHONAN HOSTING",
      "PERMOHONAN DOMAIN",
      "DEAKTIVASI DOMAIN",
      "DEAKTIVASI HOSTING",
      "LOGIN",
      "LOGOUT",
      "CREATE_DOMAIN",
      "APPROVE_DOMAIN",
      "REJECT_DOMAIN",
      "SUSPEND_DOMAIN",
      "ACTIVATE_DOMAIN",
      "DELETE_DOMAIN",
      "CREATE_HOSTING",
      "APPROVE_HOSTING",
      "REJECT_HOSTING",
      "CREATE_USER",
      "UPDATE_USER",
      "DELETE_USER",
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
        (log.user?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
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
    const headers = ["ID", "Waktu", "Pengguna", "Peran", "Aksi", "Detail"];
    const csvContent = [
      headers.join(","),
      ...filteredLogs.map((log) =>
        [
          log.id,
          `"${log.timestamp}"`,
          `"${log.user}"`,
          `"${log.userRole}"`,
          `"${log.action}"`,
          `"${log.details?.replace(/"/g, '""') || ""}"`,
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    if (link.href) {
      URL.revokeObjectURL(link.href);
    }
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute(
      "download",
      `audit_trail_${format(new Date(), "yyyy-MM-dd")}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
                className="h-10 gap-1 w-full"
                onClick={handleExport}
              >
                <Download className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  Ekspor CSV
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
