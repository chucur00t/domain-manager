
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { StatCard } from '@/components/shared/stat-card';
import { FileText, CheckCircle, Users, Activity, Loader2 } from 'lucide-react';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import { Pie, PieChart, Cell } from 'recharts';
import React, { useMemo, useState, useEffect } from 'react';
import type { User, SubdomainApplication, AuditLog } from '@/lib/types';
import { AuditTrailTable } from '@/components/features/audit/audit-trail-table';


const userChartConfig = {
  "Administrator": {
    label: "Administrator",
    color: "hsl(var(--chart-5))",
  },
  "Super Admin": {
    label: "Super Admin",
    color: "hsl(var(--chart-3))",
  },
  "Operator": {
    label: "Operator",
    color: "hsl(var(--chart-1))",
  },
  "Auditor": {
    label: "Auditor",
    color: "hsl(var(--chart-4))",
  },
} satisfies ChartConfig;

const userChartColors: Record<string, string> = {
    'Administrator': 'var(--color-Administrator)',
    'Super Admin': 'var(--color-Super Admin)',
    'Operator': 'var(--color-Operator)',
    'Auditor': 'var(--color-Auditor)',
}

export function AuditorDashboard() {

  const [stats, setStats] = useState({
    totalApplications: 0,
    approvedApplications: 0,
    totalUsers: 0,
    logCount24h: 0,
  });
  const [users, setUsers] = useState<User[]>([]);
  const [recentLogs, setRecentLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [appsRes, usersRes, logsRes] = await Promise.all([
                fetch('/api/applications'),
                fetch('/api/users'), 
                fetch('/api/audit-logs')
            ]);
            
            if (!appsRes.ok || !usersRes.ok || !logsRes.ok) {
                throw new Error("Gagal mengambil data dashboard");
            }
            
            const applications: SubdomainApplication[] = await appsRes.json();
            const allUsers: User[] = await usersRes.json();
            const allLogs: AuditLog[] = await logsRes.json();

            setStats({
                totalApplications: applications.length,
                approvedApplications: applications.filter(a => a.status === 'approved').length,
                totalUsers: allUsers.length,
                logCount24h: allLogs.filter(log => new Date(log.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000)).length,
            });
            setUsers(allUsers);
            setRecentLogs(allLogs.slice(0, 5));
        } catch(error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }
    fetchData();
  }, [])


  const userRoleData = useMemo(() => {
    const data = users.reduce((acc, user) => {
      const roleKey = user.role as keyof typeof userChartConfig;
      if (!acc[roleKey]) {
        acc[roleKey] = {
            name: user.role,
            value: 0,
            fill: userChartColors[user.role],
        }
      }
      acc[roleKey].value += 1;
      return acc;
    }, {} as Record<keyof typeof userChartConfig, any>);
  
    return Object.values(data);
  }, [users]);
  
  if (isLoading) {
    return (
        <div className="flex w-full h-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>
    )
  }

  return (
    <div className="flex flex-col gap-8">
        <div>
            <h1 className="text-2xl font-bold tracking-tight">Dashboard Auditor</h1>
            <p className="text-muted-foreground">
                Ringkasan pengawasan sistem dan aktivitas pengguna.
            </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 animate-fade-in">
            <StatCard
                title="Total Permohonan"
                value={stats.totalApplications}
                icon={<FileText className="h-4 w-4 text-muted-foreground" />}
                description="Jumlah seluruh permohonan di sistem."
            />
            <StatCard
                title="Permohonan Disetujui"
                value={stats.approvedApplications}
                icon={<CheckCircle className="h-4 w-4 text-green-500" />}
                description="Total permohonan yang telah disetujui."
            />
            <StatCard
                title="Total Pengguna"
                value={stats.totalUsers}
                icon={<Users className="h-4 w-4 text-muted-foreground" />}
                description="Jumlah pengguna terdaftar di sistem."
            />
            <StatCard
                title="Log Aktivitas (24 Jam)"
                value={stats.logCount24h}
                icon={<Activity className="h-4 w-4 text-muted-foreground" />}
                description="Jumlah aktivitas tercatat dalam 24 jam terakhir."
            />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="animate-fade-in" style={{ animationDelay: '150ms' }}>
                <CardHeader>
                    <CardTitle>Komposisi Peran Pengguna</CardTitle>
                    <CardDescription>Distribusi peran pengguna di seluruh sistem.</CardDescription>
                </CardHeader>
                <CardContent>
                     <ChartContainer config={userChartConfig} className="h-[250px] w-full">
                        <PieChart accessibilityLayer>
                            <ChartTooltip cursor={false} content={<ChartTooltipContent nameKey="name" hideLabel />} />
                            <Pie data={userRoleData} dataKey="value" nameKey="name" innerRadius={60} strokeWidth={5}>
                                {userRoleData.map((entry) => (
                                    <Cell key={entry.name} fill={entry.fill} />
                                ))}
                            </Pie>
                            <ChartLegend content={<ChartLegendContent nameKey="name" />} className="-translate-y-[2rem] flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center" />
                        </PieChart>
                    </ChartContainer>
                </CardContent>
            </Card>
            <Card className="animate-fade-in" style={{ animationDelay: '300ms' }}>
                <CardHeader>
                    <CardTitle>Aktivitas Sistem Terbaru</CardTitle>
                    <CardDescription>5 aktivitas log terakhir yang tercatat di sistem.</CardDescription>
                </CardHeader>
                <CardContent>
                    <AuditTrailTable logs={recentLogs} showPagination={false} />
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
