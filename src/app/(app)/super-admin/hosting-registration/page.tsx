'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

/**
 * HALAMAN INI TIDAK SESUAI DENGAN SRS (Software Requirements Specification)
 * 
 * Menurut SRS KF-008: "Admin Daerah dapat mengajukan permohonan layanan hosting"
 * Super Admin HANYA menyetujui/menolak permohonan, BUKAN mengajukan.
 * 
 * Halaman ini telah dihapus dari navigasi dan akan redirect ke halaman persetujuan.
 */
export default function HostingRegistrationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = searchParams.get('role') || 'Super Admin';

  useEffect(() => {
    // Auto-redirect setelah 5 detik
    const timer = setTimeout(() => {
      router.replace(`/super-admin/hosting-applications?role=${encodeURIComponent(role)}`);
    }, 5000);

    return () => clearTimeout(timer);
  }, [router, role]);

  return (
    <Card className="border-yellow-200 bg-yellow-50">
      <CardHeader>
        <div className="flex items-start gap-3">
          <AlertCircle className="h-6 w-6 text-yellow-600 mt-1" />
          <div>
            <CardTitle className="text-xl text-yellow-900">
              Halaman Tidak Tersedia
            </CardTitle>
            <CardDescription className="text-yellow-700 mt-2">
              Halaman ini tidak sesuai dengan SRS (Software Requirements Specification)
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-white p-4 rounded-lg border border-yellow-200">
          <h3 className="font-semibold text-sm text-gray-900 mb-2">
            📋 Sesuai SRS KF-008:
          </h3>
          <p className="text-sm text-gray-600 mb-3">
            <strong>"Admin Daerah</strong> dapat mengajukan permohonan layanan hosting 
            (misalnya: cPanel, Container Hosting) yang terkait dengan domain yang sudah aktif."
          </p>
          <p className="text-sm text-gray-600">
            <strong>Super Admin</strong> hanya dapat <strong>meninjau dan menyetujui/menolak</strong> permohonan hosting, 
            serta <strong>mengalokasikan sumber daya</strong>, bukan mengajukan permohonan baru.
          </p>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-sm text-blue-900 mb-2">
            ✅ Halaman yang Sesuai untuk Super Admin:
          </h3>
          <ul className="space-y-2 text-sm text-blue-700">
            <li>• <strong>Persetujuan → Permohonan Hosting:</strong> Tinjau dan setujui/tolak permohonan dari OPD</li>
            <li>• <strong>Alokasi Sumber Daya:</strong> Atur kapasitas storage dan bandwidth</li>
            <li>• <strong>Monitoring:</strong> Pantau penggunaan hosting semua OPD</li>
          </ul>
        </div>

        <div className="pt-4 flex gap-3">
          <Link href={`/super-admin/hosting-applications?role=${encodeURIComponent(role)}`} className="flex-1">
            <Button className="w-full" variant="default">
              <ArrowRight className="mr-2 h-4 w-4" />
              Ke Halaman Persetujuan Hosting
            </Button>
          </Link>
          <Link href={`/super-admin/dashboard?role=${encodeURIComponent(role)}`} className="flex-1">
            <Button className="w-full" variant="outline">
              Kembali ke Dashboard
            </Button>
          </Link>
        </div>

        <p className="text-xs text-gray-500 text-center">
          Anda akan dialihkan secara otomatis dalam 5 detik...
        </p>
      </CardContent>
    </Card>
  );
}
