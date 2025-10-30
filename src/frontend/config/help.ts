export const tooltips = {
  domain: {
    registration: {
      title: 'Panduan Pengajuan Domain',
      content: 'Format domain harus mengikuti standar: nama-opd.pemkab-x.go.id',
    },
    status: {
      active: 'Domain aktif dan dapat diakses',
      inactive: 'Domain tidak aktif/dinonaktifkan',
      expired: 'Masa berlaku domain telah habis',
      pending: 'Menunggu persetujuan/aktivasi',
    },
    deactivation: {
      title: 'Panduan Deaktivasi',
      content: 'Deaktivasi domain memerlukan persetujuan Super Admin',
    },
  },
  hosting: {
    registration: {
      title: 'Panduan Pengajuan Hosting',
      content: 'Pilih spesifikasi hosting sesuai kebutuhan aplikasi Anda',
    },
    resources: {
      storage: 'Kapasitas penyimpanan untuk file website',
      bandwidth: 'Batas transfer data bulanan',
      server: 'Jenis server yang akan digunakan',
    },
  },
  monitoring: {
    uptime: 'Persentase waktu server dalam keadaan aktif',
    bandwidth: 'Penggunaan bandwidth dari total alokasi',
    storage: 'Penggunaan storage dari total alokasi',
  },
  audit: {
    logs: 'Catatan aktivitas pengguna untuk keperluan audit',
    export: 'Ekspor data dalam format PDF atau Excel',
  },
};

// Help content untuk fitur kompleks
export const helpContent = {
  domain: {
    title: 'Manajemen Domain',
    sections: [
      {
        title: 'Pengajuan Domain Baru',
        steps: [
          'Pilih menu "Pengajuan Domain"',
          'Isi formulir dengan data yang diperlukan',
          'Upload dokumen pendukung',
          'Submit pengajuan dan tunggu approval',
        ],
      },
      {
        title: 'Perpanjangan Domain',
        steps: [
          'Pilih domain yang akan diperpanjang',
          'Klik tombol "Ajukan Perpanjangan"',
          'Lengkapi dokumen jika diperlukan',
          'Submit pengajuan perpanjangan',
        ],
      },
    ],
  },
  hosting: {
    title: 'Manajemen Hosting',
    sections: [
      {
        title: 'Pengajuan Hosting',
        steps: [
          'Pilih menu "Pengajuan Hosting"',
          'Pilih paket hosting yang sesuai',
          'Isi detail aplikasi',
          'Submit pengajuan',
        ],
      },
      {
        title: 'Monitoring Resource',
        steps: [
          'Buka dashboard hosting',
          'Cek penggunaan resource',
          'Set alert jika mendekati limit',
        ],
      },
    ],
  },
};