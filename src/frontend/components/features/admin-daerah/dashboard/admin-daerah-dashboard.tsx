"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/shared/stat-card";
import { Globe, FileText, CheckCircle, Clock, Loader2 } from "lucide-react";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { Pie, PieChart, Cell } from "recharts";
import type {
  SubdomainApplication,
  Domain,
  User,
} from "@/backend/models/types";

const applicationChartConfig = {
  approved: {
    label: "Disetujui",
    color: "hsl(var(--chart-2))",
  },
  pending_review: {
    label: "Review",
    color: "hsl(var(--chart-4))",
  },
  pending_approval: {
    label: "Persetujuan",
    color: "hsl(var(--chart-5))",
  },
  rejected: {
    label: "Ditolak",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig;

type Props = {
  role: User["role"];
  userOpd?: string;
};

export function AdminDaerahDashboard({ role, userOpd }: Props) {
  const [isLoading, setIsLoading] = useState(true);
  const [applications, setApplications] = useState<SubdomainApplication[]>([]);
  const [domains, setDomains] = useState<Domain[]>([]);
  const [currentUserOpd, setCurrentUserOpd] = useState<string>(userOpd || "");

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [domainsRes, appsRes, usersRes] = await Promise.all([
          fetch("/api/domains"),
          fetch("/api/applications"),
          fetch("/api/users"),
        ]);

        const allDomains: Domain[] = await domainsRes.json();
        const allApplications: SubdomainApplication[] = await appsRes.json();
        const users: User[] = await usersRes.json();

        // Find current user's OPD if not provided
        let opdToFilter = userOpd;
        if (!opdToFilter) {
          const currentUser = users.find((u) => u.role === role);
          opdToFilter = currentUser?.opd || "";
          setCurrentUserOpd(opdToFilter);
        }

        // Filter data by user OPD
        const filteredApps = allApplications.filter(
          (app) => app.opd === opdToFilter
        );
        const filteredDomains = allDomains.filter(
          (domain) => domain.opd === opdToFilter
        );

        setApplications(filteredApps);
        setDomains(filteredDomains);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [role, userOpd]);

  // Filter data by user OPD (using state data)
  const opdApplications = applications;
  const opdDomains = domains;

  // Calculate statistics
  const stats = {
    totalDomains: opdDomains.length,
    activeDomains: opdDomains.filter((d) => d.status === "Active").length,
    pendingApplications: opdApplications.filter((a) => a.status === "Pending")
      .length,
    approvedApplications: opdApplications.filter((a) => a.status === "Approved")
      .length,
  };

  // Chart data for application status
  const applicationStatusData = [
    {
      name: "approved",
      value: opdApplications.filter((a) => a.status === "Approved").length,
      fill: "var(--color-approved)",
    },
    {
      name: "pending_review",
      value: opdApplications.filter((a) => a.status === "Pending").length,
      fill: "var(--color-pending_review)",
    },
    {
      name: "pending_approval",
      value: opdApplications.filter((a) => a.status === "Pending").length,
      fill: "var(--color-pending_approval)",
    },
    {
      name: "rejected",
      value: opdApplications.filter((a) => a.status === "Rejected").length,
      fill: "var(--color-rejected)",
    },
  ].filter((item) => item.value > 0);

  // Calculate countdown days
  const calculateCountdown = (
    activationDate: string
  ): { days: number; isExpired: boolean } => {
    const activation = new Date(activationDate);
    const now = new Date();
    const year = activation.getFullYear();
    const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    const daysInYear = isLeapYear ? 366 : 365;

    const expiryDate = new Date(activation);
    expiryDate.setDate(expiryDate.getDate() + daysInYear);

    const diffTime = expiryDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return {
      days: diffDays > 0 ? diffDays : 0,
      isExpired: diffDays <= 0,
    };
  };

  // Active domains with activation dates for countdown
  const activeDomainsWithCountdown = opdDomains
    .filter((d) => d.status === "Active" && d.activationDate)
    .map((domain) => ({
      ...domain,
      countdown: calculateCountdown(domain.activationDate!),
    }))
    .sort((a, b) => a.countdown.days - b.countdown.days);

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
            Dashboard Admin Daerah
          </h1>
          <p className="text-muted-foreground">
            Ringkasan domain dan permohonan OPD Anda.
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 animate-fade-in">
        <StatCard
          title="Total Domain"
          value={stats.totalDomains}
          icon={<Globe className="h-4 w-4 text-muted-foreground" />}
          description="Total domain yang Anda kelola."
        />
        <StatCard
          title="Domain Aktif"
          value={stats.activeDomains}
          icon={<CheckCircle className="h-4 w-4 text-green-500" />}
          description="Domain yang sedang aktif."
        />
        <StatCard
          title="Permohonan Pending"
          value={stats.pendingApplications}
          icon={<Clock className="h-4 w-4 text-amber-500" />}
          description="Permohonan yang sedang diproses."
        />
        <StatCard
          title="Permohonan Disetujui"
          value={stats.approvedApplications}
          icon={<FileText className="h-4 w-4 text-green-500" />}
          description="Permohonan yang telah disetujui."
        />
      </div>

      {/* Charts and Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Application Status Chart */}
        <Card className="animate-fade-in" style={{ animationDelay: "150ms" }}>
          <CardHeader>
            <CardTitle>Status Permohonan</CardTitle>
            <CardDescription>
              Distribusi status permohonan domain Anda.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {applicationStatusData.length > 0 ? (
              <ChartContainer
                config={applicationChartConfig}
                className="h-[250px] w-full"
              >
                <PieChart accessibilityLayer>
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                  />
                  <Pie
                    data={applicationStatusData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={60}
                    strokeWidth={5}
                  >
                    {applicationStatusData.map((entry) => (
                      <Cell key={entry.name} fill={entry.fill} />
                    ))}
                  </Pie>
                  <ChartLegend
                    content={<ChartLegendContent nameKey="name" />}
                    className="-translate-y-[2rem] flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
                  />
                </PieChart>
              </ChartContainer>
            ) : (
              <div className="flex h-[250px] w-full items-center justify-center">
                <p className="text-muted-foreground">
                  Belum ada data permohonan.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Domain Countdown Table */}
        <Card className="animate-fade-in" style={{ animationDelay: "300ms" }}>
          <CardHeader>
            <CardTitle>Status Domain</CardTitle>
            <CardDescription>
              Domain aktif dengan countdown masa berlaku.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama Domain</TableHead>
                    <TableHead>Sisa Hari</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeDomainsWithCountdown.length > 0 ? (
                    activeDomainsWithCountdown.slice(0, 5).map((domain) => (
                      <TableRow key={domain.id}>
                        <TableCell className="font-medium">
                          {domain.hostname}
                        </TableCell>
                        <TableCell>
                          <span
                            className={
                              domain.countdown.days <= 30
                                ? "text-red-600 font-semibold"
                                : domain.countdown.days <= 90
                                ? "text-amber-600 font-semibold"
                                : "text-green-600"
                            }
                          >
                            {domain.countdown.isExpired
                              ? "Expired"
                              : `${domain.countdown.days} hari`}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              domain.countdown.days <= 30
                                ? "destructive"
                                : domain.countdown.days <= 90
                                ? "default"
                                : "secondary"
                            }
                          >
                            {domain.countdown.isExpired
                              ? "Expired"
                              : domain.countdown.days <= 30
                              ? "Segera Expired"
                              : domain.countdown.days <= 90
                              ? "Perhatian"
                              : "Aktif"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="h-24 text-center">
                        Tidak ada domain aktif.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
