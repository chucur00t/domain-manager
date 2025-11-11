# Struktur Komponen - Domain Manager

## 📁 Struktur File yang Terstruktur

Struktur ini memisahkan komponen berdasarkan **role** untuk memudahkan maintenance dan development.

### **Lokasi Komponen:**

```
src/frontend/components/features/
├── super-admin/              # Komponen khusus Super Admin
│   ├── dashboard/
│   │   ├── super-admin-dashboard.tsx
│   │   ├── super-admin-applications-table.tsx
│   │   └── index.ts
│   ├── domains/              # (Future)
│   ├── applications/         # (Future)
│   └── users/               # (Future)
│
└── admin-daerah/            # Komponen khusus Admin Daerah
    ├── dashboard/
    │   ├── admin-daerah-dashboard.tsx
    │   └── index.ts
    ├── domains/             # (Future)
    ├── applications/        # (Future)
    └── hosting/            # (Future)
```

## 🎯 Konvensi Penamaan

### **Super Admin Components:**
- Prefix: `super-admin-` atau dalam folder `super-admin/`
- Contoh: 
  - `super-admin-dashboard.tsx`
  - `super-admin-applications-table.tsx`
  - `super-admin-users-table.tsx`

### **Admin Daerah Components:**
- Prefix: `admin-daerah-` atau dalam folder `admin-daerah/`
- Contoh:
  - `admin-daerah-dashboard.tsx`
  - `admin-daerah-domains-table.tsx`
  - `admin-daerah-applications-table.tsx`

### **Shared Components:**
- Lokasi: `src/frontend/components/shared/`
- Contoh:
  - `stat-card.tsx`
  - `data-table.tsx`
  - `loading-spinner.tsx`

## 📦 Import Pattern

### **Menggunakan Index Files:**

```typescript
// ✅ GOOD - Import dari index
import { SuperAdminDashboard } from '@/components/features/super-admin/dashboard';
import { AdminDaerahDashboard } from '@/components/features/admin-daerah/dashboard';

// ❌ BAD - Import langsung dari file
import { SuperAdminDashboard } from '@/components/features/super-admin/dashboard/super-admin-dashboard';
```

### **Path Aliases yang Tersedia:**

```typescript
'@/components/*'          → 'src/frontend/components/*'
'@/backend/*'             → 'src/backend/*'
'@/lib/*'                 → 'src/lib/*'
```

## 🔄 Migration dari Struktur Lama

### **File yang Sudah Dipindahkan:**

| File Lama | File Baru |
|-----------|-----------|
| `src/frontend/components/dashboard/kabid-dashboard.tsx` | `src/frontend/components/features/super-admin/dashboard/super-admin-dashboard.tsx` |
| `src/frontend/components/features/dashboard/super-admin-dashboard.tsx` | `src/frontend/components/features/super-admin/dashboard/super-admin-dashboard.tsx` |
| `src/frontend/components/features/dashboard/super-admin-applications-table.tsx` | `src/frontend/components/features/super-admin/dashboard/super-admin-applications-table.tsx` |

### **File yang Perlu Update Import:**

1. ✅ `src/app/(app)/super-admin/dashboard/page.tsx` - Already updated
2. ⏳ `src/app/(app)/dashboard/page.tsx` - Need to integrate AdminDaerahDashboard
3. ⏳ Other files importing old dashboard components

## 🚀 Cara Menambah Komponen Baru

### **Untuk Super Admin:**

```bash
# 1. Buat file di folder super-admin
src/frontend/components/features/super-admin/[feature-name]/super-admin-[component-name].tsx

# 2. Export di index.ts
export { SuperAdmin[ComponentName] } from './super-admin-[component-name]';

# 3. Import di page
import { SuperAdmin[ComponentName] } from '@/components/features/super-admin/[feature-name]';
```

### **Untuk Admin Daerah:**

```bash
# 1. Buat file di folder admin-daerah
src/frontend/components/features/admin-daerah/[feature-name]/admin-daerah-[component-name].tsx

# 2. Export di index.ts
export { AdminDaerah[ComponentName] } from './admin-daerah-[component-name]';

# 3. Import di page
import { AdminDaerah[ComponentName] } from '@/components/features/admin-daerah/[feature-name]';
```

## ✅ Keuntungan Struktur Baru

1. **Jelas dan Terpisah:** Setiap role memiliki folder sendiri
2. **Mudah Maintenance:** Tidak perlu mencari file berdasarkan nama yang ambigu
3. **Scalable:** Mudah menambah fitur baru per role
4. **Type-Safe:** Import yang jelas mengurangi error
5. **Collaboration:** Tim bisa bekerja parallel tanpa conflict

## 📝 TODO

- [ ] Migrate components dari `src/frontend/components/features/applications/`
- [ ] Migrate components dari `src/frontend/components/features/domains/`
- [ ] Migrate components dari `src/frontend/components/features/hosting/`
- [ ] Migrate components dari `src/frontend/components/features/users/`
- [ ] Update semua import di seluruh aplikasi
- [ ] Hapus folder lama setelah migration selesai
- [ ] Update dokumentasi API

## 🎨 Component Examples

### **Super Admin Dashboard:**
```typescript
<SuperAdminDashboard role="Super Admin" />
```

### **Admin Daerah Dashboard:**
```typescript
<AdminDaerahDashboard 
  applications={applications}
  domains={domains}
  userOpd="Dinas Kesehatan"
/>
```

---

**Last Updated:** November 11, 2025  
**Maintained by:** Development Team
