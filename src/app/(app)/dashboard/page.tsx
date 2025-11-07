"use client";

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
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/shared/stat-card";
import { Globe, FileText, CheckCircle, Clock } from "lucide-react";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { Pie, PieChart, Cell } from "recharts";
import { useSearchParams } from "next/navigation";
import React, { useMemo, useEffect, useState } from "react";
import type {
  User,
  SubdomainApplication,
  Domain,
} from "@/backend/models/types";
import { Loader2 } from "lucide-react";
import { MOCK_USERS } from "@/backend/utils/mock-data";

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

function OperatorDashboard() {
  const searchParams = useSearchParams();
  const role = searchParams.get("role") as User["role"] | null;

  const [applications, setApplications] = useState<SubdomainApplication[]>([]);
  const [domains, setDomains] = useState<Domain[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const USER_OPD = currentUser?.opd || "";

  // Function to calculate countdown days
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

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [appsRes, domainsRes, usersRes] = await Promise.all([
          fetch("/api/applications"),
          fetch("/api/domains"),
          fetch("/api/users"),
        ]);
        if (!appsRes.ok || !domainsRes.ok || !usersRes.ok) {
          throw new Error("Failed to fetch data");
        }
        const appsData = await appsRes.json();
        const domainsData = await domainsRes.json();
        const usersData: User[] = await usersRes.json();

        // Cari user yang sesuai dengan role Admin Daerah dari data mock
        const mockUser = MOCK_USERS.find((u: User) => u.role === role);
        setCurrentUser(mockUser || null);

        if (role === "Admin Daerah" && mockUser?.opd) {
          // Filter data berdasarkan OPD untuk Admin Daerah
          setApplications(
            appsData.filter(
              (app: SubdomainApplication) => app.opd === mockUser.opd
            )
          );
          setDomains(
            domainsData.filter((domain: Domain) => domain.opd === mockUser.opd)
          );
        } else {
          // Untuk Super Admin, tampilkan semua data
          setApplications(appsData);
          setDomains(domainsData);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [role]);

  const approvedCount = applications.filter(
    (app) => app.status === "approved"
  ).length;
  const pendingCount = applications.filter(
    (app) =>
      app.status === "pending_review" || app.status === "pending_approval"
  ).length;
  const rejectedCount = applications.filter(
    (app) => app.status === "rejected"
  ).length;

  const chartData = useMemo(
    () =>
      [
        {
          name: "approved",
          value: approvedCount,
          fill: "var(--color-approved)",
        },
        {
          name: "pending_review",
          value: applications.filter((a) => a.status === "pending_review")
            .length,
          fill: "var(--color-pending_review)",
        },
        {
          name: "pending_approval",
          value: applications.filter((a) => a.status === "pending_approval")
            .length,
          fill: "var(--color-pending_approval)",
        },
        {
          name: "rejected",
          value: rejectedCount,
          fill: "var(--color-rejected)",
        },
      ].filter((item) => item.value > 0),
    [applications, approvedCount, rejectedCount]
  );

  const recentApplications = [...applications]
    .sort((a, b) => {
      const dateA = new Date(
        a.submittedDate || a.submissionDate || 0
      ).getTime();
      const dateB = new Date(
        b.submittedDate || b.submissionDate || 0
      ).getTime();
      return dateB - dateA;
    })
    .slice(0, 5);

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
            Ringkasan status semua permohonan yang belum disetujui
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 animate-fade-in">
        <StatCard
          title="Domain Aktif"
          value={domains.filter((d) => d.status === "active").length}
          icon={<CheckCircle className="h-4 w-4 text-green-500" />}
          description="Jumlah domain yang aktif"
        />
        <StatCard
          title="Domain Kadaluarsa"
          value={domains.filter((d) => d.status === "expired").length}
          icon={<Clock className="h-4 w-4 text-red-500" />}
          description="Jumlah domain yang kadaluarsa"
        />
      </div>

      <div className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="animate-fade-in" style={{ animationDelay: "150ms" }}>
            <CardHeader>
              <CardTitle>Status Permohonan</CardTitle>
              <CardDescription>
                Ringkasan status semua permohonan yang telah diajukan.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {chartData.length > 0 ? (
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
                      data={chartData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={60}
                      strokeWidth={5}
                    >
                      {chartData.map((entry) => (
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
          <Card className="animate-fade-in" style={{ animationDelay: "300ms" }}>
            <CardHeader>
              <CardTitle>Status Domain</CardTitle>
              <CardDescription>
                Countdown waktu kadaluarsa domain berdasarkan tanggal aktivasi
                (365/366 hari)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {domains.filter((d) => d.activationDate).length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama Domain</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Waktu</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {domains
                      .filter((d) => d.activationDate)
                      .slice(0, 5)
                      .map((domain) => {
                        const countdown = calculateCountdown(
                          domain.activationDate || ""
                        );
                        return (
                          <TableRow key={domain.id}>
                            <TableCell className="font-medium">
                              {domain.hostname}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  countdown.isExpired
                                    ? "destructive"
                                    : "default"
                                }
                              >
                                {countdown.isExpired ? "Kadaluarsa" : "Aktif"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <span
                                className={
                                  countdown.days <= 30
                                    ? "text-red-500 font-semibold"
                                    : countdown.days <= 90
                                    ? "text-amber-500 font-semibold"
                                    : ""
                                }
                              >
                                {countdown.isExpired
                                  ? "Sudah kadaluarsa"
                                  : `${countdown.days} hari lagi`}
                              </span>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="outline" size="sm" asChild>
                                <a href={`/domains/${domain.id}?role=${role}`}>
                                  Detail
                                </a>
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                  </TableBody>
                </Table>
              ) : (
                <div className="flex h-[200px] w-full items-center justify-center">
                  <p className="text-muted-foreground">
                    Tidak ada domain dengan tanggal aktivasi.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function DashboardContent() {
  const searchParams = useSearchParams();
  const role = searchParams.get("role") as User["role"];

  switch (role) {
    case "Super Admin":
      return <OperatorDashboard />;
    case "Admin Daerah":
      return <OperatorDashboard />;
    default:
      return (
        <div className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">
            Pilih peran untuk melihat dasbor.
          </p>
        </div>
      );
  }
}

function DashboardWrapper() {
  return <DashboardContent />;
}

export default function Dashboard() {
  return (
    <React.Suspense
      fallback={
        <div className="flex items-center justify-center h-full w-full">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <DashboardWrapper />
    </React.Suspense>
  );
}
