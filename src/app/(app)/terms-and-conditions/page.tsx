import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { BackButton } from '@/components/shared/back-button';

export default function TermsAndConditionsPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-4">
        <BackButton />
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Syarat dan Ketentuan</CardTitle>
          <CardDescription>
            Terakhir diperbarui: {new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}. Dengan menggunakan aplikasi Domain Manager, Anda setuju untuk mematuhi syarat dan ketentuan berikut.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">1. Penggunaan Layanan</h3>
            <p className="text-muted-foreground">
              Aplikasi ini disediakan untuk penggunaan resmi oleh personel di lingkungan Pemerintah Provinsi Kalimantan Barat. Anda setuju untuk tidak menyalahgunakan layanan, termasuk melakukan aktivitas ilegal, mengganggu fungsi sistem, atau mencoba mendapatkan akses tidak sah ke data atau akun lain.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">2. Tanggung Jawab Pengguna</h3>
            <p className="text-muted-foreground">
              Anda bertanggung jawab penuh atas kerahasiaan informasi akun Anda (username dan password). Anda juga bertanggung jawab atas keakuratan dan legalitas semua informasi dan dokumen yang Anda unggah ke dalam sistem. Penggunaan domain dan hosting yang telah disetujui harus sesuai dengan tujuan yang diajukan dalam permohonan dan tidak boleh melanggar peraturan perundang-undangan yang berlaku.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">3. Aturan Penamaan Domain</h3>
             <p className="text-muted-foreground">
              Semua permohonan nama domain harus mematuhi standar penamaan yang ditetapkan oleh pemerintah, bersifat unik, tidak mengandung unsur SARA, pornografi, atau melanggar hak kekayaan intelektual pihak lain. Dinas Komunikasi dan Informatika berhak menolak nama domain yang tidak sesuai.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">4. Batasan Tanggung Jawab</h3>
            <p className="text-muted-foreground">
              Kami berusaha untuk menjaga layanan tetap aktif, aman, dan akurat. Namun, kami tidak bertanggung jawab atas kerugian langsung maupun tidak langsung yang timbul dari penggunaan atau ketidakmampuan untuk menggunakan layanan ini, termasuk kehilangan data atau gangguan layanan.
            </p>
          </div>
           <div className="space-y-2">
            <h3 className="text-lg font-semibold">5. Perubahan pada Ketentuan</h3>
            <p className="text-muted-foreground">
              Kami berhak untuk mengubah syarat dan ketentuan ini kapan saja tanpa pemberitahuan sebelumnya. Perubahan akan berlaku segera setelah diposting di halaman ini. Penggunaan Anda yang berkelanjutan atas aplikasi setelah perubahan merupakan penerimaan Anda terhadap ketentuan yang baru.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
