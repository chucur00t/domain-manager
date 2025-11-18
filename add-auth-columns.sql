-- Script untuk menambahkan kolom autentikasi ke tabel users

-- Tambah kolom baru ke tabel users jika belum ada
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255) NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS full_name VARCHAR(100) NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS opd_address TEXT,
ADD COLUMN IF NOT EXISTS contact VARCHAR(20);

-- Update role format jika perlu (dari AdminDaerah ke Admin Daerah)
UPDATE users SET role = 'Admin Daerah' WHERE role = 'AdminDaerah';
UPDATE users SET role = 'Super Admin' WHERE role = 'SuperAdmin';

-- Buat tabel untuk tracking login Super Admin
CREATE TABLE IF NOT EXISTS super_admin_sessions (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert OPD Diskominfo jika belum ada
INSERT INTO opds (name, address, contact_person, phone_number)
SELECT 'Diskominfo Provinsi Kalimantan Barat', 
       'Kompleks Kantor Gubernur Kalimantan Barat', 
       'Super Admin', 
       '0564123145'
WHERE NOT EXISTS (
    SELECT 1 FROM opds WHERE name = 'Diskominfo Provinsi Kalimantan Barat'
);

-- Insert Super Admin account (password: Superadmin123)
-- Password hash untuk "Superadmin123" dengan bcrypt (salt rounds: 10)
INSERT INTO users (username, email, password_hash, full_name, role, opd_id, opd_address, contact, is_active)
SELECT 'superadmin',
       'superadmin@kalbarprov.go.id',
       '$2a$10$YourBcryptHashHere', -- Akan di-generate oleh service
       'Super Admin',
       'Super Admin',
       (SELECT id FROM opds WHERE name = 'Diskominfo Provinsi Kalimantan Barat' LIMIT 1),
       'Kompleks Kantor Gubernur Kalimantan Barat',
       '0564123145',
       TRUE
WHERE NOT EXISTS (
    SELECT 1 FROM users WHERE username = 'superadmin'
);

-- Catatan: 
-- Password hash akan di-generate secara otomatis oleh auth service
-- Untuk membuat akun Super Admin, jalankan endpoint khusus atau gunakan script setup
