"use client";

import { useState, useTransition, Suspense, useMemo, useEffect } from "react";
import React from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { HostingApplicationsTable } from "@/frontend/components/features/hosting/hosting-applications-table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, PlusCircle, Search } from "lucide-react";
import Link from "next/link";
import type { User, HostingApplication } from "@/backend/models/types";
import { MOCK_USERS } from "@/backend/utils/mock-data";

type StatusFilter =
  | "all"
  | "pending_review"
  | "pending_approval"
  | "approved"
  | "rejected";

function HostingPageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const role = searchParams.get("role") as User["role"] | null;
  const statusParam = searchParams.get("status") as StatusFilter | null;
  const searchTermParam = searchParams.get("q") || "";

  const [applications, setApplications] = useState<HostingApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(
    statusParam || "all"
  );
  const [searchTerm, setSearchTerm] = useState(searchTermParam);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
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
    fetchApplications();
  }, [role]);

  const currentUser = MOCK_USERS.find((user) => user.role === role);
  const USER_OPD = currentUser?.opd;

  const allApplications = useMemo(() => {
    if (role === "Admin Daerah" && USER_OPD) {
      return applications.filter((app) => app.opd === USER_OPD);
    }
    return applications;
  }, [role, USER_OPD, applications]);

  const filteredApplications = useMemo(() => {
    let apps = allApplications;

    if (searchTerm) {
      apps = apps.filter(
        (app) =>
          app.applicationName
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          app.domainName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          app.opd?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return apps;
  }, [allApplications, searchTerm]);

  const updateURLParams = (status: StatusFilter, search: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (status === "all") {
      params.delete("status");
    } else {
      params.set("status", status);
    }

    if (search) {
      params.set("q", search);
    } else {
      params.delete("q");
    }

    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`);
    });
  };

  const handleFilterChange = (status: StatusFilter) => {
    setStatusFilter(status);
    updateURLParams(status, searchTerm);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchTerm = event.target.value;
    setSearchTerm(newSearchTerm);
    updateURLParams(statusFilter, newSearchTerm);
  };

  const isManagementRole = ["Administrator", "Super Admin"].includes(
    role || ""
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <CardTitle>Manajemen Permohonan Hosting</CardTitle>
            <CardDescription>
              Lihat dan kelola semua permohonan hosting aplikasi
            </CardDescription>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 flex-wrap">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Cari permohonan..."
              className="w-full rounded-lg bg-background pl-8"
              onChange={handleSearchChange}
              value={searchTerm}
            />
          </div>
          <div className="flex gap-1 flex-wrap">
            <Button
              variant={statusFilter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => handleFilterChange("all")}
            >
              Semua
            </Button>
            {isManagementRole && (
              <>
                <Button
                  variant={
                    statusFilter === "pending_review" ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => handleFilterChange("pending_review")}
                >
                  Review Admin
                </Button>
                <Button
                  variant={
                    statusFilter === "pending_approval" ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => handleFilterChange("pending_approval")}
                >
                  Persetujuan
                </Button>
              </>
            )}
            <Button
              variant={statusFilter === "approved" ? "default" : "outline"}
              size="sm"
              onClick={() => handleFilterChange("approved")}
            >
              Disetujui
            </Button>
            <Button
              variant={statusFilter === "rejected" ? "default" : "outline"}
              size="sm"
              onClick={() => handleFilterChange("rejected")}
            >
              Ditolak
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading || isPending ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <HostingApplicationsTable applications={filteredApplications} />
        )}
      </CardContent>
    </Card>
  );
}

export default function HostingApplicationsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center h-screen w-full">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <HostingPageContent />
    </Suspense>
  );
}
