-- =========================================
-- SEED DATABASE DENGAN DATA KALIMANTAN BARAT
-- Script disesuaikan dengan struktur database yang ada
-- =========================================

USE domain_manager;

SET FOREIGN_KEY_CHECKS = 0;

-- Clear data lama
TRUNCATE TABLE audit_logs;
TRUNCATE TABLE documents;
TRUNCATE TABLE hostings;
TRUNCATE TABLE domains;
TRUNCATE TABLE applications;
TRUNCATE TABLE users;
TRUNCATE TABLE opds;

-- =========================================
-- INSERT OPD (20 OPD)
-- =========================================
INSERT INTO opds (id, name, address, contact_person, phone_number, created_at) VALUES
(1, 'Dinas Komunikasi dan Informatika', 'Jl. Ahmad Yani, Pontianak, Kalimantan Barat', 'Ir. Hartoyo, M.T.', '0561-736622', NOW()),
(2, 'Dinas Pendidikan dan Kebudayaan', 'Jl. Letjen Sutoyo, Pontianak, Kalimantan Barat', 'Dr. Sri Wahyuni, M.Pd.', '0561-735306', NOW()),
(3, 'Dinas Kesehatan', 'Jl. K. H. Wahid Hasyim No. 249, Pontianak, Kalimantan Barat', 'dr. Harisson, M.Kes., Sp.PD.', '0561-736711', NOW()),
(4, 'Dinas Pekerjaan Umum dan Penataan Ruang', 'Jl. Alianyang, Pontianak, Kalimantan Barat', 'Ir. Andi Wijaya, M.T.', '0561-583440', NOW()),
(5, 'Dinas Sosial', 'Jl. Dr. Sutomo, Pontianak, Kalimantan Barat', 'Drs. Bambang Suryanto, M.Si.', '0561-732121', NOW()),
(6, 'Dinas Tenaga Kerja dan Transmigrasi', 'Jl. Sultan Abdurrahman, Pontianak, Kalimantan Barat', 'Dra. Siti Aminah, M.M.', '0561-736449', NOW()),
(7, 'Dinas Perhubungan', 'Jl. Jenderal Urip, Pontianak, Kalimantan Barat', 'Ir. Budiman Santoso, M.T.', '0561-765521', NOW()),
(8, 'Dinas Pariwisata', 'Jl. Sidas, Pontianak, Kalimantan Barat', 'Agustinus Teras Narang, S.Sos., M.Si.', '0561-743415', NOW()),
(9, 'Dinas Perindustrian dan Perdagangan', 'Jl. A. Yani II, Pontianak, Kalimantan Barat', 'Drs. Hermansyah, M.M.', '0561-736183', NOW()),
(10, 'Dinas Pertanian dan Hortikultura', 'Jl. Alianyang KM 10, Pontianak, Kalimantan Barat', 'Ir. Suryadi, M.P.', '0561-587711', NOW()),
(11, 'Dinas Perikanan', 'Jl. Alianyang KM 10, Pontianak, Kalimantan Barat', 'Ir. Muhammad Rizki, M.Si.', '0561-587722', NOW()),
(12, 'Dinas Kehutanan', 'Jl. Gusti Sulung Lelanang, Pontianak, Kalimantan Barat', 'Dr. Ir. Bambang Heryanto, M.Si.', '0561-736595', NOW()),
(13, 'Dinas Lingkungan Hidup', 'Jl. Sultan Hamid II, Pontianak, Kalimantan Barat', 'Ir. Ratna Sari Dewi, M.T.', '0561-742444', NOW()),
(14, 'Dinas Energi dan Sumber Daya Mineral', 'Jl. Achmad Yani, Pontianak, Kalimantan Barat', 'Ir. Hadi Purnomo, M.T.', '0561-736211', NOW()),
(15, 'Badan Perencanaan Pembangunan Daerah', 'Jl. Letjen Sutoyo, Pontianak, Kalimantan Barat', 'Drs. H. Ahmad Fauzi, M.Si.', '0561-736519', NOW()),
(16, 'Badan Kepegawaian Daerah', 'Jl. Ahmad Yani, Pontianak, Kalimantan Barat', 'Dra. Hj. Nurlaila, M.M.', '0561-736344', NOW()),
(17, 'Badan Pengelola Keuangan dan Aset Daerah', 'Jl. Letjen Sutoyo, Pontianak, Kalimantan Barat', 'Drs. Hari Kusuma, M.M., Ak.', '0561-735000', NOW()),
(18, 'Dinas Pemberdayaan Masyarakat dan Desa', 'Jl. Sultan Abdurrahman, Pontianak, Kalimantan Barat', 'Ir. H. Syamsul Bahri, M.Si.', '0561-736566', NOW()),
(19, 'Dinas Kependudukan dan Pencatatan Sipil', 'Jl. Ahmad Yani, Pontianak, Kalimantan Barat', 'Drs. Agus Riyanto, M.Si.', '0561-742233', NOW()),
(20, 'Satuan Polisi Pamong Praja', 'Jl. Letjen Sutoyo, Pontianak, Kalimantan Barat', 'Drs. H. Yusuf Hidayat, M.M.', '0561-736455', NOW());

-- =========================================
-- INSERT USERS (15 Users)
-- Note: role hanya bisa 'AdminDaerah' atau 'SuperAdmin'
-- Note: kolom password, bukan password_hash
-- Note: kolom nip dan whatsapp tidak ada di schema
-- =========================================
INSERT INTO users (id, username, email, password, role, opd_id, is_active, created_at) VALUES
(1, 'superadmin', 'superadmin@kalbarprov.go.id', '$2a$10$dummyhash', 'SuperAdmin', 1, 1, NOW()),
(2, 'admin.diskominfo', 'admin.diskominfo@kalbarprov.go.id', '$2a$10$dummyhash', 'AdminDaerah', 1, 1, NOW()),
(3, 'admin.disdikbud', 'admin.disdikbud@kalbarprov.go.id', '$2a$10$dummyhash', 'AdminDaerah', 2, 1, NOW()),
(4, 'admin.dinkes', 'admin.dinkes@kalbarprov.go.id', '$2a$10$dummyhash', 'AdminDaerah', 3, 1, NOW()),
(5, 'admin.dpupr', 'admin.dpupr@kalbarprov.go.id', '$2a$10$dummyhash', 'AdminDaerah', 4, 1, NOW()),
(6, 'admin.dinsos', 'admin.dinsos@kalbarprov.go.id', '$2a$10$dummyhash', 'AdminDaerah', 5, 1, NOW()),
(7, 'admin.disnakertrans', 'admin.disnakertrans@kalbarprov.go.id', '$2a$10$dummyhash', 'AdminDaerah', 6, 1, NOW()),
(8, 'admin.dishub', 'admin.dishub@kalbarprov.go.id', '$2a$10$dummyhash', 'AdminDaerah', 7, 1, NOW()),
(9, 'admin.dispar', 'admin.dispar@kalbarprov.go.id', '$2a$10$dummyhash', 'AdminDaerah', 8, 1, NOW()),
(10, 'admin.disperindag', 'admin.disperindag@kalbarprov.go.id', '$2a$10$dummyhash', 'AdminDaerah', 9, 1, NOW()),
(11, 'admin.distanhort', 'admin.distanhort@kalbarprov.go.id', '$2a$10$dummyhash', 'AdminDaerah', 10, 1, NOW()),
(12, 'admin.diskan', 'admin.diskan@kalbarprov.go.id', '$2a$10$dummyhash', 'AdminDaerah', 11, 1, NOW()),
(13, 'admin.dishut', 'admin.dishut@kalbarprov.go.id', '$2a$10$dummyhash', 'AdminDaerah', 12, 1, NOW()),
(14, 'admin.dlh', 'admin.dlh@kalbarprov.go.id', '$2a$10$dummyhash', 'AdminDaerah', 13, 1, NOW()),
(15, 'admin.desdm', 'admin.desdm@kalbarprov.go.id', '$2a$10$dummyhash', 'AdminDaerah', 14, 1, NOW());

-- =========================================
-- INSERT APPLICATIONS (22 Applications)
-- =========================================
INSERT INTO applications (id, application_type, requested_domain_name, opd_id, submitter_id, status, submitted_at, approved_at, last_updated_by) VALUES
-- Domain Approved (10)
(1, 'domain', 'diskominfo.kalbarprov.go.id', 1, 2, 'Approved', '2024-01-15 09:00:00', '2024-01-18 10:30:00', 1),
(2, 'domain', 'disdikbud.kalbarprov.go.id', 2, 3, 'Approved', '2024-02-10 10:15:00', '2024-02-15 14:00:00', 1),
(3, 'domain', 'dinkes.kalbarprov.go.id', 3, 4, 'Approved', '2024-03-05 08:30:00', '2024-03-10 11:45:00', 1),
(4, 'domain', 'dpupr.kalbarprov.go.id', 4, 5, 'Approved', '2024-03-20 13:00:00', '2024-03-25 15:30:00', 1),
(5, 'domain', 'dinsos.kalbarprov.go.id', 5, 6, 'Approved', '2024-04-08 09:20:00', '2024-04-12 10:00:00', 1),
(6, 'domain', 'dispar.kalbarprov.go.id', 8, 9, 'Approved', '2024-05-15 11:00:00', '2024-05-20 13:15:00', 1),
(7, 'domain', 'distanhort.kalbarprov.go.id', 10, 11, 'Approved', '2024-06-20 08:45:00', '2024-06-25 10:30:00', 1),
(8, 'domain', 'diskan.kalbarprov.go.id', 11, 12, 'Approved', '2024-07-10 10:00:00', '2024-07-15 14:20:00', 1),
(9, 'domain', 'dlh.kalbarprov.go.id', 13, 14, 'Approved', '2024-08-05 09:30:00', '2024-08-10 11:00:00', 1),
(10, 'domain', 'bappeda.kalbarprov.go.id', 15, 1, 'Approved', '2024-09-01 08:00:00', '2024-09-05 10:00:00', 1),
-- Domain Pending (3)
(11, 'domain', 'dishub.kalbarprov.go.id', 7, 8, 'Pending', '2025-11-10 10:30:00', NULL, NULL),
(12, 'domain', 'disperindag.kalbarprov.go.id', 9, 10, 'Pending', '2025-11-12 09:15:00', NULL, NULL),
(13, 'domain', 'disnakertrans.kalbarprov.go.id', 6, 7, 'Pending', '2025-11-13 14:00:00', NULL, NULL),
-- Domain Rejected (1)
(14, 'domain', 'dishut-kalbar.go.id', 12, 13, 'Rejected', '2025-10-20 11:30:00', '2025-10-25 14:15:00', 1),
-- Hosting Approved (5)
(15, 'hosting', 'portal.diskominfo.kalbarprov.go.id', 1, 2, 'Approved', '2024-02-01 10:00:00', '2024-02-05 13:30:00', 1),
(16, 'hosting', 'ppdb.disdikbud.kalbarprov.go.id', 2, 3, 'Approved', '2024-03-15 11:30:00', '2024-03-20 14:00:00', 1),
(17, 'hosting', 'faskes.dinkes.kalbarprov.go.id', 3, 4, 'Approved', '2024-04-20 09:00:00', '2024-04-25 11:30:00', 1),
(18, 'hosting', 'visit.dispar.kalbarprov.go.id', 8, 9, 'Approved', '2024-06-10 10:15:00', '2024-06-15 13:45:00', 1),
(19, 'hosting', 'siperta.distanhort.kalbarprov.go.id', 10, 11, 'Approved', '2024-07-25 08:30:00', '2024-07-30 10:00:00', 1),
-- Hosting Pending (2)
(20, 'hosting', 'sikanlaut.diskan.kalbarprov.go.id', 11, 12, 'Pending', '2025-11-11 13:20:00', NULL, NULL),
(21, 'hosting', 'simling.dlh.kalbarprov.go.id', 13, 14, 'Pending', '2025-11-13 10:45:00', NULL, NULL),
-- Hosting Rejected (1)
(22, 'hosting', 'infrastruktur.dpupr.kalbarprov.go.id', 4, 5, 'Rejected', '2025-10-18 09:00:00', '2025-10-22 11:30:00', 1);

-- Update rejection reasons
UPDATE applications SET reason = 'Nama domain tidak sesuai dengan konvensi penamaan yang ditetapkan. Gunakan format: [nama-dinas].kalbarprov.go.id' WHERE id = 14;
UPDATE applications SET reason = 'Spesifikasi teknis yang diajukan tidak memenuhi standar minimum untuk aplikasi yang akan di-hosting' WHERE id = 22;

-- =========================================
-- INSERT DOMAINS (10 Active)
-- Note: Table tidak memiliki kolom opd_id
-- =========================================
INSERT INTO domains (id, application_id, domain_name, status, activated_at, expires_at) VALUES
(1, 1, 'diskominfo.kalbarprov.go.id', 'Active', '2024-01-20 08:00:00', '2026-01-20 08:00:00'),
(2, 2, 'disdikbud.kalbarprov.go.id', 'Active', '2024-02-18 09:00:00', '2026-02-18 09:00:00'),
(3, 3, 'dinkes.kalbarprov.go.id', 'Active', '2024-03-12 10:00:00', '2026-03-12 10:00:00'),
(4, 4, 'dpupr.kalbarprov.go.id', 'Active', '2024-03-28 08:30:00', '2026-03-28 08:30:00'),
(5, 5, 'dinsos.kalbarprov.go.id', 'Active', '2024-04-15 11:00:00', '2026-04-15 11:00:00'),
(6, 6, 'dispar.kalbarprov.go.id', 'Active', '2024-05-22 09:30:00', '2026-05-22 09:30:00'),
(7, 7, 'distanhort.kalbarprov.go.id', 'Active', '2024-06-28 10:00:00', '2026-06-28 10:00:00'),
(8, 8, 'diskan.kalbarprov.go.id', 'Active', '2024-07-18 08:00:00', '2026-07-18 08:00:00'),
(9, 9, 'dlh.kalbarprov.go.id', 'Active', '2024-08-12 11:30:00', '2026-08-12 11:30:00'),
(10, 10, 'bappeda.kalbarprov.go.id', 'Active', '2024-09-08 09:00:00', '2026-09-08 09:00:00');

-- =========================================
-- INSERT HOSTINGS (5 Active)
-- =========================================
INSERT INTO hostings (id, application_id, domain_id, storage_capacity, bandwidth, server_type, status, activated_at) VALUES
(1, 15, 1, '20GB', '200GB/month', 'VPS', 'Active', '2024-02-06 08:30:00'),
(2, 16, 2, '30GB', '300GB/month', 'VPS', 'Active', '2024-03-22 09:30:00'),
(3, 17, 3, '25GB', '250GB/month', 'VPS', 'Active', '2024-04-28 10:00:00'),
(4, 18, 6, '40GB', '400GB/month', 'Dedicated Server', 'Active', '2024-06-18 11:00:00'),
(5, 19, 7, '15GB', '150GB/month', 'Shared Hosting', 'Active', '2024-08-02 09:00:00');

-- =========================================
-- INSERT DOCUMENTS (13 Documents)
-- =========================================
INSERT INTO documents (id, application_id, file_name, file_path, file_type, uploaded_at) VALUES
(1, 1, 'surat_permohonan_diskominfo_kalbar.pdf', '/uploads/documents/2024/01/surat_permohonan_diskominfo.pdf', 'application/pdf', '2024-01-15 09:15:00'),
(2, 2, 'surat_permohonan_disdikbud_kalbar.pdf', '/uploads/documents/2024/02/surat_permohonan_disdikbud.pdf', 'application/pdf', '2024-02-10 10:30:00'),
(3, 3, 'surat_permohonan_dinkes_kalbar.pdf', '/uploads/documents/2024/03/surat_permohonan_dinkes.pdf', 'application/pdf', '2024-03-05 08:45:00'),
(4, 6, 'surat_permohonan_dispar_kalbar.pdf', '/uploads/documents/2024/05/surat_permohonan_dispar.pdf', 'application/pdf', '2024-05-15 11:15:00'),
(5, 10, 'surat_permohonan_bappeda_kalbar.pdf', '/uploads/documents/2024/09/surat_permohonan_bappeda.pdf', 'application/pdf', '2024-09-01 08:20:00'),
(6, 15, 'spesifikasi_hosting_diskominfo.pdf', '/uploads/documents/2024/02/spesifikasi_hosting_diskominfo.pdf', 'application/pdf', '2024-02-01 10:20:00'),
(7, 15, 'arsitektur_aplikasi_diskominfo.pdf', '/uploads/documents/2024/02/arsitektur_aplikasi_diskominfo.pdf', 'application/pdf', '2024-02-01 10:25:00'),
(8, 16, 'spesifikasi_ppdb_online.pdf', '/uploads/documents/2024/03/spesifikasi_ppdb_online.pdf', 'application/pdf', '2024-03-15 11:45:00'),
(9, 17, 'spesifikasi_sistem_kesehatan.pdf', '/uploads/documents/2024/04/spesifikasi_sistem_kesehatan.pdf', 'application/pdf', '2024-04-20 09:15:00'),
(10, 18, 'proposal_visit_kalbar.pdf', '/uploads/documents/2024/06/proposal_visit_kalbar.pdf', 'application/pdf', '2024-06-10 10:30:00'),
(11, 11, 'surat_permohonan_dishub_kalbar.pdf', '/uploads/documents/2025/11/surat_permohonan_dishub.pdf', 'application/pdf', '2025-11-10 10:45:00'),
(12, 12, 'surat_permohonan_disperindag_kalbar.pdf', '/uploads/documents/2025/11/surat_permohonan_disperindag.pdf', 'application/pdf', '2025-11-12 09:30:00'),
(13, 20, 'spesifikasi_aplikasi_perikanan.pdf', '/uploads/documents/2025/11/spesifikasi_aplikasi_perikanan.pdf', 'application/pdf', '2025-11-11 13:35:00');

-- =========================================
-- INSERT AUDIT LOGS (20 Entries)
-- =========================================
INSERT INTO audit_logs (id, user_id, application_id, action, details, timestamp) VALUES
(1, 1, 1, 'APPROVE_APPLICATION', 'Menyetujui permohonan domain diskominfo.kalbarprov.go.id dari Dinas Komunikasi dan Informatika', '2024-01-18 10:30:00'),
(2, 1, 2, 'APPROVE_APPLICATION', 'Menyetujui permohonan domain disdikbud.kalbarprov.go.id dari Dinas Pendidikan dan Kebudayaan', '2024-02-15 14:00:00'),
(3, 1, 3, 'APPROVE_APPLICATION', 'Menyetujui permohonan domain dinkes.kalbarprov.go.id dari Dinas Kesehatan', '2024-03-10 11:45:00'),
(4, 1, 6, 'APPROVE_APPLICATION', 'Menyetujui permohonan domain dispar.kalbarprov.go.id dari Dinas Pariwisata', '2024-05-20 13:15:00'),
(5, 1, 15, 'APPROVE_APPLICATION', 'Menyetujui permohonan hosting Portal Resmi Diskominfo Kalbar dengan spesifikasi VPS 20GB', '2024-02-05 13:30:00'),
(6, 1, 16, 'APPROVE_APPLICATION', 'Menyetujui permohonan hosting Sistem PPDB Online Kalbar dengan spesifikasi VPS 30GB', '2024-03-20 14:00:00'),
(7, 1, 18, 'APPROVE_APPLICATION', 'Menyetujui permohonan hosting Visit Kalimantan Barat dengan spesifikasi Dedicated Server 40GB', '2024-06-15 13:45:00'),
(8, 1, 14, 'REJECT_APPLICATION', 'Menolak permohonan domain dari Dinas Kehutanan: Nama domain tidak sesuai konvensi penamaan', '2025-10-25 14:15:00'),
(9, 1, 22, 'REJECT_APPLICATION', 'Menolak permohonan hosting dari DPUPR: Spesifikasi teknis tidak memenuhi standar minimum', '2025-10-22 11:30:00'),
(10, 2, 1, 'SUBMIT_APPLICATION', 'Mengajukan permohonan domain diskominfo.kalbarprov.go.id', '2024-01-15 09:00:00'),
(11, 3, 2, 'SUBMIT_APPLICATION', 'Mengajukan permohonan domain disdikbud.kalbarprov.go.id', '2024-02-10 10:15:00'),
(12, 4, 3, 'SUBMIT_APPLICATION', 'Mengajukan permohonan domain dinkes.kalbarprov.go.id', '2024-03-05 08:30:00'),
(13, 1, NULL, 'ACTIVATE_DOMAIN', 'Mengaktifkan domain diskominfo.kalbarprov.go.id dengan masa aktif 2 tahun', '2024-01-20 08:00:00'),
(14, 1, NULL, 'ACTIVATE_DOMAIN', 'Mengaktifkan domain disdikbud.kalbarprov.go.id dengan masa aktif 2 tahun', '2024-02-18 09:00:00'),
(15, 1, NULL, 'ACTIVATE_DOMAIN', 'Mengaktifkan domain dispar.kalbarprov.go.id untuk portal pariwisata Visit Kalbar', '2024-05-22 09:30:00'),
(16, 1, NULL, 'ACTIVATE_HOSTING', 'Mengaktifkan hosting Portal Resmi Diskominfo Kalbar pada VPS dengan kapasitas 20GB', '2024-02-06 08:30:00'),
(17, 1, NULL, 'ACTIVATE_HOSTING', 'Mengaktifkan hosting Sistem PPDB Online pada VPS dengan kapasitas 30GB', '2024-03-22 09:30:00'),
(18, 8, 11, 'SUBMIT_APPLICATION', 'Mengajukan permohonan domain untuk Dinas Perhubungan Kalbar', '2025-11-10 10:30:00'),
(19, 10, 12, 'SUBMIT_APPLICATION', 'Mengajukan permohonan domain untuk Dinas Perindustrian dan Perdagangan', '2025-11-12 09:15:00'),
(20, 1, NULL, 'LOGIN', 'Super Admin masuk ke sistem Domain Manager Kalimantan Barat', '2025-11-14 08:00:00');

SET FOREIGN_KEY_CHECKS = 1;

-- Reset auto increment
ALTER TABLE opds AUTO_INCREMENT = 21;
ALTER TABLE users AUTO_INCREMENT = 16;
ALTER TABLE applications AUTO_INCREMENT = 23;
ALTER TABLE domains AUTO_INCREMENT = 11;
ALTER TABLE hostings AUTO_INCREMENT = 6;
ALTER TABLE documents AUTO_INCREMENT = 14;
ALTER TABLE audit_logs AUTO_INCREMENT = 21;

-- Verification
SELECT '=== DATA SUMMARY ===' as '';
SELECT 'OPDs:' as Item, COUNT(*) as Total FROM opds;
SELECT 'Users:' as Item, COUNT(*) as Total FROM users;
SELECT 'Applications:' as Item, COUNT(*) as Total FROM applications;
SELECT 'Domains:' as Item, COUNT(*) as Total FROM domains;
SELECT 'Hostings:' as Item, COUNT(*) as Total FROM hostings;
SELECT 'Documents:' as Item, COUNT(*) as Total FROM documents;
SELECT 'Audit Logs:' as Item, COUNT(*) as Total FROM audit_logs;
SELECT '' as '';
SELECT '=== SAMPLE DOMAINS ===' as '';
SELECT domain_name, status, DATE_FORMAT(activated_at, '%Y-%m-%d') as activated FROM domains LIMIT 5;
