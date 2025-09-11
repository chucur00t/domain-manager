
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { StatCard } from '@/components/shared/stat-card';
import { Globe, FileText, CheckCircle, Clock } from 'lucide-react';
import { ApplicationsTable } from '@/components/features/applications/applications-table';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import { Pie, PieChart, Cell } from 'recharts';
import { useSearchParams } from 'next/navigation';
import React, { useMemo, useEffect, useState } from 'react';
import type { User, SubdomainApplication, Domain } from '@/lib/types';
import { AuditorDashboard } from '@/components/features/dashboard/auditor-dashboard';
import { Loader2 } from 'lucide-react';


const applicationChartConfig = {
  approved: {
    label: 'Disetujui',
    color: 'hsl(var(--chart-2))',
  },
  pending_review: {
    label: 'Review',
    color: 'hsl(var(--chart-4))',
  },
   pending_approval: {
    label: 'Persetujuan',
    color: 'hsl(var(--chart-5))',
  },
  rejected: {
    label: 'Ditolak',
    color: 'hsl(var(--chart-3))',
  },
} satisfies ChartConfig;


function OperatorDashboard() {
  const searchParams = useSearchParams();
  const role = searchParams.get('role') as User['role'] | null;
  
  const [applications, setApplications] = useState<SubdomainApplication[]>([]);
  const [domains, setDomains] = useState<Domain[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const USER_OPD = currentUser?.opd || ''; 

  useEffect(() => {
    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [appsRes, domainsRes, usersRes] = await Promise.all([
                fetch('/api/applications'),
                fetch('/api/domains'),
                fetch('/api/users')
            ]);
            if (!appsRes.ok || !domainsRes.ok || !usersRes.ok) {
                throw new Error('Failed to fetch data');
            }
            const appsData = await appsRes.json();
            const domainsData = await domainsRes.json();
            const usersData: User[] = await usersRes.json();

            const user = usersData.find(u => u.role === role);
            setCurrentUser(user || null);

            if (user?.opd) {
                setApplications(appsData.filter((app: SubdomainApplication) => app.opd === user.opd));
                setDomains(domainsData.filter((domain: Domain) => domain.opd === user.opd));
            } else {
                 setApplications(appsData);
                 setDomains(domainsData);
            }

        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }
    fetchData();
  }, [role]);


  const approvedCount = applications.filter(app => app.status === 'approved').length;
  const pendingCount = applications.filter(app => app.status === 'pending_review' || app.status === 'pending_approval').length;
  const rejectedCount = applications.filter(app => app.status === 'rejected').length;

  const chartData = useMemo(() => [
    { name: 'approved', value: approvedCount, fill: 'var(--color-approved)' },
    { name: 'pending_review', value: applications.filter(a => a.status === 'pending_review').length, fill: 'var(--color-pending_review)' },
    { name: 'pending_approval', value: applications.filter(a => a.status === 'pending_approval').length, fill: 'var(--color-pending_approval)' },
    { name: 'rejected', value: rejectedCount, fill: 'var(--color-rejected)' },
  ].filter(item => item.value > 0), [applications, approvedCount, rejectedCount]);

  const recentApplications = [...applications]
    .sort((a, b) => new Date(b.submittedDate).getTime() - new Date(a.submittedDate).getTime())
    .slice(0, 5);
    
  if (isLoading) {
    return (
        <div className="flex items-center justify-center h-full w-full">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
            <h1 className="text-2xl font-bold tracking-tight">Dashboard Operator: {USER_OPD}</h1>
            <p className="text-muted-foreground">
                Ringkasan pengelolaan domain dan permohonan untuk OPD Anda.
            </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 animate-fade-in">
        <StatCard
          title="Total Domain"
          value={domains.length}
          icon={<Globe className="h-4 w-4 text-muted-foreground" />}
          description="Jumlah domain yang dikelola OPD Anda"
        />
        <StatCard
          title="Total Permohonan"
          value={applications.length}
          icon={<FileText className="h-4 w-4 text-muted-foreground" />}
          description="Jumlah permohonan yang telah diajukan"
        />
        <StatCard
          title="Permohonan Disetujui"
          value={approvedCount}
          icon={<CheckCircle className="h-4 w-4 text-green-500" />}
          description="Permohonan yang telah disetujui"
        />
         <StatCard
          title="Menunggu Keputusan"
          value={pendingCount}
          icon={<Clock className="h-4 w-4 text-amber-500" />}
          description="Permohonan yang menunggu keputusan"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         <Card className="animate-fade-in" style={{ animationDelay: '150ms' }}>
          <CardHeader>
            <CardTitle>Status Permohonan Saya</CardTitle>
            <CardDescription>
              Ringkasan status semua permohonan yang telah Anda ajukan.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
                <ChartContainer config={applicationChartConfig} className="h-[250px] w-full">
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
                    <p className="text-muted-foreground">Belum ada data permohonan.</p>
                </div>
            )}
          </CardContent>
        </Card>
        <Card className="animate-fade-in" style={{ animationDelay: '300ms' }}>
          <CardHeader>
            <CardTitle>Permohonan Terakhir Saya</CardTitle>
            <CardDescription>
              5 permohonan terakhir yang diajukan oleh {USER_OPD}.
            </CardDescription>
          </CardHeader>
          <CardContent>
             <ApplicationsTable applications={recentApplications} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function DashboardContent() {
  const searchParams = useSearchParams();
  const role = searchParams.get('role') as User['role'];
  
  switch (role) {
    case 'Auditor':
      return <AuditorDashboard />;
    case 'Operator':
      return <OperatorDashboard />;
    default:
      // This case handles roles like 'Administrator' and 'Super Admin' which have their own pages,
      // or if the role is null/undefined. We can show a generic message or a default dashboard.
      // For this app, the login page should prevent reaching here without a role.
      return (
        <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">Pilih peran untuk melihat dasbor.</p>
        </div>
      );
  }
}


export default function Dashboard() {
  return (
    <React.Suspense fallback={<div className="flex items-center justify-center h-full w-full">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>}>
      <DashboardContent />
    </React.Suspense>
  )
}
