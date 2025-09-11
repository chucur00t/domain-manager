import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { BackButton } from '@/components/shared/back-button';

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-4">
        <BackButton />
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Kebijakan Privasi</CardTitle>
          <CardDescription>
            Terakhir diperbarui: {new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}. Kebijakan privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan, dan melindungi informasi pribadi Anda.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">1. Informasi yang Kami Kumpulkan</h3>
            <p className="text-muted-foreground">
              Kami mengumpulkan informasi yang Anda berikan langsung kepada kami saat Anda mendaftar atau mengajukan permohonan, seperti nama, alamat email, NIP, nomor telepon, dan instansi (OPD). Kami juga secara otomatis mencatat informasi tentang aktivitas Anda di sistem kami, seperti alamat IP, waktu akses, dan tindakan yang dilakukan, untuk tujuan audit dan keamanan.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">2. Bagaimana Kami Menggunakan Informasi Anda</h3>
            <p className="text-muted-foreground">
              Informasi yang kami kumpulkan digunakan untuk:
            </p>
             <ul className="list-disc pl-5 mt-2 space-y-1 text-muted-foreground">
                <li>Memproses dan mengelola permohonan subdomain dan hosting Anda.</li>
                <li>Mengelola akun pengguna Anda dan menyediakan akses ke layanan.</li>
                <li>Berkomunikasi dengan Anda mengenai permohonan, status akun, dan pembaruan layanan.</li>
                <li>Memastikan keamanan dan integritas sistem melalui log audit.</li>
                <li>Mematuhi kewajiban hukum dan peraturan yang berlaku.</li>
              </ul>
          </div>
           <div className="space-y-2">
            <h3 className="text-lg font-semibold">3. Pembagian Informasi</h3>
            <p className="text-muted-foreground">
                Kami tidak menjual, menyewakan, atau memperdagangkan informasi pribadi Anda kepada pihak ketiga. Informasi Anda hanya akan dibagikan kepada personel berwenang di lingkungan Pemerintah Provinsi Kalimantan Barat yang terlibat dalam proses pengelolaan domain dan hosting.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">4. Keamanan Informasi</h3>
            <p className="text-muted-foreground">
              Kami menerapkan langkah-langkah keamanan teknis dan organisasi yang wajar untuk melindungi informasi pribadi Anda dari akses, penggunaan, atau pengungkapan yang tidak sah. Akses ke data pribadi terbatas pada personel yang berwenang yang membutuhkannya untuk menjalankan tugas mereka.
            </p>
          </div>
           <div className="space-y-2">
            <h3 className="text-lg font-semibold">5. Perubahan pada Kebijakan Ini</h3>
            <p className="text-muted-foreground">
              Kami dapat memperbarui kebijakan privasi ini dari waktu ke waktu. Kami akan memberitahu Anda tentang perubahan signifikan dengan memposting kebijakan baru di halaman ini dan memperbarui tanggal "Terakhir diperbarui" di bagian atas.
            </p>
          </div>
           <div className="space-y-2">
            <h3 className="text-lg font-semibold">6. Hubungi Kami</h3>
            <p className="text-muted-foreground">
              Jika Anda memiliki pertanyaan tentang kebijakan privasi ini, silakan hubungi kami melalui email di [diskominfo@kalbarprov.go.id].
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
