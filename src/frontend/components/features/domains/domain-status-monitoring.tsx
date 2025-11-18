import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import { Pie, PieChart, Cell } from 'recharts';
import { useMemo } from 'react';
import type { Domain } from '@/backend/models/types';
import { AlertCircle, CheckCircle, Clock } from 'lucide-react';

const domainStatusConfig = {
  active: {
    label: 'Aktif',
    color: 'hsl(var(--chart-2))',
  },
  inactive: {
    label: 'Tidak Aktif',
    color: 'hsl(var(--chart-3))',
  },
  expired: {
    label: 'Kadaluarsa',
    color: 'hsl(var(--chart-4))',
  },
  pending: {
    label: 'Menunggu',
    color: 'hsl(var(--chart-5))',
  }
} satisfies ChartConfig;

interface DomainStatusEntry {
  domain: string;
  status: Domain['status'];
  expiryDate: string;
  daysUntilExpiry: number;
}

function getStatusColor(status: Domain['status']): string {
  switch (status) {
    case 'active':
      return 'inline-flex items-center justify-center min-w-[110px] bg-green-500 hover:bg-green-600 text-white';
    case 'expired':
      return 'inline-flex items-center justify-center min-w-[110px] bg-red-500 hover:bg-red-600 text-white';
    case 'inactive':
      return 'inline-flex items-center justify-center min-w-[110px] bg-gray-500 hover:bg-gray-600 text-white';
    case 'pending':
      return 'inline-flex items-center justify-center min-w-[110px] bg-amber-500 hover:bg-amber-600 text-white';
    default:
      return 'inline-flex items-center justify-center min-w-[110px] bg-gray-500 hover:bg-gray-600 text-white';
  }
}

function getStatusIcon(status: Domain['status']) {
  switch (status) {
    case 'active':
      return <CheckCircle className="h-4 w-4" />;
    case 'expired':
      return <AlertCircle className="h-4 w-4" />;
    case 'inactive':
      return <Clock className="h-4 w-4" />;
    case 'pending':
      return <Clock className="h-4 w-4" />;
    default:
      return <Clock className="h-4 w-4" />;
  }
}

function formatDaysUntilExpiry(days: number): string {
  if (days < 0) return 'Kadaluarsa';
  if (days === 0) return 'Hari ini';
  return `${days} hari`;
}

export function DomainStatusMonitoring({ domains }: { domains: Domain[] }) {
  const domainStatuses = useMemo(() => {
    return domains.map(domain => {
      const expiryDate = new Date(domain.expiryDate);
      const today = new Date();
      const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      return {
        domain: domain.hostname,
        status: domain.status,
        expiryDate: domain.expiryDate,
        daysUntilExpiry
      };
    }).sort((a, b) => {
      // Sort expired domains first, then by days until expiry
      if (a.status === 'expired' && b.status !== 'expired') return -1;
      if (a.status !== 'expired' && b.status === 'expired') return 1;
      return a.daysUntilExpiry - b.daysUntilExpiry;
    });
  }, [domains]);

  const chartData = useMemo(() => {
    const statusCounts = domains.reduce((acc, domain) => {
      acc[domain.status] = (acc[domain.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(statusCounts).map(([status, count]) => ({
      name: status,
      value: count,
      fill: domainStatusConfig[status as keyof typeof domainStatusConfig]?.color || 'gray'
    }));
  }, [domains]);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Domain Status Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Status Domain</CardTitle>
          <CardDescription>
            Distribusi status domain yang dikelola
          </CardDescription>
        </CardHeader>
        <CardContent>
          {chartData.length > 0 ? (
            <ChartContainer config={domainStatusConfig} className="h-[250px] w-full">
              <PieChart>
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
                  className="-translate-y-[2rem] flex-wrap gap-2 [&>*]:basis-1/3 [&>*]:justify-center"
                />
              </PieChart>
            </ChartContainer>
          ) : (
            <div className="flex h-[250px] w-full items-center justify-center">
              <p className="text-muted-foreground">Belum ada domain yang terdaftar.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Domain Status List */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Status Domain</CardTitle>
          <CardDescription>
            Status dan masa berlaku setiap domain
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[250px] w-full">
            <div className="space-y-4">
              {domainStatuses.map((entry) => (
                <div key={entry.domain} className="flex items-center justify-between">
                  <div className="flex flex-col gap-1">
                    <span className="font-medium">{entry.domain}</span>
                    <div className="flex items-center gap-2">
                      <Badge 
                        className={getStatusColor(entry.status)}
                        variant="secondary"
                      >
                        <span className="flex items-center gap-1">
                          {getStatusIcon(entry.status)}
                          {domainStatusConfig[entry.status]?.label || 'Unknown'}
                        </span>
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {formatDaysUntilExpiry(entry.daysUntilExpiry)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              {domainStatuses.length === 0 && (
                <div className="flex items-center justify-center h-[200px]">
                  <p className="text-muted-foreground">Belum ada domain yang terdaftar.</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}