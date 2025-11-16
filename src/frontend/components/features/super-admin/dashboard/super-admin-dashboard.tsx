"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StatCard } from "@/components/shared/stat-card";
import { Globe, FileText, Users, Building, Loader2 } from "lucide-react";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import type {
  User,
  SubdomainApplication,
  Domain,
} from "@/backend/models/types";
import { SuperAdminApplicationsTable } from "@/components/features/super-admin/dashboard/super-admin-applications-table";

const chartConfig = {
  applications: {
    label: "Permohonan",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

type Props = {
  role: User["role"];
};

export function SuperAdminDashboard({ role }: Props) {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    activeDomainsCount: 0,
    pendingApplicationsCount: 0,
    totalUsersCount: 0,
    totalOpdCount: 0,
  });

  console.log("SuperAdminDashboard rendered with stats:", stats);
  const [applicationsByOpd, setApplicationsByOpd] = useState<
    { opd: string; applications: number }[]
  >([]);
  const [recentApplications, setRecentApplications] = useState<
    SubdomainApplication[]
  >([]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [domainsRes, appsRes, usersRes] = await Promise.all([
          fetch("/api/domains"),
          fetch("/api/applications"),
          fetch("/api/users"),
        ]);

        const domains: Domain[] = await domainsRes.json();
        const applications: SubdomainApplication[] = await appsRes.json();
        const users: User[] = await usersRes.json();

        console.log("Dashboard data fetched:", {
          domainsCount: domains.length,
          applicationsCount: applications.length,
          usersCount: users.length,
        });

        const opdList = [...new Set(applications.map((app) => app.opd))];
        const appCounts = opdList
          .map((opd) => ({
            opd,
            applications: applications.filter((app) => app.opd === opd).length,
          }))
          .sort((a, b) => b.applications - a.applications)
          .slice(0, 5);

        const calculatedStats = {
          activeDomainsCount: domains.filter((d) => d.status === "Active")
            .length,
          pendingApplicationsCount: applications.filter(
            (a) => a.status === "Pending"
          ).length,
          totalUsersCount: users.length,
          totalOpdCount: opdList.length,
        };

        console.log("Calculated stats:", calculatedStats);

        setStats(calculatedStats);

        setApplicationsByOpd(
          appCounts.filter((item) => item.opd) as {
            opd: string;
            applications: number;
          }[]
        );

        const sortedRecent = [...applications]
          .filter((a) => a.status === "Pending")
          .sort((a, b) => {
            const dateA = a.submittedDate || a.submissionDate || "";
            const dateB = b.submittedDate || b.submissionDate || "";
            return new Date(dateB).getTime() - new Date(dateA).getTime();
          })
          .slice(0, 5);
        setRecentApplications(sortedRecent);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const getPageTitle = () => {
    switch (role) {
      case "Super Admin":
        return "Dashboard Super Admin";
      default:
        return "Dashboard Pengelola";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {getPageTitle()}
          </h1>
          <p className="text-muted-foreground">
            Ringkasan keseluruhan sistem pengelolaan domain.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 animate-fade-in">
        <StatCard
          title="Total Domain Aktif"
          value={stats.activeDomainsCount}
          icon={<Globe className="h-4 w-4 text-muted-foreground" />}
          description="Jumlah seluruh domain yang aktif."
        />
        <StatCard
          title="Permohonan Belum Disetujui"
          value={stats.pendingApplicationsCount}
          icon={<FileText className="h-4 w-4 text-amber-500" />}
          description="Permohonan yang menunggu review teknis."
        />
        <StatCard
          title="Total Pengguna"
          value={stats.totalUsersCount}
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
          description="Jumlah pengguna terdaftar di sistem."
        />
        <StatCard
          title="Total OPD Terdaftar"
          value={stats.totalOpdCount}
          icon={<Building className="h-4 w-4 text-muted-foreground" />}
          description="Jumlah OPD yang telah mengajukan."
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="animate-fade-in" style={{ animationDelay: "150ms" }}>
          <CardHeader>
            <CardTitle>Aktivitas Permohonan per OPD (Top 5)</CardTitle>
            <CardDescription>
              Jumlah total permohonan yang diajukan oleh setiap OPD.
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ChartContainer config={chartConfig} className="h-[250px] w-full">
              <BarChart
                accessibilityLayer
                data={applicationsByOpd}
                margin={{ top: 20, right: 20, bottom: 0, left: -20 }}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="opd"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  tickFormatter={(value) =>
                    value.length > 12 ? `${value.slice(0, 12)}...` : value
                  }
                />
                <YAxis />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="line" />}
                />
                <Bar
                  dataKey="applications"
                  fill="var(--color-applications)"
                  radius={4}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card className="animate-fade-in" style={{ animationDelay: "300ms" }}>
          <CardHeader>
            <CardTitle>Permohonan Belum Disetujui</CardTitle>
            <CardDescription>
              5 permohonan terakhir yang masih dalam status pending.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SuperAdminApplicationsTable applications={recentApplications} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
