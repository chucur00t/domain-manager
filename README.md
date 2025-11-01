# 🏛️ Domain Manager - SPDPD

**Sistem Pengelolaan Domain Pemerintah Daerah**

Platform digital untuk mengelola permohonan, aktivasi, dan monitoring domain serta hosting untuk Organisasi Perangkat Daerah (OPD).

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20.x
- MySQL 8.0+
- npm atau yarn

### Installation

```bash
# Clone repository
git clone https://github.com/d1041231031-inf/domain-manager-master.git
cd domain-manager-master

# Install dependencies
npm install

# Setup database (see QUICKSTART.md)
cp .env.example .env.local
# Edit .env.local with your database credentials

# Run development server
npm run dev
```

Visit http://localhost:9002

---

## 📚 Documentation

- 🚀 **[QUICKSTART.md](QUICKSTART.md)** - Get started in 5 minutes
- 🗄️ **[DATABASE_SETUP.md](DATABASE_SETUP.md)** - Complete database setup guide
- 📊 **[MIGRATION_PROGRESS.md](MIGRATION_PROGRESS.md)** - Migration status & progress
- 📖 **[docs/requirements/SRS](docs/requirements/)** - Software Requirements Specification
- 🎨 **[docs/design/SDD](docs/design/)** - Software Design Document

---

## ✨ Features

### For Admin Daerah (OPD)
- ✅ Submit domain & hosting applications
- ✅ Track application status
- ✅ Request domain renewal
- ✅ View domain expiry countdown
- ✅ Manage OPD profile

### For Super Admin (Diskominfo)
- ✅ Review & approve/reject applications
- ✅ Activate/deactivate domains
- ✅ Monitor all domains & hosting
- ✅ Manage user accounts
- ✅ View audit trail
- ✅ Export reports (PDF/Excel) *coming soon*

### System Features
- ✅ Real-time notifications *in progress*
- ✅ Automated domain expiry alerts
- ✅ Document management
- ✅ Audit logging
- ✅ Role-based access control

---

## 🛠️ Tech Stack

**Frontend:**
- Next.js 15.3.3 (App Router)
- React 18.3.1
- TypeScript 5
- Tailwind CSS 3.4.1
- ShadCN UI

**Backend:**
- Node.js 20.x
- Next.js Server Actions
- MySQL 8.0
- TypeScript

**Development:**
- Jest (Unit Testing)
- Playwright (E2E Testing)
- ESLint
- Prettier

---

## 📁 Project Structure

```
domain-manager-master/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── (app)/          # Protected routes
│   │   ├── login/          # Authentication
│   │   └── layout.tsx
│   ├── backend/
│   │   ├── actions/        # Server Actions
│   │   ├── api/            # API Routes
│   │   ├── database/       # Database layer
│   │   │   ├── repositories/  # Data access
│   │   │   ├── seeders/       # Sample data
│   │   │   └── schema.sql     # Database schema
│   │   ├── services/       # Business logic
│   │   └── models/         # Type definitions
│   └── frontend/
│       ├── components/     # React components
│       ├── hooks/          # Custom hooks
│       └── utils/          # Utilities
├── docs/                   # Documentation
├── DATABASE_SETUP.md       # DB setup guide
├── QUICKSTART.md          # Quick start guide
└── MIGRATION_PROGRESS.md  # Migration status
```

---

## 🔄 Migration Status

**Current Phase:** Database Migration from Mock to MySQL

**Progress:** 44% Complete

| Phase | Status |
|-------|--------|
| Database Infrastructure | ✅ Complete (100%) |
| Repository Pattern | ✅ Complete (100%) |
| Service Migration | ❌ Not Started |
| Testing & Cleanup | ❌ Not Started |

See [MIGRATION_PROGRESS.md](MIGRATION_PROGRESS.md) for details.

---

## 🚧 Development Status

### ✅ Completed
- [x] UI/UX Design & Implementation
- [x] Database Schema Design
- [x] Basic CRUD Operations (Mock)
- [x] Authentication Flow
- [x] Role-Based Access Control
- [x] Dashboard & Analytics
- [x] Audit Trail System

### 🔄 In Progress
- [ ] MySQL Database Integration (22%)
- [ ] Email Notification System
- [ ] File Upload with Progress

### ❌ Planned
- [ ] SSO Integration
- [ ] DNS Provider API Integration
- [ ] Hosting Provider API Integration
- [ ] PDF/Excel Export
- [ ] Real-time Dashboard Updates

---

## 🧪 Testing

```bash
# Run unit tests
npm run test

# Run E2E tests
npm run test:e2e

# Run with UI
npm run test:e2e:ui

# Generate coverage
npm run test:coverage
```

---

## 📝 Scripts

```bash
npm run dev          # Development server (port 9002)
npm run build        # Production build
npm run start        # Production server
npm run lint         # Run ESLint
npm run typecheck    # TypeScript check
```

---

## 🔐 Environment Variables

Create `.env.local` from `.env.example`:

```env
# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=domain_manager

# Email (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@domain.com
SMTP_PASSWORD=your-app-password
```

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 📄 License

This project is proprietary software for Dinas Komunikasi dan Informatika.

---

## 👥 Team

**Development Team:**
- Backend Developer
- Frontend Developer
- Database Administrator
- UI/UX Designer

**Stakeholders:**
- Dinas Komunikasi dan Informatika (Diskominfo)
- Organisasi Perangkat Daerah (OPD)

---

## 📞 Support

For issues and questions:
- Create an issue on GitHub
- Contact: admin@diskominfo.go.id

---

## 🗺️ Roadmap

### Phase 1: Foundation (Current)
- ✅ UI/UX Implementation
- 🔄 Database Migration
- ❌ Core Feature Completion

### Phase 2: Integration (Next)
- SSO Implementation
- DNS API Integration
- Email Notifications

### Phase 3: Enhancement
- Export Features
- Advanced Analytics
- Performance Optimization

### Phase 4: Production
- Security Hardening
- Load Testing
- Deployment

---

**Last Updated:** November 1, 2025
**Version:** 0.1.0 (Development)
**Status:** 🟡 In Active Development

