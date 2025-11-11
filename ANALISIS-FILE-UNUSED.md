# 🔍 Analisis File yang Tidak Digunakan / Tidak Sesuai

**Tanggal:** November 11, 2025  
**Branch:** chaca  
**Status:** Perlu Dibersihkan

---

## 📋 Ringkasan Eksekutif

Ditemukan **beberapa kategori file** yang tidak sesuai atau tidak digunakan dalam proyek Domain Manager:

### Kategori Utama:

1. **File Duplikat Dashboard** - 3 file
2. **Mock Data Legacy** - 1 file (masih digunakan tapi perlu migrasi)
3. **File Testing yang Tidak Lengkap** - 2 file
4. **File Types Duplikat** - Beberapa definisi interface yang tumpang tindih
5. **File Services Legacy** - 1 file (masih digunakan tapi perlu refactor)

---

## ❌ File yang Harus Dihapus

### 1. 🗂️ **Dashboard Components - DUPLIKAT**

#### File 1: `src/components/dashboard/super-admin-dashboard.tsx` ❌

**Status:** DUPLIKAT - Tidak Digunakan  
**Alasan:**

- Versi lama yang menggunakan MOCK_DATA langsung
- Sudah digantikan oleh versi baru di `src/frontend/components/features/super-admin/dashboard/super-admin-dashboard.tsx`
- Tidak ada import yang merujuk ke file ini

**Bukti Tidak Digunakan:**

```bash
# Tidak ada import yang merujuk ke path ini
grep -r "from '@/components/dashboard/super-admin-dashboard'" src/
# Result: No matches
```

**Rekomendasi:** ✅ **HAPUS**

---

#### File 2: `src/frontend/components/dashboard/kabid-dashboard.tsx` ❌

**Status:** DUPLIKAT - Tidak Digunakan  
**Lokasi:** `d:\Proyek fix\domain-manager-master\src\frontend\components\dashboard\kabid-dashboard.tsx`

**Alasan:**

- File ini adalah versi lama (171 baris)
- Menggunakan MOCK_DATA langsung dari `@/backend/utils/mock-data`
- Sudah digantikan oleh versi baru di `src/frontend/components/features/dashboard/kabid-dashboard.tsx` (301 baris)
- Versi baru menggunakan API fetch dengan `useEffect`

**Perbedaan:**
| Aspek | Versi Lama (❌) | Versi Baru (✅) |
|-------|----------------|----------------|
| Lokasi | `src/frontend/components/dashboard/` | `src/frontend/components/features/dashboard/` |
| Data Source | MOCK_DATA langsung | API fetch dengan useState/useEffect |
| Ukuran | 171 baris | 301 baris |
| Loading State | Tidak ada | Ada (Loader2) |
| Error Handling | Tidak ada | Ada (try-catch) |

**Rekomendasi:** ✅ **HAPUS**

---

#### File 3: `src/frontend/components/features/dashboard/super-admin-dashboard.tsx` ⚠️

**Status:** DUPLIKAT - Masih Digunakan  
**Lokasi:** `d:\Proyek fix\domain-manager-master\src\frontend\components\features\dashboard\super-admin-dashboard.tsx`

**Alasan:**

- Ini adalah versi **LAMA** yang masih menggunakan MOCK_DATA
- Sudah ada versi **BARU** di `src/frontend/components/features/super-admin/dashboard/super-admin-dashboard.tsx` yang menggunakan API fetch
- File ini masih diimport oleh beberapa file legacy

**Digunakan oleh:**

```tsx
// File yang masih menggunakan versi lama:
- src/frontend/components/features/dashboard/kabid-dashboard.tsx (line 23)
  import { SuperAdminApplicationsTable } from "@/components/features/dashboard/super-admin-applications-table";
```

**Rekomendasi:** ⚠️ **HAPUS SETELAH MIGRASI IMPORT**

1. Update import di `kabid-dashboard.tsx` (tapi file ini juga akan dihapus)
2. Pastikan tidak ada file lain yang menggunakan
3. Hapus file ini dan file pendukungnya: `super-admin-applications-table.tsx`

---

#### File 4: `src/frontend/components/features/dashboard/super-admin-applications-table.tsx` ⚠️

**Status:** DUPLIKAT - Masih Digunakan  
**Alasan:**

- Versi lama dari table component
- Sudah ada versi baru di `src/frontend/components/features/super-admin/dashboard/super-admin-applications-table.tsx`

**Rekomendasi:** ⚠️ **HAPUS SETELAH MIGRASI**

---

#### File 5: `src/frontend/components/features/dashboard/kabid-dashboard.tsx` ⚠️

**Status:** BELUM JELAS - Perlu Dicek  
**Lokasi:** `d:\Proyek fix\domain-manager-master\src\frontend\components\features\dashboard\kabid-dashboard.tsx`

**Alasan:**

- File ini adalah versi **BARU** (301 baris) dengan API fetch
- Tapi **BELUM ADA** yang menggunakannya (tidak ada page yang mengimport)
- Kemungkinan untuk role "Kepala Bidang" yang belum diimplementasikan

**Tidak Digunakan oleh page manapun:**

```bash
grep -r "KabidDashboard" src/app/
# Result: No matches
```

**Opsi:**

1. **Simpan** - Jika role "Kepala Bidang" akan diimplementasikan
2. **Hapus** - Jika role "Kepala Bidang" tidak akan digunakan

**Rekomendasi:** ⏸️ **SIMPAN SEMENTARA** (untuk role Kepala Bidang di masa depan)

---

### 2. 📚 **Mock Data & Services - LEGACY**

#### File 6: `src/lib/mock-data.ts` ⚠️

**Status:** LEGACY - Masih Sangat Digunakan  
**Lokasi:** `d:\Proyek fix\domain-manager-master\src\lib\mock-data.ts`

**Alasan Masalah:**

- File ini adalah data **DUMMY** untuk development
- Banyak component **masih** menggunakan ini langsung
- Seharusnya semua component menggunakan **API** bukan mock data langsung

**Digunakan oleh (contoh):**

```tsx
- src/app/(app)/super-admin/roles/page.tsx (line 10)
- src/app/(app)/profile/page.tsx (line 13)
- src/frontend/components/dashboard/kabid-dashboard.tsx (line 13)
- src/lib/firebase/services.ts (banyak fungsi)
```

**Rekomendasi:** ⚠️ **JANGAN HAPUS** - Masih dibutuhkan untuk:

1. Development mode (saat database tidak tersedia)
2. Unit testing
3. Seeding database awal

**Action Required:**

- ✅ Tetap simpan sebagai fallback
- ⚠️ Pastikan production menggunakan database asli
- 📝 Tambahkan warning log jika mock data digunakan di production

---

#### File 7: `src/lib/firebase/services.ts` ⚠️

**Status:** LEGACY - Masih Digunakan tapi Menyesatkan  
**Lokasi:** `d:\Proyek fix\domain-manager-master\src\lib\firebase\services.ts`

**Alasan Masalah:**

- Nama file: `firebase/services.ts` tapi **TIDAK menggunakan Firebase**
- Semua fungsi hanya manipulasi `MOCK_DATA` di memori
- Nama menyesatkan karena suggest menggunakan Firebase

**Contoh Fungsi:**

```typescript
export const getApplications = async (): Promise<SubdomainApplication[]> => {
  return Promise.resolve(MOCK_APPLICATIONS); // Hanya return mock data
};

export const getDomains = async (): Promise<Domain[]> => {
  return Promise.resolve(MOCK_DOMAINS); // Hanya return mock data
};
```

**Rekomendasi:** ⚠️ **REFACTOR** - Jangan Hapus

1. Rename folder: `src/lib/firebase/` → `src/lib/mock-services/`
2. Rename file: `services.ts` → `mock.service.ts`
3. Update semua import path
4. Tambahkan dokumentasi bahwa ini adalah mock service

**Alternative:** Pindahkan ke `src/backend/services/mock.service.ts`

---

### 3. 🧪 **Testing Files - TIDAK LENGKAP**

#### File 8: `src/app/page.test.tsx` ⚠️

**Status:** INCOMPLETE - Testing Tidak Lengkap  
**Lokasi:** `d:\Proyek fix\domain-manager-master\src\app\page.test.tsx`

**Alasan:**

- Hanya ada **1 test file** untuk seluruh aplikasi
- Test hanya untuk landing page saja
- Tidak ada test untuk:
  - Dashboard components
  - API routes
  - Services
  - Utilities

**Isi File:**

```tsx
describe("Page", () => {
  it("renders a heading", () => {
    render(<Page />);
    const heading = screen.getByRole("heading", {
      level: 1,
      name: /Domain Manager/i,
    });
    expect(heading).toBeInTheDocument();
  });
});
```

**Rekomendasi:** 📝 **TAMBAHKAN TESTS** atau **HAPUS**

- **Opsi 1:** Hapus jika tidak ada rencana testing
- **Opsi 2:** Tambahkan tests untuk semua critical components
- **Opsi 3:** Setup CI/CD dengan testing coverage minimum

---

#### File 9: `jest.config.ts` & `jest.setup.ts` ⚠️

**Status:** KONFIGURASI TIDAK DIGUNAKAN  
**Lokasi:**

- `d:\Proyek fix\domain-manager-master\jest.config.ts`
- `d:\Proyek fix\domain-manager-master\jest.setup.ts`

**Alasan:**

- Jest sudah dikonfigurasi
- Tapi **tidak ada test script** di `package.json`
- Tidak ada automated testing

**Check package.json:**

```json
{
  "scripts": {
    "dev": "next dev --turbopack -p 9002",
    "build": "next build",
    "start": "next start"
    // ❌ TIDAK ADA: "test": "jest"
    // ❌ TIDAK ADA: "test:watch": "jest --watch"
  }
}
```

**Rekomendasi:**

- **Opsi 1:** ⚠️ Simpan dan tambahkan test scripts
- **Opsi 2:** ❌ Hapus jika tidak akan testing

---

### 4. 🔤 **Type Definitions - DUPLIKAT**

#### File 10: `src/backend/database/types.ts` ⚠️

**Status:** DUPLIKAT PARTIAL  
**Lokasi:** `d:\Proyek fix\domain-manager-master\src\backend\database\types.ts`

**Alasan:**

- Ada beberapa type yang **duplikat** dengan `src/backend/models/types.ts`
- Contoh duplikat:
  - `DomainStatus`
  - `ApplicationStatus`
  - Interface `Domain`, `Application`, `AuditLog`

**Contoh Duplikat:**

**File A:** `src/backend/models/types.ts`

```typescript
export type DomainStatus = 'active' | 'inactive' | 'expired' | 'pending';
export interface Domain extends DatabaseRow { ... }
```

**File B:** `src/backend/database/repositories/domain.repository.ts`

```typescript
export type DomainStatus = 'active' | 'inactive' | 'expired' | 'pending';
export interface Domain { ... }
```

**File C:** `src/backend/database/services/domain.service.ts`

```typescript
export interface DomainRow { ... }
```

**Rekomendasi:** 🔄 **CONSOLIDATE TYPES**

1. Gunakan **HANYA** `src/backend/models/types.ts` sebagai **single source of truth**
2. Hapus definisi duplikat di files lain
3. Import dari `@/backend/models/types` di semua file

---

### 5. 📄 **Dokumentasi - REDUNDANT**

#### File 11-13: `struktur.txt`, `struktur-direktori-baru.txt`, `typecheck-output.txt` ⚠️

**Status:** TEMPORARY FILES  
**Lokasi:** Root directory

**Alasan:**

- File output temporary dari commands
- Tidak diperlukan di repository
- Bisa di-generate kapan saja

**Rekomendasi:** ✅ **HAPUS & ADD TO .gitignore**

```gitignore
# Add to .gitignore:
struktur.txt
struktur-direktori-baru.txt
typecheck-output.txt
*.log
```

---

## 🔄 File yang Perlu REFACTOR (bukan dihapus)

### 1. `src/backend/utils/mock-data.ts` ✅

**Action:** Rename menjadi `mock-data.service.ts`  
**Reason:** Lebih jelas bahwa ini adalah service layer

### 2. `src/lib/firebase/services.ts` ⚠️

**Action:**

- Rename folder: `src/lib/firebase/` → `src/backend/services/mock/`
- Rename file: `services.ts` → `index.ts`
- Update imports di semua file

### 3. `src/backend/services/index.ts` ✅

**Status:** GOOD - Sudah benar  
**Reason:** Sudah menggunakan fallback ke mock data dengan try-catch

---

## 📊 Summary & Action Plan

### Total Files Ditemukan: 13 files

| Status                   | Count | Action                                       |
| ------------------------ | ----- | -------------------------------------------- |
| ❌ Hapus Langsung        | 2     | Dashboard duplicates (components/dashboard/) |
| ⚠️ Hapus Setelah Migrasi | 3     | Dashboard features/dashboard/ old versions   |
| ⏸️ Simpan Sementara      | 1     | kabid-dashboard.tsx (untuk future role)      |
| 🔄 Refactor              | 2     | firebase/services.ts, mock-data.ts           |
| 📝 Add Tests or Remove   | 3     | jest configs + page.test.tsx                 |
| 🗑️ Temporary Files       | 3     | struktur.txt files                           |
| ✅ Keep (dengan warning) | 1     | mock-data.ts (development dependency)        |

---

## 🎯 Langkah-Langkah Pembersihan

### Phase 1: Hapus File Duplikat yang Jelas ❌ (PRIORITY HIGH)

```bash
# 1. Hapus dashboard components lama
rm src/components/dashboard/super-admin-dashboard.tsx
rm src/frontend/components/dashboard/kabid-dashboard.tsx

# 2. Hapus temporary text files
rm struktur.txt
rm struktur-direktori-baru.txt
rm typecheck-output.txt

# 3. Update .gitignore
echo "struktur*.txt" >> .gitignore
echo "typecheck-output.txt" >> .gitignore
```

### Phase 2: Migrasi Dashboard Components ⚠️ (PRIORITY HIGH)

```bash
# 1. Hapus old dashboard di features/dashboard/
rm -rf src/frontend/components/features/dashboard/

# 2. Pastikan semua imports sudah update ke:
# @/components/features/super-admin/dashboard/
# @/components/features/admin-daerah/dashboard/
```

### Phase 3: Consolidate Types 🔄 (PRIORITY MEDIUM)

```bash
# 1. Review dan merge duplicate types ke src/backend/models/types.ts
# 2. Update imports di semua files:
#    - src/backend/database/repositories/*.ts
#    - src/backend/database/services/*.ts
# 3. Hapus redundant type definitions
```

### Phase 4: Refactor Services 🔄 (PRIORITY LOW)

```bash
# 1. Rename folder structure:
mv src/lib/firebase src/backend/services/mock

# 2. Update tsconfig.json path aliases
# 3. Update all imports from @/lib/firebase/* to @/backend/services/mock/*
```

### Phase 5: Testing Decision 📝 (PRIORITY LOW)

**Pilih salah satu:**

- **Opsi A:** Setup proper testing (recommended)

  ```bash
  npm install --save-dev @testing-library/react @testing-library/jest-dom
  # Add test scripts to package.json
  # Write tests for critical components
  ```

- **Opsi B:** Remove testing setup
  ```bash
  rm jest.config.ts
  rm jest.setup.ts
  rm src/app/page.test.tsx
  npm uninstall jest @testing-library/react @testing-library/jest-dom
  ```

---

## ⚠️ PERINGATAN

### ❌ JANGAN Hapus File Ini:

1. ✅ `src/backend/utils/mock-data.ts` - Masih dibutuhkan untuk development
2. ✅ `src/backend/services/index.ts` - Main service layer dengan fallback
3. ✅ `src/frontend/components/features/super-admin/dashboard/*` - Versi BARU yang digunakan
4. ✅ `src/frontend/components/features/admin-daerah/dashboard/*` - Versi BARU yang digunakan
5. ✅ `src/backend/models/types.ts` - Single source of truth untuk types

### ✅ AMAN untuk Hapus:

1. ❌ `src/components/dashboard/super-admin-dashboard.tsx`
2. ❌ `src/frontend/components/dashboard/kabid-dashboard.tsx`
3. ❌ `struktur.txt` (temporary)
4. ❌ `struktur-direktori-baru.txt` (temporary)
5. ❌ `typecheck-output.txt` (temporary)

---

## 📝 Checklist Eksekusi

### Immediate Actions (Bisa dilakukan sekarang):

- [ ] Hapus `src/components/dashboard/` folder
- [ ] Hapus `src/frontend/components/dashboard/` folder
- [ ] Hapus `struktur*.txt` files
- [ ] Hapus `typecheck-output.txt`
- [ ] Update `.gitignore`

### Requires Testing (Perlu test dulu):

- [ ] Hapus `src/frontend/components/features/dashboard/` (after confirming no usage)
- [ ] Verify all dashboard imports point to new structure
- [ ] Test dashboard functionality

### Requires Discussion:

- [ ] Decision on Jest setup (keep or remove)
- [ ] Decision on `kabid-dashboard.tsx` (keep for future role or remove)
- [ ] Plan for consolidating types

### Long-term Refactoring:

- [ ] Rename `src/lib/firebase/` to `src/backend/services/mock/`
- [ ] Consolidate all type definitions to `src/backend/models/types.ts`
- [ ] Add proper testing or remove test configs

---

**Generated:** November 11, 2025  
**Analyst:** AI Assistant  
**Status:** Ready for Review & Execution
