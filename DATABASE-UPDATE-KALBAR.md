# DATABASE UPDATE - KALIMANTAN BARAT

**Tanggal:** 14 November 2025  
**Status:** ✅ SELESAI

## Ringkasan

Database MySQL telah berhasil diupdate dari data Bandung ke data **Kalimantan Barat**. Sistem sekarang menampilkan data OPD, users, applications, domains, dan hostings untuk Provinsi Kalimantan Barat.

## Permasalahan Awal

Website masih menampilkan data lama (Bandung) meskipun file `mock-data.ts` sudah diupdate dengan data Kalbar. Setelah investigasi ditemukan:

**Root Cause:**
- Sistem menggunakan **MySQL database** sebagai sumber data utama, bukan mock data
- Service layer membaca dari database MySQL, mock data hanya sebagai fallback saat database error
- Database masih berisi data lama dari schema.sql (branch 'tur')

## Solusi

Membuat SQL seed script (`seed-kalbar-data.sql`) untuk mengupdate database MySQL dengan data Kalimantan Barat.

## Data yang Diupdate

| Tabel | Jumlah Record | Keterangan |
|-------|---------------|------------|
| **opds** | 20 | OPD Provinsi Kalimantan Barat (Diskominfo, Disdikbud, Dinkes, dll) |
| **users** | 15 | Admin Daerah dan Super Admin dengan email @kalbarprov.go.id |
| **applications** | 22 | 14 domain + 8 hosting (10 approved, 5 pending, 2 rejected) |
| **domains** | 10 | Domain aktif *.kalbarprov.go.id |
| **hostings** | 5 | VPS, Dedicated Server, Shared Hosting |
| **documents** | 13 | Dokumen persyaratan aplikasi |
| **audit_logs** | 20 | Log aktivitas approve, reject, activate |

## Detail Update

### 1. OPD (20 Organisasi Perangkat Daerah)
Semua OPD menggunakan alamat di **Pontianak, Kalimantan Barat**:
- Dinas Komunikasi dan Informatika - Jl. Ahmad Yani
- Dinas Pendidikan dan Kebudayaan - Jl. Letjen Sutoyo
- Dinas Kesehatan - Jl. K.H. Wahid Hasyim No. 249
- Dinas Pekerjaan Umum dan Penataan Ruang - Jl. Alianyang
- Dinas Sosial - Jl. Dr. Sutomo
- Dan 15 OPD lainnya...

### 2. Users (15 Pengguna)
- 1 Super Admin: `superadmin@kalbarprov.go.id`
- 14 Admin Daerah: `admin.[nama-dinas]@kalbarprov.go.id`
- Semua menggunakan domain email **@kalbarprov.go.id**

### 3. Domains (10 Domain Aktif)
Semua menggunakan format ***.kalbarprov.go.id**:
- `diskominfo.kalbarprov.go.id`
- `disdikbud.kalbarprov.go.id`
- `dinkes.kalbarprov.go.id`
- `dpupr.kalbarprov.go.id`
- `dinsos.kalbarprov.go.id`
- `dispar.kalbarprov.go.id` (Visit Kalimantan Barat)
- `distanhort.kalbarprov.go.id`
- `diskan.kalbarprov.go.id`
- `dlh.kalbarprov.go.id`
- `bappeda.kalbarprov.go.id`

### 4. Applications (22 Permohonan)

**Domain Applications:**
- ✅ **10 Approved**: Diskominfo, Disdikbud, Dinkes, DPUPR, Dinsos, Dispar, Distanhort, Diskan, DLH, Bappeda
- ⏳ **3 Pending**: Dishub, Disperindag, Disnakertrans
- ❌ **1 Rejected**: Dinas Kehutanan (nama domain tidak sesuai konvensi)

**Hosting Applications:**
- ✅ **5 Approved**: Portal Diskominfo (VPS 20GB), PPDB Online (VPS 30GB), Sistem Kesehatan (VPS 25GB), Visit Kalbar (Dedicated 40GB), Aplikasi Pertanian (Shared 15GB)
- ⏳ **2 Pending**: Aplikasi Perikanan, Aplikasi Lingkungan Hidup
- ❌ **1 Rejected**: DPUPR (spesifikasi tidak memenuhi standar)

## Cara Menjalankan Seed Script

```powershell
# Metode 1: PowerShell piping
Get-Content seed-kalbar-data.sql | mysql -u root -pTaksaka99 domain_manager

# Metode 2: Bash (jika tersedia)
mysql -u root -pTaksaka99 domain_manager < seed-kalbar-data.sql
```

## Verifikasi

Setelah menjalankan script, data akan otomatis terverifikasi dengan output:

```
=== DATA SUMMARY ===
OPDs:            20
Users:           15
Applications:    22
Domains:         10
Hostings:        5
Documents:       13
Audit Logs:      20

=== SAMPLE DOMAINS ===
diskominfo.kalbarprov.go.id   Active   2024-01-20
disdikbud.kalbarprov.go.id    Active   2024-02-18
dinkes.kalbarprov.go.id       Active   2024-03-12
...
```

## Testing

1. **Restart Development Server** (jika belum restart):
   ```powershell
   npm run dev
   ```

2. **Buka Browser**: http://localhost:9002

3. **Login dengan Super Admin**:
   - Email: `superadmin@kalbarprov.go.id`
   - Password: (sesuai password yang sudah di-hash di database)

4. **Cek Halaman-Halaman Berikut**:
   - Dashboard: Harus menampilkan statistik Kalbar
   - Domains: Harus ada 10 domain *.kalbarprov.go.id
   - Applications: Harus ada 22 permohonan (domain + hosting)
   - Users: Harus ada 15 users dengan email @kalbarprov.go.id
   - Audit Trail: Harus ada 20 log aktivitas

## Catatan Penting

### Database Configuration
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=Taksaka99
DB_NAME=domain_manager
```

### Struktur Database
Berdasarkan investigasi, struktur database aktual:
- **users**: Tidak ada kolom `nip`, `whatsapp`, `password_hash` (pakai `password`)
- **users.role**: Hanya enum `'AdminDaerah'` dan `'SuperAdmin'` (bukan `'Admin Daerah'`)
- **domains**: Tidak ada kolom `opd_id` (relasi via `application_id` → `applications.opd_id`)
- **notifications**: Tabel ini tidak ada di database saat ini

### Mock Data vs Database
- **Mock Data** (`src/backend/utils/mock-data.ts`): Hanya digunakan sebagai **fallback** saat database error
- **Database MySQL**: **Sumber data utama** yang dibaca oleh service layer
- Service layer pattern:
  ```typescript
  try {
    return await databaseService.getData(); // PRIMARY SOURCE
  } catch (error) {
    return MOCK_DATA; // FALLBACK ONLY
  }
  ```

## Files yang Dibuat

1. **`seed-kalbar-data.sql`** (432 lines)
   - Script SQL final yang berhasil dijalankan
   - Disesuaikan dengan struktur database MySQL yang ada
   - Termasuk data verification queries

2. **`update-data-kalbar.sql`** (versi awal)
   - Script awal sebelum disesuaikan
   - Disimpan untuk referensi

## Commit History

```
bc9c3a5 - chore: Add SQL seed script for Kalimantan Barat data
0c8ebb8 - fix: Update turbopack configuration to non-deprecated format
57257da - fix: Remove duplicate lockfiles and fix Next.js workspace root warning
23a0eb8 - docs: Add DATA-DUMMY-KALBAR.md documentation
f475372 - feat: Update mock data with comprehensive Kalimantan Barat dataset
```

## Troubleshooting

### Jika Data Tidak Muncul di Website

1. **Cek Database Connection**:
   ```powershell
   mysql -u root -pTaksaka99 -e "SELECT COUNT(*) FROM opds" domain_manager
   ```
   Harus return: 20

2. **Clear Next.js Cache**:
   ```powershell
   Remove-Item .next -Recurse -Force
   ```

3. **Restart Dev Server**:
   - Hentikan server (Ctrl+C)
   - Jalankan lagi: `npm run dev`

4. **Hard Refresh Browser**:
   - Windows: `Ctrl + Shift + R`
   - Mac: `Cmd + Shift + R`

### Jika Perlu Rollback

```sql
-- Backup current data
mysqldump -u root -pTaksaka99 domain_manager > backup-kalbar.sql

-- Restore old data (jika ada)
mysql -u root -pTaksaka99 domain_manager < backup-bandung.sql
```

## Kesimpulan

✅ Database MySQL berhasil diupdate dengan data Kalimantan Barat  
✅ Semua tabel terisi dengan data yang konsisten dan realistis  
✅ Website sekarang menampilkan data OPD, users, domains untuk Prov. Kalbar  
✅ Script SQL dapat digunakan untuk reset database ke state Kalbar  

## Next Steps

- [ ] Update authentication untuk menggunakan password yang di-hash dengan benar
- [ ] Tambahkan data notifikasi setelah tabel `notifications` dibuat
- [ ] Buat backup database secara berkala
- [ ] Pertimbangkan membuat migration script untuk perubahan schema di masa depan
