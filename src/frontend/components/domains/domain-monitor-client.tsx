
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, Clock, ServerCrash, TrendingUp } from 'lucide-react';
import { StatCard } from '@/components/shared/stat-card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Line, LineChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { Domain } from '@/backend/models/types';

// Mock data for monitoring - in a real app, this would come from a monitoring service
const monitoringData = {
    currentStatus: 'Online',
    avgResponseTime: 128, // ms
    uptime24h: 99.98, // percentage
    responseTimeHistory: [
        { time: '24 jam lalu', ms: 150 },
        { time: '18 jam lalu', ms: 130 },
        { time: '12 jam lalu', ms: 140 },
        { time: '6 jam lalu', ms: 120 },
        { time: 'Sekarang', ms: 128 },
    ],
    eventLog: [
        { timestamp: '2023-11-01 10:00:00', event: 'Status: Online', details: 'Respons normal (130ms)'},
        { timestamp: '2023-11-01 08:30:15', event: 'Status: Lambat', details: 'Waktu respons naik ke 512ms'},
        { timestamp: '2023-11-01 08:25:05', event: 'Status: Offline', details: 'Server tidak merespons (timeout)'},
        { timestamp: '2023-11-01 08:20:00', event: 'Status: Online', details: 'Respons normal (125ms)'},
    ]
};

const chartConfig = {
  ms: {
    label: 'ms',
    color: 'hsl(var(--chart-1))',
  },
} satisfies ChartConfig;


export function DomainMonitorClient({ domain }: { domain: Domain }) {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-4">
        <Link href={`/domains/${domain.id}`}>
            <Button variant="outline" size="icon" className="h-7 w-7">
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Kembali</span>
            </Button>
        </Link>
        <div className="flex-1">
            <h1 className="text-xl font-semibold tracking-tight">
                Monitoring: {domain.hostname}
            </h1>
             <p className="text-sm text-muted-foreground">
                Ringkasan performa dan status teknis.
            </p>
        </div>
      </div>

       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Status Saat Ini"
          value={monitoringData.currentStatus}
          icon={monitoringData.currentStatus === 'Online' ? <CheckCircle className="h-4 w-4 text-green-500" /> : <ServerCrash className="h-4 w-4 text-red-500" />}
          description="Status real-time dari subdomain."
        />
        <StatCard
          title="Waktu Respons Rata-rata"
          value={`${monitoringData.avgResponseTime} ms`}
          icon={<Clock className="h-4 w-4 text-muted-foreground" />}
          description="Rata-rata waktu muat halaman."
        />
        <StatCard
          title="Uptime (24 Jam Terakhir)"
          value={`${monitoringData.uptime24h}%`}
          icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
          description="Persentase waktu aktif subdomain."
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
            <CardHeader>
                <CardTitle>Riwayat Waktu Respons (24 Jam)</CardTitle>
                <CardDescription>Grafik waktu respons dalam milidetik (ms).</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className="h-[200px] w-full">
                    <LineChart accessibilityLayer data={monitoringData.responseTimeHistory} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                        <CartesianGrid vertical={false} />
                        <XAxis
                        dataKey="time"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        tickFormatter={(value) => value.slice(0, 10)}
                        />
                         <YAxis
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            tickFormatter={(value) => `${value} ms`}
                        />
                        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                        <Line
                        dataKey="ms"
                        type="monotone"
                        stroke="var(--color-ms)"
                        strokeWidth={2}
                        dot={true}
                        />
                    </LineChart>
                </ChartContainer>
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle>Log Kejadian Terbaru</CardTitle>
                <CardDescription>Catatan aktivitas dan perubahan status terakhir.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead>Waktu</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Detail</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                       {monitoringData.eventLog.map((log, index) => (
                         <TableRow key={index}>
                            <TableCell className="font-mono text-xs">{log.timestamp}</TableCell>
                            <TableCell>
                               <Badge variant={
                                   log.event.includes('Online') ? 'secondary' : 
                                   log.event.includes('Lambat') ? 'default' :
                                   'destructive'
                                }>{log.event}</Badge>
                            </TableCell>
                            <TableCell className="text-xs">{log.details}</TableCell>
                        </TableRow>
                       ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
      </div>

    </div>
  );
}
