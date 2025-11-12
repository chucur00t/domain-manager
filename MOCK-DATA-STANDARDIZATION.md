# Mock Data Standardization

**Tanggal**: 12 November 2025  
**Tujuan**: Menyamakan jumlah data di semua halaman UI agar konsisten

## Summary Data Mock

### Total Data
- **OPDs**: 10
- **Users**: 10 (1 Super Admin + 9 Admin Daerah)
- **Domains**: 10
- **Applications**: 14
- **Hosting Applications**: 14

### Breakdown Detail

#### 1. OPDs (10)
1. Dinas Kesehatan
2. Dinas Pendidikan
3. Dinas Komunikasi dan Informatika
4. Dinas Pekerjaan Umum
5. Dinas Sosial
6. Dinas Perdagangan
7. Dinas Perindustrian
8. Dinas Kebudayaan
9. Dinas Kepemudaan dan Olahraga
10. Dinas Perlindungan Anak dan Keluarga Berencana

#### 2. Users (10)
- **1 Super Admin**: Ahmad Supardi (admin@bandung.go.id)
- **9 Admin Daerah** (1 per OPD):
  - user3: Budi Santoso - Dinas Kesehatan (active)
  - user4: Dewi Kartika - Dinas Pendidikan (active)
  - user2: Siti Nurhaliza - Diskominfo (active)
  - user5: Rudi Hartono - DPUPR (active)
  - user6: Linda Kusuma - Dinas Sosial (active)
  - user7: Hendra Wijaya - Dinas Perdagangan (inactive)
  - user8: Maya Sari - Dinas Perindustrian (active)
  - user9: Agus Priyanto - Dinas Kebudayaan (active)
  - user10: Rina Andriani - Dispora (active)

#### 3. Domains (10)
**Status Breakdown:**
- Active: 8 domains
- Inactive: 1 domain (disdag.bandung.go.id - dinonaktifkan dengan sengaja)
- Expired: 1 domain (ppkb.bandung.go.id - kadaluarsa)

**Daftar Domains:**
1. dinkes.bandung.go.id (active)
2. disdik.bandung.go.id (active)
3. diskominfo.bandung.go.id (active)
4. dpupr.bandung.go.id (active)
5. dinsos.bandung.go.id (active)
6. disdag.bandung.go.id (inactive)
7. disperin.bandung.go.id (active)
8. disbudpar.bandung.go.id (active)
9. dispora.bandung.go.id (active)
10. ppkb.bandung.go.id (expired)

#### 4. Applications (14)
**Status Breakdown:**
- Approved: 10 (semua sudah disetujui dan memiliki hosting)
- Pending Approval: 2 (menunggu persetujuan Super Admin)
- Pending Review: 1 (review awal)
- Rejected: 1 (ditolak dengan alasan)

**Approved (10)** - Sudah ada hosting & domain:
1. app1: dinkes.bandung.go.id
2. app2: disdik.bandung.go.id
3. app3: diskominfo.bandung.go.id
4. app4: dpupr.bandung.go.id
5. app5: dinsos.bandung.go.id
6. app6: disdag.bandung.go.id
7. app7: disperin.bandung.go.id
8. app8: disbudpar.bandung.go.id
9. app9: dispora.bandung.go.id
10. app10: ppkb.bandung.go.id

**Pending Approval (2)**:
- app11: vaksinasi.dinkes.bandung.go.id (Dinas Kesehatan)
- app12: ppdb.disdik.bandung.go.id (Dinas Pendidikan)

**Pending Review (1)**:
- app13: smartcity.diskominfo.bandung.go.id (Diskominfo)

**Rejected (1)**:
- app14: bansos.dinsos.bandung.go.id (Dinas Sosial)

#### 5. Hosting Applications (14)
**Status Breakdown:**
- Approved: 10 (semua sudah membuat domain aktif)
- Pending Approval: 2 (menunggu persetujuan Super Admin)
- Pending Review: 1 (review awal)
- Rejected: 1 (ditolak dengan alasan)

**Approved (10)** - Domain sudah dibuat:
1. host1: dinkes.bandung.go.id
2. host2: disdik.bandung.go.id
3. host3: diskominfo.bandung.go.id
4. host4: dpupr.bandung.go.id
5. host5: dinsos.bandung.go.id
6. host6: disdag.bandung.go.id
7. host7: disperin.bandung.go.id
8. host8: disbudpar.bandung.go.id
9. host9: dispora.bandung.go.id
10. host10: ppkb.bandung.go.id

**Pending Approval (2)**:
- host11: vaksinasi.dinkes.bandung.go.id (Dinas Kesehatan)
- host12: ppdb.disdik.bandung.go.id (Dinas Pendidikan)

**Pending Review (1)**:
- host13: smartcity.diskominfo.bandung.go.id (Diskominfo)

**Rejected (1)**:
- host14: bansos.dinsos.bandung.go.id (Dinas Sosial)

## Konsistensi Data

### Workflow Logic
```
Application Submitted → Approved → Hosting Submitted → Hosting Approved → Domain Created (Active)
```

### Korelasi Data
1. **10 Approved Applications** = **10 Approved Hosting** = **10 Domains**
2. Setiap domain memiliki application dan hosting yang sesuai
3. Nama domain sama persis di application, hosting, dan domain
4. Setiap OPD memiliki:
   - 1 admin user
   - 1 domain utama (kecuali yang expired/inactive)
   - 1-2 applications (approved + pending/rejected)
   - 1-2 hosting applications (approved + pending/rejected)

## Statistik Yang Ditampilkan UI

### Dashboard Super Admin
- Total Domain Aktif: 8
- Total Permohonan Pending: 2 (pending_approval) + 1 (pending_review) = 3
- Total Users: 10
- Total OPDs: 10

### Dashboard Admin Daerah
- Total Domain per OPD: 1 (kecuali PPKB yang expired)
- Total Applications per OPD: 1-2
- Total Hosting per OPD: 1-2

### Halaman Manajemen Domain
- Total: 10
- Aktif: 8
- Tidak Aktif: 1
- Kadaluarsa: 1

### Halaman Manajemen Permohonan
- Total: 14
- Approved: 10
- Pending Approval: 2
- Pending Review: 1
- Rejected: 1

### Halaman Manajemen Hosting
- Total: 14
- Approved: 10
- Pending Approval: 2
- Pending Review: 1
- Rejected: 1

### Halaman Manajemen OPD
Per OPD statistics:
- Total Hosting: 1-2
- Total Users: 1
- (Total Domain dan Total Permohonan telah dihapus)

### Halaman Manajemen Users
- Total Users: 10
- Total OPDs: 10

## Perubahan dari Data Sebelumnya

### Before Standardization
- Domains: 15 (tidak konsisten)
- Applications: 10 (tidak match dengan domain)
- Hosting: 8 (tidak match dengan application)
- Banyak mismatch nama domain
- Subdomain bercampur dengan domain utama

### After Standardization
- Domains: 10 (1 per OPD)
- Applications: 14 (10 approved + 4 pending/rejected)
- Hosting: 14 (match dengan applications)
- Semua nama domain konsisten
- Hanya domain utama, subdomain dihapus untuk simplifikasi

## Catatan Penting

1. **Status Domain**:
   - `active`: Domain sedang di-hosting dan berfungsi normal
   - `inactive`: Domain sengaja dinonaktifkan (bukan karena kadaluarsa)
   - `expired`: Domain sudah lewat tanggal kadaluarsa

2. **Workflow**:
   - Domain TIDAK dibuat saat application disetujui
   - Domain baru dibuat saat hosting disetujui
   - Satu application bisa memiliki satu hosting application
   - Satu hosting application approved = satu domain

3. **Mock Data vs Database Real**:
   - Saat database terkoneksi, data real akan menggantikan mock data
   - Mock data hanya digunakan saat database error atau development mode
   - Struktur data mock sama dengan struktur database real

## File Yang Diubah

- `src/backend/utils/mock-data.ts`
  - MOCK_DOMAINS: Dikurangi dari 15 ke 10, dihapus subdomain
  - MOCK_APPLICATIONS: Diubah total jadi 14, disesuaikan nama domain
  - MOCK_HOSTING_APPLICATIONS: Diubah total jadi 14, disesuaikan dengan applications

## Testing Checklist

- [ ] Dashboard Super Admin menampilkan angka yang benar
- [ ] Dashboard Admin Daerah menampilkan data OPD yang sesuai
- [ ] Halaman Domain menampilkan 10 domain
- [ ] Halaman Applications menampilkan 14 permohonan
- [ ] Halaman Hosting menampilkan 14 permohonan hosting
- [ ] Halaman OPD menampilkan 10 OPD dengan statistik yang benar
- [ ] Halaman Users menampilkan 10 users
- [ ] Angka di semua halaman konsisten dan match

## Commit Information

**Commit Hash**: f34ed20  
**Branch**: chaca  
**Commit Message**: "feat: Standardize mock data for consistency across all UI pages"
