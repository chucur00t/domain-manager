# ANALISIS FITUR REAKTIVASI DOMAIN

## 📋 RINGKASAN EKSEKUTIF

Fitur reaktivasi domain memungkinkan Admin Daerah untuk mengajukan permohonan pengaktifan kembali domain yang berstatus **Expired/Kedaluwarsa**. Sistem ini dirancang dengan workflow approval untuk memastikan kontrol dan akuntabilitas.

---

## 🎯 TUJUAN FITUR

1. **Untuk Admin Daerah:**

   - Mengajukan permohonan reaktivasi domain yang expired
   - Memberikan justifikasi/alasan reaktivasi
   - Melampirkan dokumen pendukung
   - Tracking status permohonan

2. **Untuk Super Admin:**
   - Review dan validasi permohonan reaktivasi
   - Menyetujui atau menolak dengan komentar
   - Memastikan domain layak diaktifkan kembali

---

## 🔄 ALUR PROSES (WORKFLOW)

```
┌─────────────────┐
│  Admin Daerah   │
│  Submit Request │
└────────┬────────┘
         │
         ▼
┌─────────────────────────┐
│  Status: Pending        │
│  Domain: Expired        │
└────────┬────────────────┘
         │
         ▼
┌─────────────────┐
│  Super Admin    │
│  Review Request │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
┌───▼───┐ ┌──▼──────┐
│Approve│ │ Reject  │
└───┬───┘ └──┬──────┘
    │        │
    ▼        ▼
┌─────┐  ┌──────────┐
│Active│  │ Expired  │
│     │  │(tetap)   │
└─────┘  └──────────┘
```

---

## 💾 STRUKTUR DATABASE

### Tabel Baru: `reactivation_requests`

```sql
CREATE TABLE reactivation_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    domain_id INT NOT NULL,
    requester_id INT NOT NULL,
    reason TEXT NOT NULL COMMENT 'Alasan reaktivasi',
    status ENUM('Pending', 'Approved', 'Rejected') NOT NULL DEFAULT 'Pending',
    decision_comment TEXT NULL COMMENT 'Komentar dari Super Admin',
    decided_by INT NULL COMMENT 'Super Admin yang memutuskan',
    requested_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    decided_at TIMESTAMP NULL,

    FOREIGN KEY (domain_id) REFERENCES domains(id) ON DELETE CASCADE,
    FOREIGN KEY (requester_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (decided_by) REFERENCES users(id) ON DELETE SET NULL,

    INDEX idx_domain_id (domain_id),
    INDEX idx_requester_id (requester_id),
    INDEX idx_status (status),
    INDEX idx_requested_at (requested_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### Tabel Pendukung: `reactivation_documents`

```sql
CREATE TABLE reactivation_documents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    reactivation_request_id INT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    uploaded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (reactivation_request_id) REFERENCES reactivation_requests(id) ON DELETE CASCADE,

    INDEX idx_reactivation_request_id (reactivation_request_id),
    INDEX idx_uploaded_at (uploaded_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## 📐 ARSITEKTUR SISTEM

### 1. **Backend - Service Layer**

**File:** `src/backend/database/services/reactivation-request.service.ts`

**Methods:**

- `createReactivationRequest(data)` - Buat permohonan reaktivasi
- `getReactivationRequests(filters?)` - List dengan filter status/domain/opd
- `getReactivationRequestById(id)` - Detail permohonan
- `approveReactivationRequest(id, decided_by, comment?)` - Setujui
- `rejectReactivationRequest(id, decided_by, comment)` - Tolak
- `addDocument(data)` - Tambah dokumen
- `getDocuments(reactivation_request_id)` - List dokumen
- `deleteReactivationRequest(id)` - Hapus (hanya pending)

### 2. **Backend - API Routes**

#### GET `/api/reactivation-requests`

- Query params: `status`, `domain_id`, `opd_id`, `requester_id`
- Response: Array of reactivation requests

#### POST `/api/reactivation-requests`

```json
{
  "domain_id": 1,
  "requester_id": 2,
  "reason": "Domain diperlukan kembali untuk..."
}
```

#### GET `/api/reactivation-requests/[id]`

- Response: Detail request + documents

#### PATCH `/api/reactivation-requests/[id]`

```json
{
  "decision": "approve" | "reject",
  "decided_by": 1,
  "comment": "Optional untuk approve, wajib untuk reject"
}
```

- **Side Effect pada Approve:** Domain status → `Active`, expires_at → +365 days

#### DELETE `/api/reactivation-requests/[id]`

- Hanya bisa delete request dengan status Pending

### 3. **TypeScript Interfaces**

**File:** `src/backend/models/types.ts`

```typescript
export type ReactivationRequestStatus = "Pending" | "Approved" | "Rejected";

export interface ReactivationRequest {
  id: number;
  domain_id: number;
  domain_name: string;
  requester_id: number;
  requester_name: string;
  requester_email: string;
  requester_opd: string;
  reason: string;
  status: ReactivationRequestStatus;
  decision_comment?: string;
  decided_by?: number;
  decider_name?: string;
  requested_at: string;
  decided_at?: string;
  // Joined fields
  opd_id: number;
  domain_status: DomainStatus;
  domain_expires_at: string;
}

export interface ReactivationDocument {
  id: number;
  reactivation_request_id: number;
  file_name: string;
  file_path: string;
  file_type: string;
  uploaded_at: string;
}
```

---

## 🎨 USER INTERFACE

### **Admin Daerah - Halaman Pengajuan**

**Route:** `/domains/reactivate`

**Komponen UI:**

1. **Card Header:**

   - Judul: "Pengajuan Reaktivasi Domain"
   - Deskripsi: Penjelasan singkat tentang proses

2. **Form Fields:**

   - **Domain Selection** (Dropdown/Select)

     - Filter: Hanya domain dengan status `Expired`
     - Filter: Hanya domain milik OPD user login
     - Display: `domain_name` + `expires_at` (kapan expired)

   - **Alasan Reaktivasi** (Textarea) \*Required

     - Placeholder: "Jelaskan mengapa domain perlu diaktifkan kembali..."
     - Min length: 20 karakter
     - Max length: 1000 karakter

   - **Dokumen Pendukung** (File Upload) \*Optional
     - Format: PDF, DOC, DOCX, JPG, PNG
     - Max size: 5MB per file
     - Multiple files allowed
     - Preview dengan tombol hapus

3. **Info Box:**

   - Informasi tentang proses approval
   - Estimasi waktu review
   - Domain akan diperpanjang 1 tahun jika disetujui

4. **Action Buttons:**

   - Submit (Primary)
   - Kembali (Secondary)

5. **Validasi:**
   - Domain harus status Expired
   - Tidak boleh ada permohonan pending untuk domain yang sama
   - Reason wajib diisi

---

### **Super Admin - Halaman List Permohonan**

**Route:** `/super-admin/reactivation-requests`

**Komponen UI:**

1. **Stats Dashboard:**

   ```
   ┌─────────────────┬─────────────────┬─────────────────┐
   │ Total           │ Menunggu        │ Diproses Hari   │
   │ Permohonan      │ Persetujuan     │ Ini             │
   │      45         │       12        │       3         │
   └─────────────────┴─────────────────┴─────────────────┘
   ```

2. **Filter Panel:**

   - Search bar (domain, pemohon, OPD)
   - Status dropdown (Semua/Pending/Approved/Rejected)
   - Date range picker (optional)

3. **Table Columns:**
   | Domain | Pemohon | OPD | Expired Date | Tanggal Pengajuan | Status | Aksi |
   |--------|---------|-----|--------------|-------------------|--------|------|
   | subdomain.go.id | John Doe | Dinas Kominfo | 2024-12-01 | 2025-01-15 | Badge | Detail |

4. **Status Badges:**
   - Pending: Orange/Warning
   - Approved: Green/Success
   - Rejected: Red/Destructive

---

### **Super Admin - Halaman Detail & Approval**

**Route:** `/super-admin/reactivation-requests/[id]`

**Komponen UI:**

1. **Header:**

   - Breadcrumb navigation
   - Status badge
   - ID Permohonan

2. **Section: Informasi Domain**

   - Nama Domain
   - Status saat ini (Expired)
   - Tanggal expired
   - OPD pemilik

3. **Section: Informasi Pemohon**

   - Nama
   - Email
   - OPD
   - Tanggal pengajuan

4. **Section: Detail Permohonan**

   - Alasan reaktivasi (dalam box dengan format baik)
   - List dokumen pendukung (download button)

5. **Section: Form Keputusan** (Hanya untuk status Pending)

   - Radio button:

     - ✓ Setujui Permohonan
       - Domain akan diaktifkan kembali
       - Masa aktif diperpanjang 1 tahun
     - ✗ Tolak Permohonan
       - Domain tetap expired

   - Komentar (Textarea)

     - Required untuk reject
     - Optional untuk approve

   - Action buttons:
     - **Setujui** (Green, primary)
     - **Tolak** (Red, destructive)
     - **Batal** (Gray, outline)

6. **Section: Keputusan** (Jika sudah diproses)
   - Diputuskan oleh
   - Tanggal keputusan
   - Komentar
   - Status final

---

## 🔒 VALIDASI & BUSINESS RULES

### Validasi Pengajuan (Admin Daerah):

1. ✅ Domain harus berstatus `Expired`
2. ✅ Domain harus milik OPD user yang login
3. ✅ Tidak boleh ada permohonan Pending untuk domain yang sama
4. ✅ Alasan wajib diisi (min 20 karakter)
5. ✅ File upload maks 5MB per file
6. ✅ Format file: PDF, DOC, DOCX, JPG, PNG

### Validasi Approval (Super Admin):

1. ✅ Request harus status Pending
2. ✅ Komentar wajib untuk reject
3. ✅ Tidak bisa approve/reject request yang sudah diproses
4. ✅ Domain masih harus Expired saat approval

### Auto-Actions pada Approval:

```typescript
// Jika APPROVED:
- reactivation_requests.status = 'Approved'
- reactivation_requests.decided_by = super_admin_id
- reactivation_requests.decided_at = NOW()
- domains.status = 'Active'
- domains.expires_at = NOW() + INTERVAL 365 DAY
- Kirim notifikasi ke Admin Daerah
- Buat audit log: APPROVE_REACTIVATION_REQUEST
- Buat audit log: REACTIVATE_DOMAIN

// Jika REJECTED:
- reactivation_requests.status = 'Rejected'
- reactivation_requests.decided_by = super_admin_id
- reactivation_requests.decided_at = NOW()
- reactivation_requests.decision_comment = comment
- domains.status = tetap 'Expired'
- Kirim notifikasi ke Admin Daerah
- Buat audit log: REJECT_REACTIVATION_REQUEST
```

---

## 🔔 NOTIFIKASI

### Untuk Admin Daerah:

1. **Saat Submit:** "Permohonan reaktivasi berhasil diajukan"
2. **Saat Approved:**
   ```
   Judul: Permohonan Reaktivasi Disetujui
   Isi: Domain [nama_domain] telah diaktifkan kembali dan diperpanjang hingga [tanggal]
   ```
3. **Saat Rejected:**
   ```
   Judul: Permohonan Reaktivasi Ditolak
   Isi: Permohonan reaktivasi domain [nama_domain] ditolak.
   Alasan: [decision_comment]
   ```

### Untuk Super Admin:

1. **Ada permohonan baru:** "Permohonan reaktivasi baru memerlukan persetujuan Anda"

---

## 📊 DASHBOARD WIDGETS

### Admin Daerah Dashboard:

```
┌─────────────────────────────────────┐
│  Status Permohonan Reaktivasi       │
├─────────────────────────────────────┤
│  • Pending: 2 permohonan            │
│  • Disetujui bulan ini: 5           │
│  • Ditolak bulan ini: 1             │
└─────────────────────────────────────┘
```

### Super Admin Dashboard:

```
┌─────────────────────────────────────┐
│  Permohonan Reaktivasi Domain       │
├─────────────────────────────────────┤
│  • Menunggu Persetujuan: 12         │
│  • Disetujui hari ini: 3            │
│  • Total bulan ini: 45              │
└─────────────────────────────────────┘
```

---

## 🎯 NAVIGASI MENU

### Admin Daerah:

**Menu:** Pengajuan → **Reaktivasi Domain**

- Icon: `RefreshCw` atau `RotateCcw`
- Route: `/domains/reactivate`

### Super Admin:

**Menu:** Persetujuan → **Permohonan Reaktivasi**

- Icon: `RefreshCw` atau `CheckSquare`
- Route: `/super-admin/reactivation-requests`

---

## 🚀 IMPLEMENTASI TIMELINE

### Priority: HIGH

1. ✅ Database Schema (10 min)
2. ✅ TypeScript Types (10 min)
3. ✅ Service Layer (60 min)
4. ✅ API Endpoints (45 min)

### Priority: MEDIUM

5. ✅ Admin Daerah - Form Page (90 min)
6. ✅ Super Admin - List Page (60 min)
7. ✅ Super Admin - Detail Page (90 min)
8. ✅ Navigation Menu Update (10 min)

### Priority: LOW

9. ⏳ Notifications (30 min)
10. ⏳ Audit Logs (20 min)
11. ⏳ Dashboard Widgets (45 min)
12. ⏳ Mock Data (20 min)

**Total Estimasi:** 8-10 jam development

---

## 🔍 PERBEDAAN DENGAN DEAKTIVASI

| Aspek             | Deaktivasi               | Reaktivasi                              |
| ----------------- | ------------------------ | --------------------------------------- |
| **Trigger**       | Domain Active            | Domain Expired                          |
| **Tujuan**        | Nonaktifkan domain       | Aktifkan kembali domain                 |
| **Hasil Approve** | Status → Expired         | Status → Active, expires_at → +365 hari |
| **Urgency**       | Low (domain masih aktif) | Medium-High (domain sudah mati)         |
| **Dokumen**       | Optional                 | Optional tapi direkomendasikan          |
| **Perpanjangan**  | Tidak ada                | Ya, otomatis +1 tahun                   |

---

## 💡 FITUR TAMBAHAN (NICE TO HAVE)

1. **Riwayat Reaktivasi:**

   - Tampilkan berapa kali domain pernah direaktivasi
   - Warning jika terlalu sering (> 3 kali/tahun)

2. **Auto-reminder untuk Admin Daerah:**

   - 30 hari sebelum expired: "Domain akan expired"
   - 7 hari sebelum expired: "Domain segera expired"
   - Saat expired: "Ajukan reaktivasi jika masih diperlukan"

3. **Batch Approval:**

   - Super Admin bisa approve multiple requests sekaligus

4. **Perpanjangan Customizable:**

   - Super Admin bisa set perpanjangan (1 tahun, 2 tahun, dst)

5. **Alasan Template:**
   - Dropdown alasan umum untuk mempercepat pengisian
   - "Domain masih digunakan untuk layanan publik"
   - "Terjadi kendala teknis sebelumnya"
   - "Lainnya (tulis manual)"

---

## ✅ CHECKLIST IMPLEMENTASI

### Database

- [ ] Create table `reactivation_requests`
- [ ] Create table `reactivation_documents`
- [ ] Add indexes
- [ ] Test foreign keys

### Backend

- [ ] Create `reactivation-request.service.ts`
- [ ] Create API route `/api/reactivation-requests` (GET, POST)
- [ ] Create API route `/api/reactivation-requests/[id]` (GET, PATCH, DELETE)
- [ ] Add TypeScript interfaces
- [ ] Handle domain status update on approve
- [ ] Handle expires_at extension (+365 days)

### Frontend - Admin Daerah

- [ ] Create page `/domains/reactivate`
- [ ] Domain dropdown (filter Expired, filter OPD)
- [ ] Reason textarea with validation
- [ ] Document upload with preview
- [ ] Form submission with API integration
- [ ] Success/error handling
- [ ] Add menu item to navigation

### Frontend - Super Admin

- [ ] Create page `/super-admin/reactivation-requests` (list)
- [ ] Stats dashboard
- [ ] Filter by status, search
- [ ] Table with status badges
- [ ] Create page `/super-admin/reactivation-requests/[id]` (detail)
- [ ] Display request info
- [ ] Approval/rejection form
- [ ] API integration for approve/reject
- [ ] Add menu item to navigation

### Integration

- [ ] Test full workflow (submit → approve → domain active)
- [ ] Test rejection flow
- [ ] Test validation rules
- [ ] Test with multiple users/OPDs
- [ ] Add audit logs
- [ ] Add notifications
- [ ] Add dashboard widgets

### Documentation

- [ ] API documentation
- [ ] User guide for Admin Daerah
- [ ] User guide for Super Admin

---

## 📝 CONTOH USE CASE

### Scenario 1: Reaktivasi Domain yang Masih Diperlukan

```
1. Domain "layanan.dinas-a.go.id" expired pada 2025-01-01
2. Admin Daerah menyadari domain masih diperlukan pada 2025-01-15
3. Admin Daerah submit permohonan reaktivasi dengan alasan:
   "Domain masih digunakan untuk layanan pengaduan masyarakat"
4. Super Admin review, cek apakah layak
5. Super Admin approve
6. Domain status → Active, expires_at → 2026-01-15
7. Admin Daerah dapat notifikasi, dapat langsung pakai domain
```

### Scenario 2: Reaktivasi Ditolak

```
1. Domain "test.dinas-b.go.id" expired pada 2024-12-01
2. Admin Daerah submit reaktivasi pada 2025-02-01 (2 bulan setelah expired)
3. Super Admin review, tidak ada justifikasi kuat
4. Super Admin reject dengan komentar:
   "Domain expired terlalu lama dan tidak ada aktivitas sebelumnya.
    Silakan ajukan domain baru jika diperlukan."
5. Admin Daerah dapat notifikasi, bisa ajukan domain baru
```

---

## 🎓 BEST PRACTICES

1. **Reaktivasi Cepat:** Domain yang baru expired (< 30 hari) diprioritaskan
2. **Dokumentasi Lengkap:** Admin Daerah didorong upload bukti kebutuhan
3. **Audit Trail:** Semua keputusan tercatat dengan detail
4. **Komunikasi Jelas:** Komentar rejection harus konstruktif
5. **Monitoring:** Dashboard tracking untuk identifikasi pola

---

## 📌 KESIMPULAN

Fitur reaktivasi domain dirancang untuk:

- ✅ Memberikan kesempatan kedua untuk domain expired
- ✅ Mempertahankan kontrol Super Admin
- ✅ Efisien: Lebih cepat dari pengajuan domain baru
- ✅ Transparan: Semua proses tercatat
- ✅ User-friendly: UI intuitif untuk kedua role

**Status:** Siap untuk implementasi
**Estimasi Waktu:** 8-10 jam development + 2 jam testing
