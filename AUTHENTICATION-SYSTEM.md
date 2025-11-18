# Sistem Autentikasi Domain Manager

## Overview

Sistem autentikasi lengkap untuk Domain Manager dengan dua role utama:

1. **Super Admin** - Akses penuh ke sistem dengan tracking login petugas
2. **Admin Daerah** - Dapat mendaftar sendiri dan mengelola domain OPD

## Fitur Utama

### 1. Registrasi Admin Daerah

Admin Daerah dapat mendaftar akun sendiri dengan mengisi:

- Nama Lengkap
- Email
- Username (alfanumerik + underscore)
- Password (minimal 8 karakter)
- Asal OPD (dropdown)
- Alamat OPD
- Nomor Kontak

**Endpoint**: `POST /api/auth/register`

**Validasi**:

- Email harus format valid
- Username hanya huruf, angka, underscore
- Password minimal 8 karakter
- Semua field wajib diisi

### 2. Login

#### Login Admin Daerah

- Username
- Password

#### Login Super Admin

- Username
- Nama Petugas (wajib untuk tracking)
- Password

**Endpoint**: `POST /api/auth/login`

**Auto-detection**: Form otomatis mendeteksi jika username adalah "superadmin" dan menampilkan field "Nama Petugas"

### 3. Tracking Login Super Admin

Setiap login Super Admin dicatat dengan informasi:

- Nama petugas yang login
- Waktu login
- Waktu logout
- IP Address
- User Agent
- Durasi session

**Halaman Log**: `/super-admin/session-logs`

### 4. Akun Super Admin Default

**Kredensial Default**:

- Username: `superadmin`
- Email: `superadmin@kalbarprov.go.id`
- Password: `Superadmin123`
- Nama Lengkap: `Super Admin`
- OPD: `Diskominfo Provinsi Kalimantan Barat`
- Alamat: `Kompleks Kantor Gubernur Kalimantan Barat`
- Kontak: `0564123145`

## Database Schema

### Tabel: users

```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL COMMENT 'Admin Daerah, Super Admin',
    opd_id INT,
    opd_address TEXT,
    contact VARCHAR(20),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (opd_id) REFERENCES opds(id) ON DELETE SET NULL ON UPDATE CASCADE,
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_opd_id (opd_id),
    INDEX idx_role (role)
);
```

### Tabel: super_admin_sessions

```sql
CREATE TABLE super_admin_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    officer_name VARCHAR(100) NOT NULL COMMENT 'Nama petugas yang login',
    login_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    logout_at TIMESTAMP NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_login_at (login_at)
);
```

## API Endpoints

### Authentication

| Method | Endpoint             | Description                | Auth Required     |
| ------ | -------------------- | -------------------------- | ----------------- |
| POST   | `/api/auth/register` | Register Admin Daerah      | No                |
| POST   | `/api/auth/login`    | Login (both roles)         | No                |
| POST   | `/api/auth/logout`   | Logout                     | Yes               |
| POST   | `/api/auth/setup`    | Create default Super Admin | No                |
| GET    | `/api/auth/sessions` | Get Super Admin login logs | Yes (Super Admin) |

### OPDs

| Method | Endpoint    | Description      | Auth Required |
| ------ | ----------- | ---------------- | ------------- |
| GET    | `/api/opds` | Get list of OPDs | No            |

## Setup Instructions

### 1. Migrasi Database

Jalankan script SQL untuk menambah kolom autentikasi:

```bash
# Via MySQL client
mysql -u root -p domain_manager < add-auth-columns.sql

# Via XAMPP/phpMyAdmin
# Import file add-auth-columns.sql
```

### 2. Install Dependencies

```bash
npm install bcryptjs @types/bcryptjs
```

### 3. Create Super Admin Account

Ada dua cara:

#### Cara 1: Via API (Recommended)

```bash
curl -X POST http://localhost:9002/api/auth/setup
```

#### Cara 2: Via Service (dalam kode)

```typescript
import { authService } from "@/backend/database/services/auth.service";
await authService.createDefaultSuperAdmin();
```

### 4. Test Login

1. **Admin Daerah**:

   - Buka `/register`
   - Isi form registrasi
   - Login di `/login`

2. **Super Admin**:
   - Buka `/login`
   - Username: `superadmin`
   - Nama Petugas: (isi nama Anda)
   - Password: `Superadmin123`

## Security Features

### Password Hashing

- Menggunakan **bcrypt** dengan salt rounds 10
- Password tidak pernah disimpan dalam bentuk plain text
- Hash password: `$2a$10$...`

### Session Management

- HTTP-only cookies
- Secure flag untuk production
- SameSite: strict
- Max age: 7 days

### Input Validation

- Email format validation
- Username: alfanumerik + underscore only
- Password: minimal 8 karakter
- XSS protection via React

## File Structure

```
src/
├── app/
│   ├── register/
│   │   └── page.tsx                 # Halaman registrasi Admin Daerah
│   ├── login-content.tsx            # Form login (updated)
│   ├── (app)/
│   │   └── super-admin/
│   │       └── session-logs/
│   │           └── page.tsx         # Halaman log login Super Admin
│   └── api/
│       ├── auth/
│       │   ├── register/
│       │   │   └── route.ts         # API registrasi
│       │   ├── login/
│       │   │   └── route.ts         # API login
│       │   ├── logout/
│       │   │   └── route.ts         # API logout
│       │   ├── setup/
│       │   │   └── route.ts         # API setup Super Admin
│       │   └── sessions/
│       │       └── route.ts         # API get session logs
│       └── opds/
│           └── route.ts             # API get OPDs
└── backend/
    ├── database/
    │   └── services/
    │       └── auth.service.ts      # Authentication service
    └── models/
        └── types.ts                 # Updated types (User, Login, etc)
```

## Flow Diagram

### Registrasi Admin Daerah

```
User → /register → Form Registrasi → Validation → API /auth/register
  → Hash Password → Insert to DB → Success → Redirect to /login
```

### Login Admin Daerah

```
User → /login → Enter Username & Password → API /auth/login
  → Verify Password → Set Cookies → Redirect to /dashboard
```

### Login Super Admin

```
User → /login → Enter Username (superadmin) → Field "Nama Petugas" muncul
  → Enter Nama Petugas & Password → API /auth/login
  → Verify Password → Create Session Log → Set Cookies
  → Redirect to /super-admin/dashboard
```

### Tracking Login Super Admin

```
Super Admin Login → Insert to super_admin_sessions
  (user_id, officer_name, login_at, ip_address, user_agent)

Super Admin Logout → Update super_admin_sessions
  SET logout_at = CURRENT_TIMESTAMP

View Logs → /super-admin/session-logs → API /auth/sessions
  → Display table with login history
```

## TODO / Future Enhancements

- [ ] JWT authentication (saat ini menggunakan cookies sederhana)
- [ ] Refresh token mechanism
- [ ] Password reset via email
- [ ] Two-factor authentication (2FA)
- [ ] Password strength meter
- [ ] Account lockout after failed attempts
- [ ] Email verification untuk registrasi
- [ ] Change password functionality
- [ ] Session timeout warning
- [ ] Remember me option

## Testing

### Test Cases

1. **Registrasi Admin Daerah**

   - ✅ Form validation (semua field wajib)
   - ✅ Email format validation
   - ✅ Username uniqueness
   - ✅ Password minimal 8 karakter
   - ✅ Password confirmation match

2. **Login Admin Daerah**

   - ✅ Username & password required
   - ✅ Invalid credentials rejected
   - ✅ Inactive user cannot login
   - ✅ Redirect to correct dashboard

3. **Login Super Admin**

   - ✅ Nama petugas required
   - ✅ Session created in database
   - ✅ IP address & user agent recorded
   - ✅ Multiple login sessions supported

4. **Session Logs**
   - ✅ Display all login history
   - ✅ Show active sessions
   - ✅ Calculate session duration
   - ✅ Display logout time if available

## Support

Untuk pertanyaan atau issue, hubungi tim development atau buat issue di repository.

---

**Last Updated**: November 18, 2025
**Version**: 1.0.0
