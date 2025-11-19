# Data Dummy Lengkap - Domain Manager Kalbar

## Overview
File ini berisi dokumentasi data dummy yang lengkap untuk testing semua fitur Domain Manager.

## Cara Import Data

```powershell
# 1. Pastikan tabel sudah ada
Get-Content create-reactivation-tables.sql | mysql -u root -pTaksaka99 domain_manager
Get-Content create-missing-tables.sql | mysql -u root -pTaksaka99 domain_manager

# 2. Buat tabel deactivation jika belum ada
mysql -u root -pTaksaka99 domain_manager -e "CREATE TABLE IF NOT EXISTS deactivation_requests (id INT AUTO_INCREMENT PRIMARY KEY, domain_id INT NOT NULL, requester_id INT NOT NULL, reason TEXT NOT NULL, status VARCHAR(20) NOT NULL DEFAULT 'Pending', decision_comment TEXT, decided_by INT, requested_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, decided_at TIMESTAMP NULL, FOREIGN KEY (domain_id) REFERENCES domains(id) ON DELETE CASCADE, FOREIGN KEY (requester_id) REFERENCES users(id) ON DELETE CASCADE, FOREIGN KEY (decided_by) REFERENCES users(id) ON DELETE SET NULL, INDEX idx_domain_id (domain_id), INDEX idx_requester_id (requester_id), INDEX idx_status (status), INDEX idx_requested_at (requested_at)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;"

mysql -u root -pTaksaka99 domain_manager -e "CREATE TABLE IF NOT EXISTS deactivation_documents (id INT AUTO_INCREMENT PRIMARY KEY, deactivation_request_id INT NOT NULL, file_name VARCHAR(255) NOT NULL, file_path VARCHAR(512) NOT NULL, file_type VARCHAR(50), uploaded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (deactivation_request_id) REFERENCES deactivation_requests(id) ON DELETE CASCADE, INDEX idx_deactivation_request_id (deactivation_request_id), INDEX idx_uploaded_at (uploaded_at)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;"

# 3. Import data dummy
Get-Content seed-complete-kalbar-data.sql | mysql -u root -pTaksaka99 domain_manager
```

## Data Summary

### 1. OPDs (20 organisasi)
- Dinas Komunikasi dan Informatika
- Dinas Pendidikan dan Kebudayaan
- Dinas Kesehatan
- Dinas Pekerjaan Umum dan Penataan Ruang
- Dinas Sosial
- Dinas Perhubungan
- Dinas Pariwisata
- Dinas Pertanian
- Dinas Perikanan
- Dinas Perdagangan
- Badan Perencanaan Pembangunan Daerah
- Badan Pengelolaan Keuangan dan Aset Daerah
- Badan Kepegawaian Daerah
- Dinas Lingkungan Hidup
- Dinas Perindustrian
- Satuan Polisi Pamong Praja
- Dinas Kependudukan dan Pencatatan Sipil
- Dinas Pemberdayaan Masyarakat
- Dinas Pemuda dan Olahraga
- Dinas Perpustakaan dan Kearsipan

### 2. Users (22 users)
- **1 Super Admin**: superadmin@kalbarprov.go.id
- **20 Admin Daerah**: Masing-masing OPD memiliki admin
- **1 User Inactive**: Untuk testing user non-aktif

### 3. Applications (42 permohonan)

#### Domain Applications (25 total):
- **15 Approved** ✅ (sudah disetujui dan menjadi domain aktif)
- **7 Pending** ⏳ (menunggu persetujuan Super Admin)
- **3 Rejected** ❌ (ditolak dengan berbagai alasan)

#### Hosting Applications (17 total):
- **10 Approved** ✅ (sudah disetujui dan aktif)
- **5 Pending** ⏳ (menunggu persetujuan)
- **2 Rejected** ❌ (ditolak)

### 4. Domains (15 domain)

#### Status Distribution:
- **10 Active** 🟢 (domain aktif dan berjalan normal)
  - diskominfo.kalbarprov.go.id
  - disdikbud.kalbarprov.go.id
  - dinkes.kalbarprov.go.id
  - dpupr.kalbarprov.go.id
  - dinsos.kalbarprov.go.id
  - dishub.kalbarprov.go.id
  - dispar.kalbarprov.go.id
  - disperta.kalbarprov.go.id
  - dkp.kalbarprov.go.id
  - disdag.kalbarprov.go.id

- **3 Suspended** 🟡 (ditangguhkan, bisa direaktivasi)
  - bappeda.kalbarprov.go.id
  - bpkad.kalbarprov.go.id
  - bkd.kalbarprov.go.id

- **2 Deactivated** 🔴 (dinonaktifkan, bisa direaktivasi)
  - dlh.kalbarprov.go.id
  - disperindag.kalbarprov.go.id

### 5. Hostings (10 hosting)
Semua dengan status **Active**, berbagai konfigurasi:
- **Shared hosting**: 4 instances (10-15 GB)
- **VPS hosting**: 3 instances (20-25 GB)
- **Dedicated hosting**: 2 instances (30-40 GB)

### 6. Documents (10 dokumen)
Dokumen pendukung untuk aplikasi:
- Surat permohonan
- Proposal
- Spesifikasi teknis hosting

### 7. Deactivation Requests (6 permohonan)

#### Status:
- **3 Pending** ⏳ (menunggu keputusan Super Admin)
  - Domain diskominfo - alasan: migrasi ke platform baru
  - Domain disdikbud - alasan: reorganisasi struktur
  - Domain dinkes - alasan: migrasi ke cloud
  
- **2 Approved** ✅ (disetujui, domain menjadi Deactivated)
  - Domain dlh
  - Domain disperindag
  
- **1 Rejected** ❌ (ditolak)
  - Domain dpupr - alasan: masih digunakan untuk layanan penting

### 8. Reactivation Requests (4 permohonan)

#### Status:
- **2 Pending** ⏳ (menunggu keputusan)
  - Domain bappeda - untuk sistem perencanaan baru
  - Domain bpkad - untuk integrasi e-budgeting
  
- **1 Approved** ✅ (disetujui)
  - Domain bkd - untuk sistem kepegawaian
  
- **1 Rejected** ❌ (ditolak)
  - Domain dlh - disarankan pakai subdomain alternatif

### 9. Notifications (13 notifikasi)

#### Untuk Super Admin:
- **4 Unread** 📬:
  - Permohonan domain baru (Satpolpp)
  - Permohonan deaktivasi domain (Diskominfo)
  - Permohonan reaktivasi domain (Bappeda)
  - Permohonan hosting baru (Bappeda)
  
- **2 Read** ✅:
  - Konfirmasi approval aplikasi

#### Untuk Admin Daerah:
- **5 Unread** 📬:
  - Notifikasi approval domain
  - Status permohonan pending
  - Warning perpanjangan domain
  
- **1 Read** ✅:
  - Notifikasi penolakan

#### System Notifications:
- **1 Unread** 📬:
  - Pengumuman maintenance sistem

### 10. Audit Logs (30 aktivitas)

Mencatat semua aktivitas:
- **Login/Logout**: User authentication
- **Application Management**: Submit, approve, reject
- **Domain Operations**: Activate, suspend, deactivate
- **Deactivation/Reactivation**: Request submissions dan decisions
- **Hosting Management**: Application dan approval
- **User Management**: Create, update, deactivate users
- **Document Operations**: Upload dokumen
- **System Operations**: Backup, generate reports

## Testing Scenarios

### 1. Super Admin Testing
Login sebagai: `superadmin@kalbarprov.go.id`

**Dapat melakukan:**
- ✅ Melihat semua permohonan domain (7 pending)
- ✅ Approve/reject permohonan domain
- ✅ Melihat semua permohonan hosting (5 pending)
- ✅ Approve/reject permohonan hosting
- ✅ Melihat permohonan deaktivasi domain (3 pending)
- ✅ Approve/reject deaktivasi dengan komentar
- ✅ Melihat permohonan reaktivasi domain (2 pending)
- ✅ Approve/reject reaktivasi dengan komentar
- ✅ Mengelola semua domain (activate, suspend, deactivate)
- ✅ Melihat dan mengelola semua user
- ✅ Melihat audit trail lengkap
- ✅ Generate reports (CSV/PDF)
- ✅ Melihat notifikasi sistem

### 2. Admin Daerah Testing
Login sebagai salah satu: `admin.diskominfo@kalbarprov.go.id` (atau admin OPD lain)

**Dapat melakukan:**
- ✅ Membuat permohonan domain baru
- ✅ Membuat permohonan hosting baru
- ✅ Upload dokumen pendukung
- ✅ Melihat status permohonan sendiri
- ✅ Mengajukan deaktivasi domain (untuk domain OPD sendiri)
- ✅ Mengajukan reaktivasi domain (untuk domain OPD sendiri)
- ✅ Melihat notifikasi terkait permohonan
- ✅ Melihat domain dan hosting milik OPD sendiri

**Tidak dapat melakukan:**
- ❌ Approve/reject permohonan
- ❌ Melihat permohonan OPD lain
- ❌ Mengelola domain OPD lain
- ❌ Mengakses user management
- ❌ Melihat audit trail lengkap

### 3. Domain Status Workflow Testing

#### Active → Deactivation Request → Deactivated
1. Login sebagai Admin Daerah Diskominfo
2. Buka domain `diskominfo.kalbarprov.go.id` (Status: Active)
3. Klik "Ajukan Deaktivasi"
4. Isi alasan dan upload dokumen
5. Submit permohonan
6. Login sebagai Super Admin
7. Buka menu "Permohonan Deaktivasi"
8. Review permohonan dari Diskominfo
9. Approve dengan komentar
10. Domain berubah status menjadi Deactivated

#### Suspended/Deactivated → Reactivation Request → Active
1. Login sebagai Admin Daerah Bappeda
2. Buka domain `bappeda.kalbarprov.go.id` (Status: Suspended)
3. Klik "Ajukan Reaktivasi"
4. Isi alasan dan upload dokumen
5. Submit permohonan
6. Login sebagai Super Admin
7. Buka menu "Permohonan Reaktivasi"
8. Review permohonan dari Bappeda
9. Approve dengan komentar
10. Domain berubah status menjadi Active

### 4. Application Workflow Testing

#### Permohonan Domain Baru
1. Login sebagai Admin Daerah (misal: Dispora)
2. Klik "Permohonan" → "Permohonan Baru"
3. Pilih jenis: Domain
4. Isi form lengkap
5. Upload dokumen persyaratan
6. Submit permohonan
7. Status: Pending (ada di data dummy id 19)

#### Review oleh Super Admin
1. Login sebagai Super Admin
2. Buka "Manajemen Permohonan"
3. Lihat permohonan pending (7 domain, 5 hosting)
4. Klik detail permohonan
5. Review dokumen
6. Approve atau Reject dengan alasan

### 5. Notification Testing
- **Unread notifications**: 8 total
  - Super Admin: 4 unread
  - Admin Daerah: 4 unread
- **Read notifications**: 3 total
- **Types**: domain, hosting, deaktivasi, perpanjangan, system

### 6. Report Testing
Login sebagai Super Admin, buka "Laporan":
- **Overview Report**: Ringkasan sistem
  - Total domains: 15 (10 active, 3 suspended, 2 deactivated)
  - Total applications: 42
  - Approval rate domain: ~60%
  - Approval rate hosting: ~59%
- **Domain Report**: 15 domain per OPD
- **Application Report**: 42 permohonan dengan status
- **Hosting Report**: 10 hosting per framework
- **OPD Report**: 20 OPD dengan aktivitas

### 7. User Management Testing
- **Active users**: 21 users
- **Inactive users**: 1 user (untuk testing)
- **Edit user**: Bisa edit semua field kecuali diri sendiri
- **Toggle status**: Bisa activate/deactivate user

## Notes

### Domain Expiry
Semua domain memiliki masa aktif 1 tahun dari activated_at:
- Domain yang akan expire < 90 hari akan ada notifikasi perpanjangan

### Notification Auto-cleanup
Notifikasi memiliki expires_at (6 bulan dari created_at) untuk auto-cleanup

### File Paths
Semua file path menggunakan format `/uploads/{entity_type}/{id}/{filename}` (simulasi, file fisik tidak ada)

### Real-world Data
Data menggunakan nama OPD asli dari Pemerintah Provinsi Kalimantan Barat dengan alamat dan kontak person yang realistis.

## Credential Testing

### Super Admin
- Email: `superadmin@kalbarprov.go.id`
- Username: Hartoyo
- Role: Super Admin
- OPD: Dinas Komunikasi dan Informatika

### Admin Daerah (Contoh)
- Email: `admin.diskominfo@kalbarprov.go.id`
- Username: Rina Kusumawati
- Role: Admin Daerah
- OPD: Dinas Komunikasi dan Informatika

(Total 20 Admin Daerah, masing-masing untuk setiap OPD)

## Database Statistics

```
✅ OPDs: 20
✅ Users: 22
✅ Applications: 42 (25 domain + 17 hosting)
✅ Domains: 15 (10 active, 3 suspended, 2 deactivated)
✅ Hostings: 10 (all active)
✅ Documents: 10
✅ Deactivation Requests: 6 (3 pending, 2 approved, 1 rejected)
✅ Deactivation Documents: 4
✅ Reactivation Requests: 4 (2 pending, 1 approved, 1 rejected)
✅ Reactivation Documents: 3
✅ Notifications: 13 (8 unread, 5 read)
✅ Audit Logs: 30
```

## Kesimpulan

Data dummy ini mencakup **SEMUA** fitur dan kondisi yang ada di Domain Manager:
- ✅ Manajemen Permohonan (Domain & Hosting)
- ✅ Approval/Rejection Workflow
- ✅ Domain Status Management (Active, Suspended, Deactivated)
- ✅ Deactivation Request Flow
- ✅ Reactivation Request Flow
- ✅ Document Management
- ✅ Notification System
- ✅ User Management
- ✅ Audit Trail
- ✅ Reporting (CSV & PDF)
- ✅ Multi-role Access Control

Data ini siap digunakan untuk testing, demo, dan development! 🎉
