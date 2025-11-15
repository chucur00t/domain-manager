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
import { Loader2, Search, FileText, ExternalLink } from "lucide-react";
import type { SubdomainApplication } from "@/backend/models/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type StatusFilter = "all" | "Pending" | "Approved" | "Rejected";

function SuperAdminApplicationsContent() {
  const searchParams = useSearchParams();
  const role = searchParams.get("role");
  const [applications, setApplications] = useState<SubdomainApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [opdFilter, setOpdFilter] = useState<string>("all");

  const fetchApplications = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/applications");
      if (!response.ok) {
        throw new Error("Failed to fetch applications");
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
      const statusMap: Record<
        StatusFilter,
        SubdomainApplication["status"] | null
      > = {
        all: null,
        Pending: "pending_review",
        Approved: "approved",
        Rejected: "rejected",
      };
      const mappedStatus = statusMap[statusFilter];
      if (mappedStatus && app.status !== mappedStatus) {
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
          app.domainName?.toLowerCase().includes(search) ||
          app.opd?.toLowerCase().includes(search) ||
          app.description?.toLowerCase().includes(search)
        );
      }

      return true;
    });
  }, [applications, statusFilter, opdFilter, searchTerm]);

  // Count pending applications (all pending statuses)
  const pendingCount = useMemo(() => {
    return applications.filter(
      (app) =>
        app.status === "pending" ||
        app.status === "pending_review" ||
        app.status === "pending_approval"
    ).length;
  }, [applications]);

  const getStatusBadge = (status: SubdomainApplication["status"]) => {
    // Simplify to 3 main statuses
    if (
      status === "pending" ||
      status === "pending_review" ||
      status === "pending_approval"
    ) {
      return (
        <Badge
          variant="outline"
          className="bg-yellow-50 text-yellow-700 border-yellow-200"
        >
          Pending
        </Badge>
      );
    }

    if (status === "approved") {
      return (
        <Badge
          variant="outline"
          className="bg-green-50 text-green-700 border-green-200"
        >
          Disetujui
        </Badge>
      );
    }

    if (status === "rejected") {
      return (
        <Badge
          variant="outline"
          className="bg-red-50 text-red-700 border-red-200"
        >
          Ditolak
        </Badge>
      );
    }

    return <Badge variant="outline">{status}</Badge>;
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
                Persetujuan Permohonan Domain
              </CardTitle>
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
            <Select
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value as StatusFilter)}
            >
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
                      Domain
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium">
                      Tujuan
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
                        colSpan={6}
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
                          <code className="bg-muted px-2 py-1 rounded text-xs">
                            {app.domainName || "-"}
                          </code>
                        </td>
                        <td className="px-4 py-3 text-sm max-w-xs truncate">
                          {app.description || "-"}
                        </td>
                        <td className="px-4 py-3">
                          {getStatusBadge(app.status)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button size="sm" variant="outline" asChild>
                            <Link
                              href={`/applications/${app.id}?role=${
                                role || "Super Admin"
                              }`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1"
                            >
                              <FileText className="h-4 w-4" />
                              Lihat Detail
                              <ExternalLink className="h-3 w-3" />
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

export default function SuperAdminApplicationsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <SuperAdminApplicationsContent />
    </Suspense>
  );
}
