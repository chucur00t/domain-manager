import { NextResponse } from 'next/server';
import { getDomainById } from '@/backend/services';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const apiKey = process.env.UPTIMEROBOT_API_KEY;

  try {
    const domain = await getDomainById(id);
    if (!domain) {
      return NextResponse.json({ message: 'Domain tidak ditemukan' }, { status: 404 });
    }

    // Generate monitoring data based on actual domain status
    const isActive = domain.status === 'Active';
    const currentStatus = isActive ? 'Online' : 'Offline';
    
    const monitoringData = {
      currentStatus: currentStatus,
      avgResponseTime: isActive ? 128 : 0, // ms
      uptime24h: isActive ? 99.98 : 0, // percentage
      responseTimeHistory: isActive ? [
        { time: '24 jam lalu', ms: 150 },
        { time: '18 jam lalu', ms: 130 },
        { time: '12 jam lalu', ms: 140 },
        { time: '6 jam lalu', ms: 120 },
        { time: 'Sekarang', ms: 128 },
      ] : [
        { time: '24 jam lalu', ms: 0 },
        { time: '18 jam lalu', ms: 0 },
        { time: '12 jam lalu', ms: 0 },
        { time: '6 jam lalu', ms: 0 },
        { time: 'Sekarang', ms: 0 },
      ],
      eventLog: isActive ? [
        { timestamp: new Date().toISOString(), event: 'Status: Online', details: 'Domain aktif dan berjalan normal'},
        { timestamp: new Date(Date.now() - 3600000).toISOString(), event: 'Status: Online', details: 'Respons normal (130ms)'},
      ] : [
        { timestamp: new Date().toISOString(), event: 'Status: Offline', details: `Domain tidak aktif (Status: ${domain.status})`},
        { timestamp: new Date(Date.now() - 3600000).toISOString(), event: 'Status: Offline', details: 'Domain dalam status tidak aktif'},
      ]
    };

    // --- Logika Integrasi UptimeRobot (Masa Depan) ---
    // Di sini, Anda akan menggunakan apiKey untuk membuat panggilan ke API UptimeRobot
    // dan mengambil data monitor yang sesuai untuk `domain.hostname`.
    
    if (!apiKey) {
      console.warn("UPTIMEROBOT_API_KEY tidak diatur. Menggunakan data berdasarkan status domain.");
      return NextResponse.json(monitoringData);
    }
    
    // Contoh panggilan API (JANGAN DIAKTIFKAN SEKARANG)
    /*
    const response = await fetch('https://api.uptimerobot.com/v2/getMonitors', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'cache-control': 'no-cache'
      },
      body: `api_key=${apiKey}&format=json&search=${domain.hostname}`
    });

    if (!response.ok) {
      throw new Error('Gagal mengambil data dari UptimeRobot');
    }

    const data = await response.json();
    // Proses `data` untuk mengubahnya menjadi format yang sama dengan `monitoringData`
    const formattedData = { ... };
    
    return NextResponse.json(formattedData);
    */

    // Untuk sekarang, kita kembalikan data berdasarkan status domain
    return NextResponse.json(monitoringData);

  } catch (error: any) {
    console.error(`Error fetching monitoring data for domain ${id}:`, error);
    return NextResponse.json({ message: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
