# Arsitektur Aplikasi

Dokumen ini memberikan gambaran umum tingkat tinggi tentang arsitektur teknis dari aplikasi Pengelola Domain (Domain Manager). Aplikasi ini dibangun dengan tumpukan teknologi modern yang berpusat pada **Next.js**, dengan fokus pada kinerja, skalabilitas, dan pengalaman pengembang yang efisien.

## Tumpukan Teknologi Utama

- **Framework**: [Next.js](https://nextjs.org/) (dengan React)
- **Bahasa**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Komponen UI**: [ShadCN UI](https://ui.shadcn.com/)
- **Deployment**: [Docker](https://www.docker.com/)

---

## 1. Arsitektur Frontend (Sisi Klien)

Frontend bertanggung jawab atas apa yang dilihat dan diinteraksikan oleh pengguna di browser mereka.

- **Next.js App Router**: Aplikasi ini menggunakan App Router modern dari Next.js. Ini memungkinkan kita untuk menggunakan fitur-fitur terbaru seperti **React Server Components (RSC)**, *nested layouts*, dan *server-side rendering* (SSR) secara *default*.
  - **Mengapa ini praktik terbaik?** RSC mengurangi jumlah JavaScript yang dikirim ke klien, yang menghasilkan pemuatan halaman yang lebih cepat dan pengalaman pengguna yang lebih baik, terutama pada koneksi yang lebih lambat.

- **Komponen Server & Klien**:
  - **Server Components (`*.tsx`)**: Sebagian besar komponen halaman (misalnya, `src/app/(app)/dashboard/page.tsx`) pada awalnya adalah *Server Components*. Mereka mengambil data langsung di server.
  - **Client Components (`'use client'`)**: Komponen yang memerlukan interaktivitas (misalnya, tombol, formulir, atau *hook* seperti `useState` dan `useEffect`) ditandai dengan `'use client'`.
  - **Mengapa ini praktik terbaik?** Memisahkan secara strategis antara logika server dan klien memastikan bahwa hanya kode JavaScript yang benar-benar diperlukan yang dikirim ke browser, mengoptimalkan kinerja secara signifikan.

- **UI & Styling**:
  - **ShadCN UI & Tailwind CSS**: Kombinasi ini digunakan untuk membangun antarmuka pengguna yang dapat disesuaikan dan konsisten dengan cepat. Tema aplikasi, termasuk warna dan variabel lainnya, terpusat di `src/app/globals.css`.

---

## 2. Arsitektur Backend (Sisi Server)

Backend menangani logika bisnis, interaksi database, dan otorisasi.

- **Runtime**: Server Next.js itu sendiri, yang berjalan di lingkungan **Node.js**.

- **API Layer (Server Actions)**: Aplikasi ini menggunakan **Server Actions** Next.js sebagai lapisan API-nya.
  - **Definisi**: Aksi-aksi ini didefinisikan dalam direktori `src/lib/actions/`. Contohnya termasuk `approveApplication`, `updateUser`, `activateDomain`, dll.
  - **Keamanan**: Karena berjalan secara eksklusif di server, aksi ini dapat dengan aman berisi logika sensitif, seperti validasi hak akses dan interaksi *database*.
  - **Mengapa ini praktik terbaik?** Server Actions menghilangkan kebutuhan untuk membuat *endpoint* API REST/GraphQL tradisional, menyederhanakan alur data antara klien dan server secara signifikan dan mengurangi *boilerplate code*.

- **Logika Bisnis & Otorisasi**:
  - Semua logika bisnis (misalnya, "hanya Administrator yang dapat menyetujui permohonan") dan pemeriksaan otorisasi diimplementasikan langsung di dalam *Server Actions* ini.

---

## 3. Lapisan Data (Database & Layanan)

Lapisan data bertanggung jawab untuk mengambil dan menyimpan data.

- **Database (Saat Ini Mocked)**:
  - Saat ini, aplikasi ini **tidak terhubung ke database sungguhan**. Sebagai gantinya, ia menggunakan **basis data tiruan (mock) di dalam memori** yang didefinisikan di `src/lib/mock-data.ts`.
  - **PENTING UNTUK PRODUKSI**: Pendekatan ini bagus untuk pengembangan cepat, tetapi **tidak cocok untuk produksi**. Untuk lingkungan produksi, Anda harus menggantinya dengan database sungguhan.

- **Service Layer (Lapisan Layanan)**:
  - Semua interaksi data diabstraksi melalui lapisan layanan yang terletak di `src/lib/firebase/services.ts`. File ini berisi fungsi-fungsi seperti `getUsers()`, `createApplication()`, `updateDomainStatus()`, dll.
  - **Mengapa ini praktik terbaik?** Desain ini sangat modular. Jika Anda memutuskan untuk beralih ke *database* sungguhan (misalnya, **Firebase Firestore**, **PostgreSQL**), Anda **hanya perlu mengubah implementasi fungsi-fungsi di dalam `src/lib/firebase/services.ts`**. Tidak ada bagian lain dari aplikasi (seperti *actions* atau komponen UI) yang perlu diubah.

---

## 4. Deployment & Lingkungan (Docker)

Aplikasi ini dirancang untuk di-*deploy* menggunakan teknologi kontainer.

- **Dockerfile**: File `Dockerfile` di direktori utama berisi semua instruksi yang diperlukan untuk membangun *image* Docker produksi untuk aplikasi Next.js ini. Ini menangani penyiapan dependensi, kompilasi, dan konfigurasi server produksi.

- **Docker Compose (`docker-compose.yml`)**: File ini disediakan untuk dua tujuan:
  1.  **Pengembangan Lokal**: Memudahkan untuk membangun dan menjalankan aplikasi beserta layanan pendukung (seperti database) dengan satu perintah (`docker-compose up`).
  2.  **Deployment ke Swarm**: Menjadi dasar untuk *deployment* sebagai *stack* di **Docker Swarm** menggunakan `docker stack deploy`.

- **Orkestrasi (Docker Swarm)**:
  - **Stateless Application**: Untuk berjalan dengan benar di lingkungan terorkestrasi seperti Swarm, aplikasi harus *stateless*. Ini berarti semua data yang perlu dipertahankan (sesi, data aplikasi) harus disimpan di layanan eksternal (seperti database terpusat atau Redis untuk sesi).
  - **Database Terpusat**: Saat men-deploy di Swarm, setiap replika kontainer aplikasi akan terhubung ke satu *endpoint* database yang sama. Konfigurasi ini memastikan konsistensi data di seluruh klaster. File `docker-compose.yml` telah disiapkan untuk mendukung skenario ini.

- **Hosting**: *Image* Docker yang dihasilkan dapat di-*deploy* ke platform *hosting* kontainer apa pun, seperti **Google Cloud Run**, **AWS Fargate**, **Azure Container Apps**, atau server pribadi Anda sendiri yang menjalankan Docker Swarm.
