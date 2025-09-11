
'use client';

import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { StatCard } from '@/components/shared/stat-card';
import { Globe, FileText, Users, Building } from 'lucide-react';
import { MOCK_DOMAINS, MOCK_APPLICATIONS, MOCK_USERS } from '@/lib/mock-data';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { SuperAdminApplicationsTable } from '@/components/features/dashboard/super-admin-applications-table';
import type { User } from '@/lib/types';

const chartConfig = {
  applications: {
    label: 'Permohonan',
    color: 'hsl(var(--chart-1))',
  },
} satisfies ChartConfig;

type Props = {
    role: User['role'];
}

export function SuperAdminDashboard({ role }: Props) {
  const activeDomainsCount = MOCK_DOMAINS.filter(d => d.status === 'active').length;
  const pendingApplicationsCount = MOCK_APPLICATIONS.filter(a => a.status === 'pending_review').length;
  const totalUsersCount = MOCK_USERS.length;
  
  const opdList = [...new Set(MOCK_APPLICATIONS.map(app => app.opd))];
  const totalOpdCount = opdList.length;

  const applicationsByOpd = opdList.map(opd => ({
    opd,
    applications: MOCK_APPLICATIONS.filter(app => app.opd === opd).length,
  })).sort((a,b) => b.applications - a.applications).slice(0, 5); // Show top 5

  const recentApplications = MOCK_APPLICATIONS
    .filter(a => a.status === 'pending_review')
    .slice(0, 5);
    
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
            <h1 className="text-2xl font-bold tracking-tight">Dashboard Super Admin</h1>
            <p className="text-muted-foreground">
                Ringkasan keseluruhan sistem pengelolaan domain.
            </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 animate-fade-in">
        <StatCard
          title="Total Domain Aktif"
          value={activeDomainsCount}
          icon={<Globe className="h-4 w-4 text-muted-foreground" />}
          description="Jumlah seluruh domain yang aktif."
        />
        <StatCard
          title="Permohonan Perlu Direview"
          value={pendingApplicationsCount}
          icon={<FileText className="h-4 w-4 text-amber-500" />}
          description="Permohonan yang menunggu review teknis."
        />
        <StatCard
          title="Total Pengguna"
          value={totalUsersCount}
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
          description="Jumlah pengguna terdaftar di sistem."
        />
         <StatCard
          title="Total OPD Terdaftar"
          value={totalOpdCount}
          icon={<Building className="h-4 w-4 text-muted-foreground" />}
          description="Jumlah OPD yang telah mengajukan."
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         <Card className="animate-fade-in" style={{ animationDelay: '150ms' }}>
          <CardHeader>
            <CardTitle>Aktivitas Permohonan per OPD (Top 5)</CardTitle>
            <CardDescription>
              Jumlah total permohonan yang diajukan oleh setiap OPD.
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
             <ChartContainer config={chartConfig} className="h-[250px] w-full">
              <BarChart accessibilityLayer data={applicationsByOpd} margin={{ top: 20, right: 20, bottom: 0, left: -20 }}>
                <CartesianGrid vertical={false} />
                 <XAxis
                  dataKey="opd"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  tickFormatter={(value) => value.length > 12 ? `${value.slice(0, 12)}...` : value}
                />
                <YAxis />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="line" />}
                />
                <Bar dataKey="applications" fill="var(--color-applications)" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card className="animate-fade-in" style={{ animationDelay: '300ms' }}>
          <CardHeader>
            <CardTitle>Permohonan Terbaru untuk Direview</CardTitle>
            <CardDescription>
              5 permohonan terakhir yang membutuhkan review.
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
