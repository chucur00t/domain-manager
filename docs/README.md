# 📚 Dokumentasi Domain Manager

**Project:** Sistem Manajemen Domain & Hosting  
**Client:** Pemerintah Provinsi Kalimantan Barat  
**Version:** 1.0  
**Last Updated:** November 5, 2025

---

## 📖 Dokumentasi Utama

### 🚀 Getting Started
- **[Quick Deployment Guide](QUICK-DEPLOYMENT.md)** - Deploy aplikasi dalam 30 menit
- **[Deployment Guide](DEPLOYMENT-GUIDE.md)** - Panduan lengkap deployment ke production
- **[Handover Checklist](HANDOVER-CHECKLIST.md)** - Checklist serah terima ke tim IT

### 🏗️ Architecture & Design
- **[Architecture](../ARCHITECTURE.md)** - Arsitektur sistem lengkap
- **[Software Design Document (SDD)](design/DOKUMEN%20DESAIN%20PERANGKAT%20LUNAK%20(SDD).docx.md)** - Dokumen desain perangkat lunak

### 📋 Requirements
- **[Software Requirements Specification (SRS)](requirements/SPESIFIKASI%20KEBUTUHAN%20PERANGKAT%20LUNAK%20(SRS).docx.md)** - Spesifikasi kebutuhan lengkap

---

## 🎯 Dokumentasi Berdasarkan Role

### 👨‍💼 Untuk Manajemen/Stakeholder
1. **[SRS](requirements/)** - Kebutuhan fungsional & non-fungsional
2. **[Architecture](../ARCHITECTURE.md)** - Overview sistem
3. **[Handover Checklist](HANDOVER-CHECKLIST.md)** - Deliverables & sign-off

### 👨‍💻 Untuk Developer
1. **[Architecture](../ARCHITECTURE.md)** - System architecture
2. **[SDD](design/)** - Design patterns & structure
3. **[README](../README.md)** - Development setup
4. **[API Documentation](../src/backend/api/)** - API endpoints

### 🔧 Untuk Tim IT/DevOps
1. **[Quick Deployment](QUICK-DEPLOYMENT.md)** - Quick start (30 min)
2. **[Deployment Guide](DEPLOYMENT-GUIDE.md)** - Full deployment guide
3. **[Handover Checklist](HANDOVER-CHECKLIST.md)** - Operational handover
4. **Database Schema:** `../src/backend/database/schema.sql`

### 👥 Untuk End Users
- **User Manual** - (To be created during training)
- **FAQ** - (To be created based on user feedback)

---

## 📂 Struktur Dokumentasi

```
docs/
├── README.md                          # This file - documentation index
├── QUICK-DEPLOYMENT.md                # Quick start guide (30 min)
├── DEPLOYMENT-GUIDE.md                # Complete deployment guide
├── HANDOVER-CHECKLIST.md              # Handover checklist & sign-off
├── design/
│   └── DOKUMEN DESAIN PERANGKAT LUNAK (SDD).docx.md
└── requirements/
    └── SPESIFIKASI KEBUTUHAN PERANGKAT LUNAK (SRS).docx.md
```

---

## 🔗 Quick Links

### Development
- **Main README:** [../README.md](../README.md)
- **Source Code:** [../src/](../src/)
- **Database Schema:** [../src/backend/database/schema.sql](../src/backend/database/schema.sql)

### Deployment
- **Environment Config:** [../.env.production.example](../.env.production.example)
- **Migration Script:** [../scripts/migrate-database.sh](../scripts/migrate-database.sh)
- **Docker Config:** [../docker-compose.yml](../docker-compose.yml)

### Architecture
- **System Architecture:** [../ARCHITECTURE.md](../ARCHITECTURE.md)
- **Database ERD:** See SDD document
- **API Routes:** [../src/backend/api/](../src/backend/api/)

---

## ❓ FAQ

### Q: Dokumentasi mana yang harus dibaca pertama kali?
**A:** Tergantung role Anda:
- **Developer baru:** Mulai dari [README.md](../README.md)
- **Tim IT/DevOps:** Mulai dari [QUICK-DEPLOYMENT.md](QUICK-DEPLOYMENT.md)
- **Manajemen:** Mulai dari [SRS](requirements/)

### Q: Bagaimana cara deploy ke production?
**A:** Ikuti [Deployment Guide](DEPLOYMENT-GUIDE.md) atau [Quick Deployment](QUICK-DEPLOYMENT.md) untuk quick start.

### Q: Dimana saya bisa lihat database schema?
**A:** Lihat file `src/backend/database/schema.sql` atau SDD document.

---

## 📞 Support & Contact

### Development Team
- **Developer:** [Your Name]
- **Email:** [your-email]
- **Phone:** [your-phone]

### Client
- **Organization:** DISKOMINFO Prov. Kalimantan Barat
- **Project Owner:** [Name]
- **Technical Contact:** [Name]

---

**© 2025 - Domain Manager System - Pemerintah Provinsi Kalimantan Barat**