# Perbaikan Sinkronisasi Data - Laporan & Audit Trail

## Masalah yang Ditemukan

Halaman **Laporan Permohonan** dan **Audit Trail** tidak sinkron dengan data yang ada karena:

1. **Format data tidak konsisten** antara backend (database) dan frontend
2. **Properti nama berbeda** antara yang dikembalikan backend vs yang diharapkan frontend
3. **Timestamp format** tidak konsisten

## Perbaikan yang Dilakukan

### 1. Audit Log Service (`src/backend/database/services/audit-log.service.ts`)

**Sebelum:**
```typescript
{
  id: log.id.toString(),
  userId: log.user_id.toString(),
  action: log.action,
  resourceType: log.application_id ? 'Application' : 'System',
  ...
}
```

**Sesudah:**
```typescript
{
  id: log.id,
  user_id: log.user_id,
  application_id: log.application_id,
  action: log.action,
  details: log.details || log.action,
  timestamp: log.timestamp.toISOString(),
  username: log.username || log.email || 'System',
  user_role: role || 'Unknown'
}
```

**Dampak:** 
- Audit Trail sekarang menampilkan data sesuai struktur database
- Properti `username` dan `user_role` tersedia untuk ditampilkan
- Timestamp dalam format ISO standar

### 2. Application Service (`src/backend/database/services/application.service.ts`)

**Perbaikan di `getApplications()`:**

```typescript
// Compatibility aliases untuk frontend
domainName: app.requested_domain_name || (app.opd_name
  ? `${app.opd_name.toLowerCase().replace(/\s+/g, "-")}.kalbarprov.go.id`
  : ""),
submittedDate: app.submitted_at.toISOString(),  // Format ISO lengkap
submissionDate: app.submitted_at.toISOString(),
```

**Perbaikan di `getApplication()`:**

```typescript
// Compatibility aliases untuk frontend
submittedDate: app.submitted_at.toISOString(),  // Format ISO lengkap
submissionDate: app.submitted_at.toISOString(),
```

**Dampak:**
- Halaman Laporan menampilkan domain name dengan benar
- Tanggal submission ditampilkan dalam format yang konsisten
- Data OPD dan status tersedia dengan benar

## Cara Verifikasi

### 1. Jalankan SQL Check Script

Jalankan file `check-data-sync.sql` di phpMyAdmin untuk melihat:
- Total audit logs yang tersedia
- Total applications yang tersedia
- Distribusi status aplikasi
- Distribusi aksi dalam audit trail
- Users yang paling aktif

### 2. Cek di Browser

1. **Halaman Audit Trail** (`/super-admin/audit-trail`):
   - Harus menampilkan semua aktivitas sistem
   - Kolom: Waktu, Pengguna, Peran, Aksi, Detail
   - Data harus terurut dari yang terbaru

2. **Halaman Laporan** (`/super-admin/applications`):
   - Harus menampilkan semua permohonan domain
   - Kolom: Tanggal, OPD, Domain, Tujuan, Status
   - Filter by status dan OPD harus berfungsi

### 3. Test API Endpoints

Buka di browser atau Postman:

```
GET http://localhost:3000/api/audit-logs
GET http://localhost:3000/api/applications
```

Pastikan response mengembalikan data dalam format yang benar.

## Data yang Diperlukan

Untuk halaman berfungsi dengan baik, pastikan tabel berikut memiliki data:

### audit_logs
- `id`, `user_id`, `action`, `details`, `timestamp`
- `application_id` (opsional)

### applications
- `id`, `application_type`, `requested_domain_name`
- `opd_id`, `submitter_id`, `status`, `reason`
- `submitted_at`, `approved_at`

### users
- `id`, `username`, `email`, `role`, `is_active`

### opds
- `id`, `name`

## Troubleshooting

### Jika Audit Trail masih kosong:

1. Cek apakah ada data di tabel `audit_logs`:
   ```sql
   SELECT COUNT(*) FROM audit_logs;
   ```

2. Cek console browser untuk error
3. Cek console VS Code terminal untuk error backend

### Jika Laporan masih kosong:

1. Cek apakah ada data di tabel `applications`:
   ```sql
   SELECT COUNT(*) FROM applications WHERE application_type = 'domain';
   ```

2. Pastikan `requested_domain_name` tidak NULL
3. Cek relasi foreign key dengan tabel `opds` dan `users`

## Update Data Lama

Jika ada soft-deleted users yang masih memblokir username/email baru:

```powershell
mysql -u root -p domain_manager < fix-deleted-users.sql
```

Script ini akan menambahkan suffix `_deleted_[timestamp]` ke username dan email user yang sudah dihapus, sehingga credentials tersebut bisa digunakan lagi untuk user baru.

## Status Perbaikan

✅ Audit Log Service - Format data diperbaiki
✅ Application Service - Compatibility aliases ditambahkan
✅ Delete User - Menambahkan timestamp ke username/email
✅ SQL Check Scripts - Untuk verifikasi data
✅ Dokumentasi - File ini

## Catatan Penting

- **JANGAN** hapus properti database asli (`submitted_at`, `user_id`, dll)
- **TAMBAHKAN** alias untuk kompatibilitas frontend (`submittedDate`, `userId`, dll)
- **PASTIKAN** timestamp selalu dalam format ISO (`toISOString()`)
- **VALIDASI** data dengan SQL scripts sebelum menguji di browser
