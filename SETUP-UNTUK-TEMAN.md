# Panduan Setup Setelah Git Pull

## Langkah-langkah Setup (Wajib Dilakukan):

### 1. Install Dependencies

```bash
npm install
```

**SANGAT PENTING!** Folder `node_modules/` tidak ikut di-push ke Git, jadi harus install sendiri.

### 2. Setup File Environment (.env)

Buat file `.env` di root folder dengan isi seperti ini:

```env
# Database Configuration
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_USER=root
DATABASE_PASSWORD=your_password
DATABASE_NAME=domain_manager

# Session Secret
SESSION_SECRET=your-secret-key-here

# Email Configuration (opsional untuk development)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Redis Configuration (opsional)
REDIS_HOST=localhost
REDIS_PORT=6379
```

**Tanya ke saya untuk mendapatkan konfigurasi database yang benar!**

### 3. Setup Database (Jika Menggunakan Database)

Jika ingin pakai database yang sama:

```bash
# Import schema database
mysql -u root -p domain_manager < src/backend/database/schema.sql
```

Atau jalankan script PowerShell:

```bash
.\init-database.ps1
```

### 4. Hapus Cache Lama

```bash
# Hapus folder .next jika ada
Remove-Item -Path .next -Recurse -Force -ErrorAction SilentlyContinue
```

### 5. Jalankan Development Server

```bash
npm run dev
```

Server akan berjalan di: **http://localhost:9002**

---

## Checklist Troubleshooting

Jika tampilan masih berbeda, cek:

- [ ] Sudah jalankan `npm install`?
- [ ] File `.env` sudah dibuat dengan konfigurasi yang benar?
- [ ] Versi Node.js minimal v18.x.x? (cek dengan `node --version`)
- [ ] Database sudah di-setup? (Atau OK pakai mock data?)
- [ ] Sudah hapus folder `.next` dan restart server?
- [ ] Port 9002 tidak dipakai aplikasi lain?
- [ ] Browser sudah di-refresh dengan Ctrl+Shift+R (hard refresh)?

---

## Mode Development vs Production

### Development Mode (sekarang):

- Menggunakan Turbopack (cepat)
- Hot reload otomatis
- Error ditampilkan jelas
- **Jalankan dengan:** `npm run dev`

### Production Mode (untuk deploy):

```bash
npm run build
npm start
```

---

## Perbedaan Data

Jika teman Anda **TIDAK** setup database:

- Aplikasi akan menggunakan **MOCK DATA** (data dummy)
- Data yang tampil akan berbeda dengan yang di laptop saya
- Ini **NORMAL** untuk development

Jika teman Anda **SUDAH** setup database:

- Data akan sama jika menggunakan database yang sama
- Pastikan import schema dan data seeder

---

## Kontak

Jika masih ada masalah, hubungi saya dan berikan informasi:

1. Screenshot error (jika ada)
2. Output dari `npm run dev`
3. Isi file `.env` (sensor password)
4. Versi Node.js (`node --version`)
5. Bagian mana yang berbeda tampilannya
