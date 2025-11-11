# 📁 Struktur Direktori - Domain Manager

**Branch:** chaca  
**Last Updated:** November 11, 2025  
**Status:** ✅ Restructured with Role-Based Components

---

## 🗂️ Root Structure

```
domain-manager-master/
├── 📄 Configuration Files
│   ├── package.json              # Dependencies & scripts
│   ├── tsconfig.json             # TypeScript configuration
│   ├── next.config.ts            # Next.js configuration
│   ├── tailwind.config.ts        # Tailwind CSS configuration
│   ├── docker-compose.yml        # Docker setup
│   ├── Dockerfile                # Docker image
│   └── firestore.rules           # Firebase rules
│
├── 📚 Documentation
│   ├── README.md                 # Main documentation
│   ├── ARCHITECTURE.md           # System architecture
│   ├── DNS-INTEGRATION-COMPLETE.md  # DNS feature docs
│   └── docs/                     # Detailed documentation
│       ├── DEPLOYMENT-GUIDE.md
│       ├── DNS-INTEGRATION-GUIDE.md
│       ├── DNS-IMPLEMENTATION-SUMMARY.md
│       ├── HANDOVER-CHECKLIST.md
│       └── QUICK-DEPLOYMENT.md
│
├── 🔧 Scripts
│   ├── scripts/
│   │   └── migrate-database.sh
│   └── init-database.ps1
│
└── 💻 Source Code (src/)
```

---

## 📂 Source Code Structure (src/)

### **1. Frontend - React Components**

```
src/frontend/
│
├── components/
│   │
│   ├── 🎨 UI Components (Shared)
│   │   ├── ui/                          # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── table.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── input.tsx
│   │   │   ├── select.tsx
│   │   │   ├── textarea.tsx
│   │   │   ├── calendar.tsx
│   │   │   ├── popover.tsx
│   │   │   ├── chart.tsx
│   │   │   └── ... (30+ UI components)
│   │   │
│   │   └── shared/                      # Shared business components
│   │       ├── stat-card.tsx
│   │       ├── data-table.tsx
│   │       └── ...
│   │
│   ├── 👤 Super Admin Components
│   │   └── features/super-admin/
│   │       └── dashboard/
│   │           ├── super-admin-dashboard.tsx           ✨ NEW
│   │           ├── super-admin-applications-table.tsx  ✨ NEW
│   │           └── index.ts                            ✨ NEW
│   │
│   ├── 🏛️ Admin Daerah Components
│   │   └── features/admin-daerah/
│   │       └── dashboard/
│   │           ├── admin-daerah-dashboard.tsx          ✨ NEW
│   │           └── index.ts                            ✨ NEW
│   │
│   ├── 🔀 Legacy/Mixed Components (To be migrated)
│   │   └── features/
│   │       ├── applications/
│   │       │   ├── applications-table.tsx
│   │       │   ├── application-form.tsx
│   │       │   └── application-detail.tsx
│   │       │
│   │       ├── domains/
│   │       │   ├── domains-table.tsx
│   │       │   ├── domain-form.tsx
│   │       │   └── domain-detail.tsx
│   │       │
│   │       ├── hosting/
│   │       │   ├── hosting-table.tsx
│   │       │   └── hosting-form.tsx
│   │       │
│   │       ├── users/
│   │       │   ├── users-table.tsx
│   │       │   └── user-form.tsx
│   │       │
│   │       ├── audit/
│   │       │   └── audit-trail-table.tsx
│   │       │
│   │       ├── auth/
│   │       │   └── login-form.tsx
│   │       │
│   │       ├── registration/
│   │       │   ├── subdomain-form.tsx
│   │       │   └── hosting-form.tsx
│   │       │
│   │       └── README.md                               ✨ NEW - Structure docs
│   │
│   ├── 🎯 Layout Components
│   │   └── layout/
│   │       ├── main-nav.tsx          # Sidebar navigation
│   │       ├── top-bar.tsx
│   │       └── footer.tsx
│   │
│   ├── ⚙️ Settings Components
│   │   └── settings/
│   │       ├── profile-settings.tsx
│   │       ├── security-settings.tsx
│   │       └── preferences-settings.tsx
│   │
│   └── 🎨 Misc Components
│       ├── logo.tsx
│       ├── theme-provider.tsx
│       └── login-logger.tsx
│
├── config/
│   └── help.ts                      # Help/documentation config
│
├── hooks/
│   ├── use-auth.ts
│   ├── use-role.ts
│   └── ...
│
├── styles/
│   └── globals.css
│
└── utils/
    └── utils.ts                     # Utility functions
```

### **2. Backend - Server Logic**

```
src/backend/
│
├── 📊 Database Layer
│   └── database/
│       ├── config.ts                # Database configuration
│       ├── utils.ts                 # Database utilities
│       ├── types.ts                 # Database types
│       ├── helpers.ts               # Helper functions
│       │
│       ├── services/                # Data access layer
│       │   ├── user.service.ts
│       │   ├── application.service.ts
│       │   ├── domain.service.ts
│       │   ├── hosting.service.ts
│       │   └── audit-log.service.ts
│       │
│       ├── repositories/            # Repository pattern
│       │   └── ...
│       │
│       ├── migrations/              # Database migrations
│       │   └── ...
│       │
│       ├── seeders/                 # Database seeders
│       │   └── ...
│       │
│       └── scripts/                 # Database scripts
│           ├── schema.sql
│           └── schema-tables-only.sql
│
├── 🎬 Actions Layer
│   └── actions/
│       ├── applications.ts          # Application actions
│       ├── domains.ts               # Domain actions
│       ├── hosting.ts               # Hosting actions
│       ├── users.ts                 # User actions
│       └── registration.ts          # Registration actions
│
├── 🌐 API Routes
│   └── api/
│       ├── applications/
│       │   └── route.ts
│       ├── audit-logs/
│       │   └── route.ts
│       ├── auth/
│       │   └── route.ts
│       ├── dashboard/
│       │   └── route.ts
│       ├── dns/
│       │   └── route.ts             ✨ NEW - DNS API
│       ├── domains/
│       │   └── route.ts
│       ├── hosting-applications/
│       │   └── route.ts
│       ├── upload/
│       │   └── route.ts
│       └── users/
│           └── route.ts
│
├── 🔧 Services Layer
│   └── services/
│       ├── index.ts                 # Main services export
│       ├── audit.service.ts
│       ├── email.service.ts
│       ├── domain-expiry.service.ts
│       ├── password-reset.service.ts
│       │
│       ├── dns/                     ✨ NEW - DNS Integration
│       │   ├── dns-provider.interface.ts
│       │   ├── cloudflare-provider.ts
│       │   ├── dns-manager.service.ts
│       │   ├── index.ts
│       │   └── README.md
│       │
│       ├── firebase/
│       │   └── services/
│       │       └── ...
│       │
│       ├── monitoring/
│       │   └── ...
│       │
│       └── notifications/
│           └── ...
│
├── 🔐 Middleware
│   └── middleware/
│       └── rate-limiter.ts
│
├── 📦 Models & Types
│   └── models/
│       └── types.ts                 # TypeScript types & interfaces
│
├── 🛠️ Utilities
│   └── utils/
│       ├── auth.ts
│       └── mock-data.ts             # Mock data for development
│
└── ⚙️ Config
    └── config/
        └── errors.ts                # Error configurations
```

### **3. App - Next.js Pages**

```
src/app/
│
├── 📱 Public Pages
│   ├── page.tsx                     # Landing page
│   ├── layout.tsx                   # Root layout
│   ├── globals.css                  # Global styles
│   ├── login-content.tsx
│   ├── forgot-password/
│   │   └── page.tsx
│   └── reset-password/
│       └── page.tsx
│
└── 🔐 Protected App Routes
    └── (app)/
        ├── layout.tsx               # App layout with auth
        │
        ├── 🏛️ Admin Daerah Routes
        │   ├── dashboard/
        │   │   └── page.tsx         # Admin Daerah dashboard
        │   ├── applications/
        │   │   └── page.tsx         # Ajukan domain
        │   ├── domains/
        │   │   ├── page.tsx         # Domain saya
        │   │   ├── deactivate/
        │   │   │   └── page.tsx
        │   │   └── reactivate/
        │   │       └── page.tsx
        │   ├── hosting/
        │   │   ├── page.tsx         # Hosting saya / Ajukan hosting
        │   │   └── deactivate/
        │   │       └── page.tsx
        │   ├── notifications/
        │   │   └── page.tsx         # Notifikasi
        │   └── users/
        │       └── page.tsx
        │
        ├── 👤 Super Admin Routes
        │   └── super-admin/
        │       ├── dashboard/
        │       │   └── page.tsx     # Super Admin dashboard  ✨ UPDATED
        │       ├── applications/
        │       │   └── page.tsx     # Permohonan domain
        │       ├── hosting-applications/
        │       │   └── page.tsx     # Permohonan hosting
        │       ├── domains/
        │       │   └── page.tsx     # Manajemen domain
        │       ├── users/
        │       │   └── page.tsx     # Manajemen pengguna
        │       ├── opds/
        │       │   └── page.tsx     # Manajemen OPD
        │       ├── audit-trail/
        │       │   └── page.tsx     # Audit trail
        │       ├── reports/
        │       │   └── page.tsx     # Laporan
        │       ├── roles/
        │       │   └── page.tsx
        │       ├── settings/
        │       │   └── page.tsx
        │       ├── subdomain-registration/
        │       │   └── page.tsx
        │       └── hosting-registration/
        │           └── page.tsx
        │
        ├── 🔄 Shared Routes (Both Roles)
        │   ├── audit-trail/
        │   │   └── page.tsx
        │   ├── profile/
        │   │   └── page.tsx
        │   ├── settings/
        │   │   └── page.tsx
        │   ├── privacy-policy/
        │   │   └── page.tsx
        │   └── terms-and-conditions/
        │       └── page.tsx
        │
        └── 🌐 API Routes (Already covered in backend/api/)
```

---

## 🎯 Key Files & Their Purposes

| File                                                                                 | Purpose                          | Role Access  |
| ------------------------------------------------------------------------------------ | -------------------------------- | ------------ |
| `src/app/(app)/dashboard/page.tsx`                                                   | Admin Daerah Dashboard           | Admin Daerah |
| `src/app/(app)/super-admin/dashboard/page.tsx`                                       | Super Admin Dashboard            | Super Admin  |
| `src/frontend/components/features/super-admin/dashboard/super-admin-dashboard.tsx`   | Super Admin Dashboard Component  | Super Admin  |
| `src/frontend/components/features/admin-daerah/dashboard/admin-daerah-dashboard.tsx` | Admin Daerah Dashboard Component | Admin Daerah |
| `src/backend/services/dns/`                                                          | DNS Management (Cloudflare)      | System       |
| `src/backend/utils/mock-data.ts`                                                     | Development Mock Data            | Development  |
| `src/frontend/components/layout/main-nav.tsx`                                        | Sidebar Navigation               | Both         |

---

## 🔑 Path Aliases (tsconfig.json)

```typescript
{
  "@/*": ["./src/*"],
  "@/frontend/*": ["./src/frontend/*"],
  "@/backend/*": ["./src/backend/*"],
  "@/components/*": ["./src/frontend/components/*"],
  "@/hooks/*": ["./src/frontend/hooks/*"],
  "@/utils/*": ["./src/frontend/utils/*"],
  "@/backend-utils/*": ["./src/backend/utils/*"],
  "@/services/*": ["./src/backend/services/*"],
  "@/actions/*": ["./src/backend/actions/*"],
  "@/models/*": ["./src/backend/models/*"],
  "@/api/*": ["./src/backend/api/*"],
  "@/lib/utils": ["./src/frontend/utils/utils"],
  "@/lib/mock-data": ["./src/backend/utils/mock-data"],
  "@/lib/firebase/*": ["./src/backend/services/firebase/*"],
  "@/lib/types": ["./src/backend/models/types"],
  "@/lib/services": ["./src/backend/services/index"]
}
```

---

## 📊 Statistics

- **Total Folders:** ~150+
- **Total Files:** ~500+
- **Source Lines of Code:** ~50,000+
- **Languages:** TypeScript, React, SQL
- **Framework:** Next.js 15.3.3
- **UI Library:** shadcn/ui + Tailwind CSS
- **Database:** MySQL

---

## ✨ Recent Changes

### **Component Restructuring (Nov 11, 2025)**

1. ✅ Created `src/frontend/components/features/super-admin/dashboard/`
2. ✅ Created `src/frontend/components/features/admin-daerah/dashboard/`
3. ✅ Moved dashboard components to role-specific folders
4. ✅ Added index.ts for cleaner imports
5. ✅ Updated import paths in dashboard pages
6. ✅ Added comprehensive README.md documentation

### **DNS Integration (From branch Arif)**

1. ✅ Added `src/backend/services/dns/` with Cloudflare integration
2. ✅ Added DNS API endpoints
3. ✅ Added DNS UI components
4. ✅ Updated domain actions for auto-DNS creation

### **Mock Data Enhancement**

1. ✅ Expanded MOCK_USERS (2 → 10 users)
2. ✅ Expanded MOCK_DOMAINS (2 → 15 domains)
3. ✅ Expanded MOCK_APPLICATIONS (2 → 10 applications)
4. ✅ Expanded MOCK_HOSTING_APPLICATIONS (1 → 8 applications)
5. ✅ Expanded MOCK_AUDIT_LOGS (2 → 20 logs)

---

## 📝 Next Steps

- [ ] Migrate remaining components to role-based structure
- [ ] Remove legacy/duplicate components
- [ ] Update all import paths across the application
- [ ] Add unit tests for new components
- [ ] Update API documentation

---

**Generated:** November 11, 2025  
**Branch:** chaca  
**Repository:** domain-manager-master
