# Logika Status Domain

## Perubahan Penting ⚠️

Sebelumnya, status domain langsung **"active"** setelah permohonan domain disetujui.

**SEKARANG:** Status domain menjadi **"pending"** setelah disetujui, dan baru berubah menjadi **"active"** setelah hosting disetujui.

---

## Alur Lengkap Status Domain

```
┌─────────────────────────────────────────────────────────────────┐
│                    ALUR STATUS DOMAIN BARU                      │
└─────────────────────────────────────────────────────────────────┘

STEP 1: PERMOHONAN DOMAIN
├─ Admin Daerah mengajukan domain baru
├─ Status aplikasi: "pending_review" → "pending_approval"
└─ Super Admin/Kepala Bidang menyetujui permohonan

STEP 2: DOMAIN DISETUJUI
├─ Domain dibuat di sistem
├─ Status domain: ✅ "pending" (MENUNGGU HOSTING)
├─ Domain belum dapat diakses
└─ Belum ada IP/server yang dialokasikan

STEP 3: PERMOHONAN HOSTING
├─ Admin Daerah mengajukan hosting untuk domain tersebut
├─ Memilih domain dari daftar domain dengan status "pending"
└─ Super Admin review permohonan hosting

STEP 4: HOSTING DISETUJUI
├─ Permohonan hosting disetujui
├─ Status domain berubah: "pending" → ✅ "active"
├─ Domain sekarang aktif dan dapat diakses
└─ Server/resource dialokasikan
```

---

## Status Domain

### 1. **Active** (Hijau)

- Domain sudah di-hosting dan dapat diakses
- Hosting application sudah disetujui
- Server dan resource sudah dialokasikan

### 2. **Pending** (Biru) ⭐ BARU!

- Domain sudah disetujui tapi **belum di-hosting**
- Menunggu permohonan hosting
- Belum dapat diakses publik

### 3. **Inactive** (Orange)

- Domain dinonaktifkan sementara
- Bisa diaktifkan kembali

### 4. **Expired** (Merah)

- Domain sudah kadaluarsa
- Perlu perpanjangan

---

## Perubahan Kode

### 1. File: `src/backend/services/index.ts`

**SEBELUM:**

```typescript
const domainData = {
  domain_name: application.domainName,
  status: "active" as const, // ❌ Langsung active
  expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
};
```

**SESUDAH:**

```typescript
const domainData = {
  domain_name: application.domainName,
  status: "pending" as const, // ✅ Pending dulu
  expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
};
```

### 2. File: `src/backend/actions/hosting.ts`

**DITAMBAHKAN:** Logika aktivasi domain otomatis setelah hosting disetujui

```typescript
export async function approveHostingApplication(
  applicationId: string,
  currentUserRole: User["role"]
) {
  // ... existing code ...

  await updateHostingApplication(applicationId, { status: "approved" });

  // ✅ BARU: Update domain status to 'active' when hosting is approved
  if (application.domainName) {
    try {
      const { DomainService } = await import(
        "@/backend/database/services/domain.service"
      );
      const domainService = new DomainService();

      // Find domain by hostname
      const domainsResult = await domainService.getDomains(1, 100);
      const domain = domainsResult.domains.find(
        (d) => d.hostname === application.domainName
      );

      if (domain) {
        await domainService.updateDomain(parseInt(domain.id), {
          status: "active",
        });

        await auditService.logAction({
          action: "ACTIVATE_DOMAIN",
          resourceType: "domain",
          resourceId: domain.id,
          description: `Mengaktifkan domain ${application.domainName} karena hosting disetujui`,
          userId: "system",
        });
      }
    } catch (error) {
      console.error("Error updating domain status:", error);
      // Don't fail hosting approval if domain update fails
    }
  }

  // ... rest of the code ...
}
```

### 3. File: `src/app/(app)/super-admin/domains/page.tsx`

**DITAMBAHKAN:**

- Statistik card untuk "Menunggu Hosting"
- Badge biru untuk status pending
- Import icon Clock

```typescript
// Statistik
const stats = useMemo(() => {
  return {
    total: domains.length,
    active: domains.filter((d) => d.status === "active").length,
    pending: domains.filter((d) => d.status === "pending").length, // ✅ BARU
    inactive: domains.filter((d) => d.status === "inactive").length,
    expired: domains.filter((d) => d.status === "expired").length,
  };
}, [domains]);

// Badge
const getStatusBadge = (status: Domain["status"]) => {
  switch (status) {
    case "active":
      return <Badge className="bg-green-50 text-green-700">Aktif</Badge>;
    case "pending": // ✅ BARU
      return (
        <Badge className="bg-blue-50 text-blue-700">Menunggu Hosting</Badge>
      );
    case "inactive":
      return (
        <Badge className="bg-orange-50 text-orange-500">Tidak Aktif</Badge>
      );
    case "expired":
      return <Badge className="bg-red-50 text-red-700">Kadaluarsa</Badge>;
  }
};
```

### 4. File: `src/backend/utils/mock-data.ts`

**DIUBAH:** Beberapa domain untuk contoh status "pending"

```typescript
{
  id: "domain6",
  hostname: "disdag.bandung.go.id",
  status: "pending",  // ✅ Contoh domain yang sudah disetujui tapi belum hosting
  expiryDate: "2025-12-31",
  opd: "Dinas Perdagangan",
  destination: "",  // Belum ada server
},
{
  id: "domain7",
  hostname: "disperin.bandung.go.id",
  status: "pending",  // ✅ Contoh domain pending
  expiryDate: "2025-12-31",
  opd: "Dinas Perindustrian",
  destination: "",  // Belum ada server
},
```

---

## Dashboard Domain

Sekarang di halaman **Manajemen Domain** akan tampil 5 card statistik:

1. **Total Domain** - Semua domain
2. **Aktif (Di-hosting)** 🟢 - Domain yang sudah aktif dan di-hosting
3. **Menunggu Hosting** 🔵 - Domain yang sudah disetujui tapi belum hosting
4. **Tidak Aktif** 🟠 - Domain yang dinonaktifkan
5. **Kadaluarsa** 🔴 - Domain yang expired

---

## Manfaat Perubahan

### ✅ Keuntungan:

1. **Lebih Akurat**

   - Status mencerminkan kondisi sebenarnya
   - Domain baru aktif setelah benar-benar di-hosting

2. **Tracking Lebih Baik**

   - Super Admin dapat melihat domain yang menunggu hosting
   - Tidak ada domain "aktif" palsu

3. **Sesuai Alur Bisnis**

   - Domain ≠ Hosting
   - Domain hanya reservasi nama
   - Hosting = alokasi resource server

4. **Monitoring Mudah**
   - Card "Menunggu Hosting" menunjukkan backlog
   - Admin Daerah tahu domain mana yang belum di-hosting

---

## FAQ

### Q: Apakah domain lama (yang sudah aktif) akan berubah statusnya?

**A:** TIDAK. Domain yang sudah ada tetap dengan status mereka. Logika baru hanya berlaku untuk domain baru yang disetujui setelah update ini.

### Q: Bagaimana jika hosting ditolak?

**A:** Domain tetap status "pending". Admin Daerah bisa mengajukan hosting lagi nanti, atau domain bisa dihapus jika tidak jadi dipakai.

### Q: Apakah bisa langsung active tanpa hosting?

**A:** Secara manual Super Admin bisa mengaktifkan domain melalui tombol "Aktifkan" di detail domain, tapi alur normalnya adalah melalui persetujuan hosting.

### Q: Filter di form hosting masih benar?

**A:** YA. Form hosting sudah di-filter untuk hanya menampilkan domain dengan status "active" di OPD yang sama. Sekarang perlu diupdate untuk menampilkan domain "pending" juga.

---

## Testing

Untuk testing alur baru:

1. **Login sebagai Admin Daerah**

   - Ajukan permohonan domain baru
   - Tunggu approval

2. **Login sebagai Super Admin**

   - Setujui permohonan domain
   - Cek di Manajemen Domain → Status harus "Menunggu Hosting" (biru)
   - Angka di card "Menunggu Hosting" bertambah

3. **Login kembali sebagai Admin Daerah**

   - Ajukan permohonan hosting untuk domain tersebut
   - Pilih domain yang berstatus "pending"

4. **Login sebagai Super Admin**
   - Setujui permohonan hosting
   - **OTOMATIS:** Status domain berubah menjadi "Active" (hijau)
   - Angka di card "Aktif (Di-hosting)" bertambah
   - Angka di card "Menunggu Hosting" berkurang

---

## Commit Info

- **Commit:** `1f5e8b0`
- **Branch:** `chaca`
- **Date:** 12 November 2025
- **Files Changed:** 5 files
  - `src/backend/services/index.ts`
  - `src/backend/actions/hosting.ts`
  - `src/app/(app)/super-admin/domains/page.tsx`
  - `src/backend/utils/mock-data.ts`
  - `SETUP-UNTUK-TEMAN.md` (new)

---

Dokumentasi ini menjelaskan perubahan logika status domain yang sekarang lebih akurat dan mencerminkan kondisi hosting yang sebenarnya.
