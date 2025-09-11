
'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { StatCard } from '@/components/shared/stat-card';
import { CheckCircle, Clock, FileText, Globe, Loader2 } from 'lucide-react';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import { Pie, PieChart, Cell } from 'recharts';
import { SuperAdminApplicationsTable } from './super-admin-applications-table';
import type { SubdomainApplication, Domain } from '@/lib/types';


const chartConfig = {
  approved: {
    label: 'Disetujui',
    color: 'hsl(var(--chart-2))',
  },
  rejected: {
    label: 'Ditolak',
    color: 'hsl(var(--chart-3))',
  },
} satisfies ChartConfig;

export function KabidDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    pendingApprovalCount: 0,
    activeDomainsCount: 0,
    approvedCount: 0,
    rejectedCount: 0,
  });
  const [chartData, setChartData] = useState<{ name: string; value: number; fill: string; }[]>([]);
  const [recentPendingApplications, setRecentPendingApplications] = useState<SubdomainApplication[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [appsRes, domainsRes] = await Promise.all([
          fetch('/api/applications'),
          fetch('/api/domains')
        ]);
        const applications: SubdomainApplication[] = await appsRes.json();
        const domains: Domain[] = await domainsRes.json();

        const approved = applications.filter(a => a.status === 'approved').length;
        const rejected = applications.filter(a => a.status === 'rejected').length;

        setStats({
          pendingApprovalCount: applications.filter(a => a.status === 'pending_approval').length,
          activeDomainsCount: domains.filter(d => d.status === 'active').length,
          approvedCount: approved,
          rejectedCount: rejected,
        });

        setChartData([
            { name: 'approved', value: approved, fill: 'var(--color-approved)' },
            { name: 'rejected', value: rejected, fill: 'var(--color-rejected)' },
        ].filter(item => item.value > 0));

        setRecentPendingApplications(
            applications
                .filter(a => a.status === 'pending_approval')
                .slice(0, 5)
        );

      } catch (error) {
        console.error("Failed to fetch administrator dashboard data", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  if (isLoading) {
    return (
        <div className="flex w-full h-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard Administrator</h1>
          <p className="text-muted-foreground">
            Ringkasan persetujuan dan status domain.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 animate-fade-in">
        <StatCard
          title="Permohonan Menunggu Persetujuan"
          value={stats.pendingApprovalCount}
          icon={<Clock className="h-4 w-4 text-amber-500" />}
          description="Permohonan yang perlu persetujuan final."
        />
        <StatCard
          title="Total Domain Aktif"
          value={stats.activeDomainsCount}
          icon={<Globe className="h-4 w-4 text-muted-foreground" />}
          description="Jumlah seluruh domain yang aktif."
        />
        <StatCard
          title="Total Permohonan Disetujui"
          value={stats.approvedCount}
          icon={<CheckCircle className="h-4 w-4 text-green-500" />}
          description="Jumlah permohonan yang telah disetujui."
        />
        <StatCard
          title="Total Permohonan Ditolak"
          value={stats.rejectedCount}
          icon={<FileText className="h-4 w-4 text-red-500" />}
          description="Jumlah permohonan yang telah ditolak."
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="animate-fade-in" style={{ animationDelay: '150ms' }}>
          <CardHeader>
            <CardTitle>Ringkasan Keputusan</CardTitle>
            <CardDescription>
              Perbandingan jumlah permohonan yang disetujui dan ditolak.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <ChartContainer config={chartConfig} className="h-[250px] w-full">
                <PieChart accessibilityLayer>
                  <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                  <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={60} strokeWidth={5}>
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
                <p className="text-muted-foreground">Belum ada keputusan yang dibuat.</p>
              </div>
            )}
          </CardContent>
        </Card>
        <Card className="animate-fade-in" style={{ animationDelay: '300ms' }}>
          <CardHeader>
            <CardTitle>Menunggu Persetujuan Anda</CardTitle>
            <CardDescription>
              5 permohonan terakhir yang membutuhkan persetujuan final.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SuperAdminApplicationsTable applications={recentPendingApplications} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
