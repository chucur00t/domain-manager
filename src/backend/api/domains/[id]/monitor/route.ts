
import { NextResponse } from 'next/server';
import { getDomainById } from '@/backend/services';

// Mock data untuk monitoring - di dunia nyata, ini akan berasal dari API pihak ketiga seperti UptimeRobot
const mockMonitoringData = {
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


export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const apiKey = process.env.UPTIMEROBOT_API_KEY;

  try {
    const domain = await getDomainById(id);
    if (!domain) {
      return NextResponse.json({ message: 'Domain tidak ditemukan' }, { status: 404 });
    }

    // --- Logika Integrasi UptimeRobot (Masa Depan) ---
    // Di sini, Anda akan menggunakan apiKey untuk membuat panggilan ke API UptimeRobot
    // dan mengambil data monitor yang sesuai untuk `domain.hostname`.
    
    if (!apiKey) {
      // Jika API key tidak ada, kita bisa mengembalikan data dummy untuk pengembangan
      // atau pesan error yang jelas.
      console.warn("UPTIMEROBOT_API_KEY tidak diatur. Menggunakan data dummy untuk monitoring.");
      return NextResponse.json(mockMonitoringData);
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
    // Proses `data` untuk mengubahnya menjadi format yang sama dengan `mockMonitoringData`
    const formattedData = { ... };
    
    return NextResponse.json(formattedData);
    */

    // Untuk sekarang, kita selalu kembalikan data dummy
    return NextResponse.json(mockMonitoringData);

  } catch (error: any) {
    console.error(`Error fetching monitoring data for domain ${id}:`, error);
    return NextResponse.json({ message: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
