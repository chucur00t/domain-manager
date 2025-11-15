"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, FileText } from "lucide-react";
import type { HostingApplication } from "@/backend/models/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type StatusFilter = "all" | "pending_review" | "approved" | "rejected";

function SuperAdminHostingApplicationsContent() {
  const searchParams = useSearchParams();
  const role = searchParams.get("role");
  const [applications, setApplications] = useState<HostingApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [opdFilter, setOpdFilter] = useState<string>("all");

  const fetchApplications = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/hosting-applications");
      if (!response.ok) {
        throw new Error("Failed to fetch hosting applications");
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
      .map((app) => app.opd)
      .filter((opd, index, self) => opd && self.indexOf(opd) === index);
    return opds.sort();
  }, [applications]);

  // Filtered applications
  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      // Status filter
      if (statusFilter !== "all" && app.status !== statusFilter) {
        return false;
      }

      // OPD filter
      if (opdFilter !== "all" && app.opd !== opdFilter) {
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
    return applications.filter(
      (app) =>
        app.status === "pending_review" || app.status === "pending_approval"
    ).length;
  }, [applications]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending_review":
      case "pending_approval":
        return (
          <Badge
            variant="outline"
            className="bg-yellow-50 text-yellow-700 border-yellow-200"
          >
            Pending
          </Badge>
        );
      case "approved":
        return (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200"
          >
            Disetujui
          </Badge>
        );
      case "rejected":
        return (
          <Badge
            variant="outline"
            className="bg-red-50 text-red-700 border-red-200"
          >
            Ditolak
          </Badge>
        );
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
              <CardTitle className="text-2xl">
                Persetujuan Permohonan Hosting
              </CardTitle>
              <CardDescription>
                Tinjau, setujui, dan alokasikan sumber daya hosting untuk semua
                OPD
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
            <Select
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value as StatusFilter)}
            >
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="pending_review">Pending</SelectItem>
                <SelectItem value="rejected">Ditolak</SelectItem>
                <SelectItem value="approved">Disetujui</SelectItem>
              </SelectContent>
            </Select>
            <Select value={opdFilter} onValueChange={setOpdFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Filter OPD" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua OPD</SelectItem>
                {allOpds.map((opd) => (
                  <SelectItem key={opd} value={opd}>
                    {opd}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Results info */}
          <div className="text-sm text-muted-foreground">
            Menampilkan {filteredApplications.length} dari {applications.length}{" "}
            permohonan
          </div>

          {/* Applications Table */}
          <div className="border rounded-lg">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr className="border-b">
                    <th className="px-4 py-3 text-left text-sm font-medium">
                      Tanggal
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium">
                      OPD
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium">
                      Aplikasi
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium">
                      Domain
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium">
                      Framework
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium">
                      Status
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-medium">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredApplications.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-4 py-8 text-center text-muted-foreground"
                      >
                        Tidak ada permohonan yang ditemukan
                      </td>
                    </tr>
                  ) : (
                    filteredApplications.map((app) => (
                      <tr key={app.id} className="border-b hover:bg-muted/30">
                        <td className="px-4 py-3 text-sm">
                          {app.submittedDate
                            ? new Date(app.submittedDate).toLocaleDateString(
                                "id-ID"
                              )
                            : "-"}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium">
                          {app.opd || "-"}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {app.applicationName || "-"}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <code className="bg-muted px-2 py-1 rounded text-xs">
                            {app.domainName || "-"}
                          </code>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <Badge variant="secondary" className="text-xs">
                            {app.framework || "-"}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          {getStatusBadge(app.status || "pending_review")}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button size="sm" variant="outline" asChild>
                            <Link
                              href={`/hosting/${app.id}?role=${
                                role || "Super Admin"
                              }&from=super-admin-hosting`}
                              className="inline-flex items-center gap-1"
                            >
                              <FileText className="h-4 w-4" />
                              Lihat Detail
                            </Link>
                          </Button>
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
    </>
  );
}

export default function SuperAdminHostingApplicationsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <SuperAdminHostingApplicationsContent />
    </Suspense>
  );
}
