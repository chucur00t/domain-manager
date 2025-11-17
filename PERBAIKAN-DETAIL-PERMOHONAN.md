# Perbaikan Display Data Detail Permohonan

## Masalah yang Diperbaiki

Saat Admin Daerah melihat detail permohonan domain, data yang ditampilkan kosong atau tidak sesuai:
- ❌ Dokumen pendukung menampilkan "Tidak ada dokumen" padahal sudah dilampirkan
- ❌ Deskripsi kosong
- ❌ Tujuan penggunaan tidak ditampilkan
- ❌ Nama domain tidak sesuai

## Solusi yang Diimplementasikan

### 1. Tambah Kolom `requested_domain_name` di Database
```sql
ALTER TABLE applications 
ADD COLUMN requested_domain_name VARCHAR(255) AFTER application_type;

ALTER TABLE applications 
ADD INDEX idx_requested_domain_name (requested_domain_name);
```

**File:** `add-domain-name-column.sql`

### 2. Update Service untuk Menyimpan Domain Name
**File:** `src/backend/database/services/application.service.ts`

- Menambahkan `requested_domain_name` ke INSERT query
- Menambahkan `requested_domain_name` ke semua SELECT query (getApplications, getApplicationById, getApplicationsByStatus)
- Menambahkan alias `getDocumentsByApplicationId()` untuk API consistency

### 3. Update Model Type
**File:** `src/backend/models/types.ts`

Menambahkan field `requested_domain_name` ke interface `Application`.

### 4. Buat API Endpoint untuk Dokumen
**File baru:** `src/app/api/applications/[id]/documents/route.ts`

Endpoint GET untuk mengambil dokumen berdasarkan application ID.

### 5. Perbaiki Tampilan Detail Permohonan
**File:** `src/frontend/components/features/applications/application-detail-client.tsx`

**Perubahan:**
- ✅ Menampilkan `requested_domain_name` sebagai nama domain
- ✅ Tambah field "Domain yang Diminta" di bagian Detail Pemohon
- ✅ Memisahkan "Tujuan Penggunaan" dari field `reason` (parse bagian sebelum ":")
- ✅ Memisahkan "Deskripsi Permohonan" dari field `reason` (parse bagian setelah ":")
- ✅ Fetch dokumen dari API saat component load dengan `useEffect`
- ✅ Menampilkan dokumen dengan button download (ganti hardcoded `{false ?}` dengan real data)
- ✅ Loading state untuk dokumen

### 6. Update Tabel Applications
**File:** `src/frontend/components/features/applications/applications-table.tsx`

Menampilkan `requested_domain_name` di kolom Nama Domain dengan fallback.

## Cara Kerja

### Saat Submit Permohonan:
1. Form mengirim: `domainName`, `purpose`, `description`, `documents[]`
2. API POST `/api/applications` menyimpan:
   - `requested_domain_name` = domainName
   - `reason` = "{purpose}: {description}"
   - documents ke tabel `documents`

### Saat Tampilkan Detail:
1. API GET `/api/applications/{id}` mengambil data application termasuk `requested_domain_name` dan `reason`
2. API GET `/api/applications/{id}/documents` mengambil semua dokumen
3. Component parsing:
   - Domain Name: dari `requested_domain_name`
   - Tujuan: dari `reason.split(":")[0]`
   - Deskripsi: dari `reason.split(":")[1]`
   - Dokumen: dari API documents

## Testing

Untuk test fitur ini:

1. Login sebagai Admin Daerah
2. Buat permohonan domain baru dengan:
   - Nama domain: contoh `testing-domain`
   - Tujuan: `Portal Layanan Publik`
   - Deskripsi: `Website untuk layanan informasi publik`
   - Upload minimal 1 dokumen
3. Submit permohonan
4. Klik "Lihat Detail" pada permohonan yang baru dibuat
5. Verifikasi:
   - ✅ Nama domain ditampilkan: "testing-domain"
   - ✅ Tujuan ditampilkan: "Portal Layanan Publik"
   - ✅ Deskripsi ditampilkan: "Website untuk layanan informasi publik"
   - ✅ Dokumen ditampilkan dengan nama file dan button download

## File yang Dimodifikasi

1. `add-domain-name-column.sql` (baru)
2. `src/backend/database/services/application.service.ts`
3. `src/backend/models/types.ts`
4. `src/app/api/applications/[id]/documents/route.ts` (baru)
5. `src/frontend/components/features/applications/application-detail-client.tsx`
6. `src/frontend/components/features/applications/applications-table.tsx`

## Catatan

- Server dev masih berjalan di http://localhost:9002
- Perubahan database sudah dijalankan (kolom `requested_domain_name` sudah ditambahkan)
- Perlu restart server dev jika ada error TypeScript

## Next Steps

Setelah testing berhasil, jangan lupa:
1. Commit perubahan ke git
2. Push ke branch `tur`
3. Merge dengan `origin/chaca` jika ada conflict
