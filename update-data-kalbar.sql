-- =========================================
-- UPDATE DATABASE DENGAN DATA KALIMANTAN BARAT
-- Script untuk mengupdate data lama (Bandung) ke data baru (Kalbar)
-- Tanggal: 14 November 2025
-- =========================================

USE domain_manager;

-- Nonaktifkan foreign key checks sementara
SET FOREIGN_KEY_CHECKS = 0;

-- =========================================
-- 1. CLEAR DATA LAMA
-- =========================================
-- Note: Table notifications belum ada di database saat ini
-- TRUNCATE TABLE notifications;
TRUNCATE TABLE audit_logs;
TRUNCATE TABLE documents;
TRUNCATE TABLE hostings;
TRUNCATE TABLE domains;
TRUNCATE TABLE applications;
TRUNCATE TABLE users;
TRUNCATE TABLE opds;

-- =========================================
-- 2. INSERT OPD DATA - KALIMANTAN BARAT (20 OPD)
-- =========================================
INSERT INTO opds (id, name, address, contact_person, phone_number, created_at) VALUES
(1, 'Dinas Komunikasi dan Informatika', 'Jl. Ahmad Yani, Pontianak, Kalimantan Barat', 'Ir. Hartoyo, M.T.', '0561-736622', '2024-01-15 08:00:00'),
(2, 'Dinas Pendidikan dan Kebudayaan', 'Jl. Letjen Sutoyo, Pontianak, Kalimantan Barat', 'Dr. Sri Wahyuni, M.Pd.', '0561-735306', '2024-01-15 08:00:00'),
(3, 'Dinas Kesehatan', 'Jl. K. H. Wahid Hasyim No. 249, Pontianak, Kalimantan Barat', 'dr. Harisson, M.Kes., Sp.PD.', '0561-736711', '2024-01-15 08:00:00'),
(4, 'Dinas Pekerjaan Umum dan Penataan Ruang', 'Jl. Alianyang, Pontianak, Kalimantan Barat', 'Ir. Andi Wijaya, M.T.', '0561-583440', '2024-01-15 08:00:00'),
(5, 'Dinas Sosial', 'Jl. Dr. Sutomo, Pontianak, Kalimantan Barat', 'Drs. Bambang Suryanto, M.Si.', '0561-732121', '2024-01-15 08:00:00'),
(6, 'Dinas Tenaga Kerja dan Transmigrasi', 'Jl. Sultan Abdurrahman, Pontianak, Kalimantan Barat', 'Dra. Siti Aminah, M.M.', '0561-736449', '2024-01-15 08:00:00'),
(7, 'Dinas Perhubungan', 'Jl. Jenderal Urip, Pontianak, Kalimantan Barat', 'Ir. Budiman Santoso, M.T.', '0561-765521', '2024-01-15 08:00:00'),
(8, 'Dinas Pariwisata', 'Jl. Sidas, Pontianak, Kalimantan Barat', 'Agustinus Teras Narang, S.Sos., M.Si.', '0561-743415', '2024-01-15 08:00:00'),
(9, 'Dinas Perindustrian dan Perdagangan', 'Jl. A. Yani II, Pontianak, Kalimantan Barat', 'Drs. Hermansyah, M.M.', '0561-736183', '2024-01-15 08:00:00'),
(10, 'Dinas Pertanian dan Hortikultura', 'Jl. Alianyang KM 10, Pontianak, Kalimantan Barat', 'Ir. Suryadi, M.P.', '0561-587711', '2024-01-15 08:00:00'),
(11, 'Dinas Perikanan', 'Jl. Alianyang KM 10, Pontianak, Kalimantan Barat', 'Ir. Muhammad Rizki, M.Si.', '0561-587722', '2024-01-15 08:00:00'),
(12, 'Dinas Kehutanan', 'Jl. Gusti Sulung Lelanang, Pontianak, Kalimantan Barat', 'Dr. Ir. Bambang Heryanto, M.Si.', '0561-736595', '2024-01-15 08:00:00'),
(13, 'Dinas Lingkungan Hidup', 'Jl. Sultan Hamid II, Pontianak, Kalimantan Barat', 'Ir. Ratna Sari Dewi, M.T.', '0561-742444', '2024-01-15 08:00:00'),
(14, 'Dinas Energi dan Sumber Daya Mineral', 'Jl. Achmad Yani, Pontianak, Kalimantan Barat', 'Ir. Hadi Purnomo, M.T.', '0561-736211', '2024-01-15 08:00:00'),
(15, 'Badan Perencanaan Pembangunan Daerah', 'Jl. Letjen Sutoyo, Pontianak, Kalimantan Barat', 'Drs. H. Ahmad Fauzi, M.Si.', '0561-736519', '2024-01-15 08:00:00'),
(16, 'Badan Kepegawaian Daerah', 'Jl. Ahmad Yani, Pontianak, Kalimantan Barat', 'Dra. Hj. Nurlaila, M.M.', '0561-736344', '2024-01-15 08:00:00'),
(17, 'Badan Pengelola Keuangan dan Aset Daerah', 'Jl. Letjen Sutoyo, Pontianak, Kalimantan Barat', 'Drs. Hari Kusuma, M.M., Ak.', '0561-735000', '2024-01-15 08:00:00'),
(18, 'Dinas Pemberdayaan Masyarakat dan Desa', 'Jl. Sultan Abdurrahman, Pontianak, Kalimantan Barat', 'Ir. H. Syamsul Bahri, M.Si.', '0561-736566', '2024-01-15 08:00:00'),
(19, 'Dinas Kependudukan dan Pencatatan Sipil', 'Jl. Ahmad Yani, Pontianak, Kalimantan Barat', 'Drs. Agus Riyanto, M.Si.', '0561-742233', '2024-01-15 08:00:00'),
(20, 'Satuan Polisi Pamong Praja', 'Jl. Letjen Sutoyo, Pontianak, Kalimantan Barat', 'Drs. H. Yusuf Hidayat, M.M.', '0561-736455', '2024-01-15 08:00:00');

-- =========================================
-- 3. INSERT USERS DATA - KALIMANTAN BARAT (15 Users)
-- =========================================
INSERT INTO users (id, username, email, password_hash, role, opd_id, nip, whatsapp, is_active, created_at) VALUES
(1, 'superadmin', 'superadmin@kalbarprov.go.id', '$2a$10$dummyhash', 'Super Admin', 1, '197805152003121001', '081511223344', 1, '2024-01-15 08:00:00'),
(2, 'admin.diskominfo', 'admin.diskominfo@kalbarprov.go.id', '$2a$10$dummyhash', 'Admin Daerah', 1, '198205102005012003', '081511223345', 1, '2024-01-15 08:00:00'),
(3, 'admin.disdikbud', 'admin.disdikbud@kalbarprov.go.id', '$2a$10$dummyhash', 'Admin Daerah', 2, '197909252006042002', '081511223346', 1, '2024-01-15 08:00:00'),
(4, 'admin.dinkes', 'admin.dinkes@kalbarprov.go.id', '$2a$10$dummyhash', 'Admin Daerah', 3, '198103152007011004', '081511223347', 1, '2024-01-15 08:00:00'),
(5, 'admin.dpupr', 'admin.dpupr@kalbarprov.go.id', '$2a$10$dummyhash', 'Admin Daerah', 4, '197712202008011005', '081511223348', 1, '2024-01-15 08:00:00'),
(6, 'admin.dinsos', 'admin.dinsos@kalbarprov.go.id', '$2a$10$dummyhash', 'Admin Daerah', 5, '198006302009011006', '081511223349', 1, '2024-01-15 08:00:00'),
(7, 'admin.disnakertrans', 'admin.disnakertrans@kalbarprov.go.id', '$2a$10$dummyhash', 'Admin Daerah', 6, '198304152010012007', '081511223350', 1, '2024-01-15 08:00:00'),
(8, 'admin.dishub', 'admin.dishub@kalbarprov.go.id', '$2a$10$dummyhash', 'Admin Daerah', 7, '197808252011011008', '081511223351', 1, '2024-01-15 08:00:00'),
(9, 'admin.dispar', 'admin.dispar@kalbarprov.go.id', '$2a$10$dummyhash', 'Admin Daerah', 8, '198512102012011009', '081511223352', 1, '2024-01-15 08:00:00'),
(10, 'admin.disperindag', 'admin.disperindag@kalbarprov.go.id', '$2a$10$dummyhash', 'Admin Daerah', 9, '198701182013011010', '081511223353', 1, '2024-01-15 08:00:00'),
(11, 'admin.distanhort', 'admin.distanhort@kalbarprov.go.id', '$2a$10$dummyhash', 'Admin Daerah', 10, '197905202014011011', '081511223354', 1, '2024-01-15 08:00:00'),
(12, 'admin.diskan', 'admin.diskan@kalbarprov.go.id', '$2a$10$dummyhash', 'Admin Daerah', 11, '198808152015011012', '081511223355', 1, '2024-01-15 08:00:00'),
(13, 'admin.dishut', 'admin.dishut@kalbarprov.go.id', '$2a$10$dummyhash', 'Admin Daerah', 12, '197606252016011013', '081511223356', 1, '2024-01-15 08:00:00'),
(14, 'admin.dlh', 'admin.dlh@kalbarprov.go.id', '$2a$10$dummyhash', 'Admin Daerah', 13, '198403102017012014', '081511223357', 1, '2024-01-15 08:00:00'),
(15, 'admin.desdm', 'admin.desdm@kalbarprov.go.id', '$2a$10$dummyhash', 'Admin Daerah', 14, '197910152018011015', '081511223358', 1, '2024-01-15 08:00:00');

-- =========================================
-- 4. INSERT APPLICATIONS DATA (22 Applications)
-- =========================================
-- Domain Applications (Approved - 10)
INSERT INTO applications (id, application_type, opd_id, submitter_id, status, submitted_at, approved_at, last_updated_by) VALUES
(1, 'domain', 1, 2, 'Approved', '2024-01-15 09:00:00', '2024-01-18 10:30:00', 1),
(2, 'domain', 2, 3, 'Approved', '2024-02-10 10:15:00', '2024-02-15 14:00:00', 1),
(3, 'domain', 3, 4, 'Approved', '2024-03-05 08:30:00', '2024-03-10 11:45:00', 1),
(4, 'domain', 4, 5, 'Approved', '2024-03-20 13:00:00', '2024-03-25 15:30:00', 1),
(5, 'domain', 5, 6, 'Approved', '2024-04-08 09:20:00', '2024-04-12 10:00:00', 1),
(6, 'domain', 8, 9, 'Approved', '2024-05-15 11:00:00', '2024-05-20 13:15:00', 1),
(7, 'domain', 10, 11, 'Approved', '2024-06-20 08:45:00', '2024-06-25 10:30:00', 1),
(8, 'domain', 11, 12, 'Approved', '2024-07-10 10:00:00', '2024-07-15 14:20:00', 1),
(9, 'domain', 13, 14, 'Approved', '2024-08-05 09:30:00', '2024-08-10 11:00:00', 1),
(10, 'domain', 15, 1, 'Approved', '2024-09-01 08:00:00', '2024-09-05 10:00:00', 1),
-- Domain Applications (Pending - 3)
(11, 'domain', 7, 8, 'Pending', '2025-11-10 10:30:00', NULL, NULL),
(12, 'domain', 9, 10, 'Pending', '2025-11-12 09:15:00', NULL, NULL),
(13, 'domain', 6, 7, 'Pending', '2025-11-13 14:00:00', NULL, NULL),
-- Domain Applications (Rejected - 1)
(14, 'domain', 12, 13, 'Rejected', '2025-10-20 11:30:00', '2025-10-25 14:15:00', 1),
-- Hosting Applications (Approved - 5)
(15, 'hosting', 1, 2, 'Approved', '2024-02-01 10:00:00', '2024-02-05 13:30:00', 1),
(16, 'hosting', 2, 3, 'Approved', '2024-03-15 11:30:00', '2024-03-20 14:00:00', 1),
(17, 'hosting', 3, 4, 'Approved', '2024-04-20 09:00:00', '2024-04-25 11:30:00', 1),
(18, 'hosting', 8, 9, 'Approved', '2024-06-10 10:15:00', '2024-06-15 13:45:00', 1),
(19, 'hosting', 10, 11, 'Approved', '2024-07-25 08:30:00', '2024-07-30 10:00:00', 1),
-- Hosting Applications (Pending - 2)
(20, 'hosting', 11, 12, 'Pending', '2025-11-11 13:20:00', NULL, NULL),
(21, 'hosting', 13, 14, 'Pending', '2025-11-13 10:45:00', NULL, NULL),
-- Hosting Applications (Rejected - 1)
(22, 'hosting', 4, 5, 'Rejected', '2025-10-18 09:00:00', '2025-10-22 11:30:00', 1);

-- Update rejection reasons
UPDATE applications SET reason = 'Nama domain tidak sesuai dengan konvensi penamaan yang ditetapkan. Gunakan format: [nama-dinas].kalbarprov.go.id' WHERE id = 14;
UPDATE applications SET reason = 'Spesifikasi teknis yang diajukan tidak memenuhi standar minimum untuk aplikasi yang akan di-hosting' WHERE id = 22;

-- =========================================
-- 5. INSERT DOMAINS DATA (10 Active Domains)
-- =========================================
INSERT INTO domains (id, application_id, domain_name, status, activated_at, expires_at, opd_id) VALUES
(1, 1, 'diskominfo.kalbarprov.go.id', 'Active', '2024-01-20 08:00:00', '2026-01-20 08:00:00', 1),
(2, 2, 'disdikbud.kalbarprov.go.id', 'Active', '2024-02-18 09:00:00', '2026-02-18 09:00:00', 2),
(3, 3, 'dinkes.kalbarprov.go.id', 'Active', '2024-03-12 10:00:00', '2026-03-12 10:00:00', 3),
(4, 4, 'dpupr.kalbarprov.go.id', 'Active', '2024-03-28 08:30:00', '2026-03-28 08:30:00', 4),
(5, 5, 'dinsos.kalbarprov.go.id', 'Active', '2024-04-15 11:00:00', '2026-04-15 11:00:00', 5),
(6, 6, 'dispar.kalbarprov.go.id', 'Active', '2024-05-22 09:30:00', '2026-05-22 09:30:00', 8),
(7, 7, 'distanhort.kalbarprov.go.id', 'Active', '2024-06-28 10:00:00', '2026-06-28 10:00:00', 10),
(8, 8, 'diskan.kalbarprov.go.id', 'Active', '2024-07-18 08:00:00', '2026-07-18 08:00:00', 11),
(9, 9, 'dlh.kalbarprov.go.id', 'Active', '2024-08-12 11:30:00', '2026-08-12 11:30:00', 13),
(10, 10, 'bappeda.kalbarprov.go.id', 'Active', '2024-09-08 09:00:00', '2026-09-08 09:00:00', 15);

-- =========================================
-- 6. INSERT HOSTINGS DATA (5 Active Hostings)
-- =========================================
INSERT INTO hostings (id, application_id, domain_id, storage_capacity, bandwidth, server_type, status, activated_at) VALUES
(1, 15, 1, '20GB', '200GB/month', 'VPS', 'Active', '2024-02-06 08:30:00'),
(2, 16, 2, '30GB', '300GB/month', 'VPS', 'Active', '2024-03-22 09:30:00'),
(3, 17, 3, '25GB', '250GB/month', 'VPS', 'Active', '2024-04-28 10:00:00'),
(4, 18, 6, '40GB', '400GB/month', 'Dedicated Server', 'Active', '2024-06-18 11:00:00'),
(5, 19, 7, '15GB', '150GB/month', 'Shared Hosting', 'Active', '2024-08-02 09:00:00');

-- =========================================
-- 7. INSERT DOCUMENTS DATA (13 Documents)
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
-- 8. INSERT AUDIT LOGS DATA (20 Entries)
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

-- =========================================
-- 9. INSERT NOTIFICATIONS DATA (14 Notifications)
-- =========================================
-- Note: Table notifications belum ada di database saat ini
-- Akan diinsert setelah tabel dibuat di migration berikutnya
/*
INSERT INTO notifications (id, user_id, message, type, status, related_entity_type, related_entity_id, link, created_at, read_at, expires_at, is_email_sent) VALUES
(1, 2, 'Permohonan domain diskominfo.kalbarprov.go.id telah disetujui oleh Super Admin', 'domain', 'read', 'application', 1, '/applications/1', '2024-01-18 10:35:00', '2024-01-18 11:00:00', '2026-01-18 10:35:00', 1),
(2, 3, 'Permohonan domain disdikbud.kalbarprov.go.id telah disetujui dan siap diaktifkan', 'domain', 'read', 'application', 2, '/applications/2', '2024-02-15 14:05:00', '2024-02-15 15:30:00', '2026-02-15 14:05:00', 1),
(3, 9, 'Permohonan domain dispar.kalbarprov.go.id telah disetujui untuk portal Visit Kalimantan Barat', 'domain', 'read', 'application', 6, '/applications/6', '2024-05-20 13:20:00', '2024-05-20 14:00:00', '2026-05-20 13:20:00', 1),
(4, 2, 'Permohonan hosting Portal Resmi Diskominfo Kalbar telah disetujui dengan spesifikasi VPS 20GB', 'hosting', 'read', 'application', 15, '/hosting-applications/15', '2024-02-05 13:35:00', '2024-02-05 14:00:00', '2026-02-05 13:35:00', 1),
(5, 3, 'Hosting Sistem PPDB Online Kalbar telah aktif dan siap digunakan', 'hosting', 'read', 'hosting', 2, '/hosting/2', '2024-03-22 09:35:00', '2024-03-22 10:00:00', '2026-03-22 09:35:00', 1),
(6, 2, 'Domain diskominfo.kalbarprov.go.id akan kedaluwarsa dalam 90 hari. Segera lakukan perpanjangan', 'perpanjangan', 'unread', 'domain', 1, '/domains/1', '2025-10-22 08:00:00', NULL, '2026-04-22 08:00:00', 1),
(7, 3, 'Domain disdikbud.kalbarprov.go.id akan kedaluwarsa dalam 90 hari. Harap segera perpanjang domain', 'perpanjangan', 'unread', 'domain', 2, '/domains/2', '2025-11-20 08:00:00', NULL, '2026-05-20 08:00:00', 1),
(8, 13, 'Permohonan domain Dinas Kehutanan ditolak. Nama domain tidak sesuai konvensi penamaan', 'domain', 'read', 'application', 14, '/applications/14', '2025-10-25 14:20:00', '2025-10-25 15:00:00', '2026-04-25 14:20:00', 1),
(9, 5, 'Permohonan hosting DPUPR ditolak. Spesifikasi teknis tidak memenuhi standar minimum', 'hosting', 'read', 'application', 22, '/hosting-applications/22', '2025-10-22 11:35:00', '2025-10-22 13:00:00', '2026-04-22 11:35:00', 1),
(10, 1, 'Ada 3 permohonan domain baru menunggu persetujuan dari Dishub, Disperindag, dan Disnakertrans', 'system', 'unread', NULL, NULL, '/applications?status=Pending&type=domain', '2025-11-13 15:00:00', NULL, '2026-05-13 15:00:00', 0),
(11, 1, 'Ada 2 permohonan hosting menunggu persetujuan dari Dinas Perikanan dan Dinas Lingkungan Hidup', 'system', 'unread', NULL, NULL, '/hosting-applications?status=Pending', '2025-11-13 15:05:00', NULL, '2026-05-13 15:05:00', 0),
(12, 8, 'Permohonan domain untuk Dinas Perhubungan telah diterima dan sedang dalam proses review', 'domain', 'read', 'application', 11, '/applications/11', '2025-11-10 10:35:00', '2025-11-10 11:00:00', '2026-05-10 10:35:00', 1),
(13, 12, 'Permohonan hosting aplikasi perikanan telah diterima dan sedang dalam proses evaluasi', 'hosting', 'unread', 'application', 20, '/hosting-applications/20', '2025-11-11 13:25:00', NULL, '2026-05-11 13:25:00', 1),
(14, 1, 'Maintenance server dijadwalkan pada 20 November 2025 pukul 01:00 - 05:00 WIB', 'system', 'unread', NULL, NULL, '/settings/maintenance', '2025-11-14 09:00:00', NULL, '2025-11-20 05:00:00', 0);
*/

-- Aktifkan kembali foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- =========================================
-- RESET AUTO INCREMENT
-- =========================================
ALTER TABLE opds AUTO_INCREMENT = 21;
ALTER TABLE users AUTO_INCREMENT = 16;
ALTER TABLE applications AUTO_INCREMENT = 23;
ALTER TABLE domains AUTO_INCREMENT = 11;
ALTER TABLE hostings AUTO_INCREMENT = 6;
ALTER TABLE documents AUTO_INCREMENT = 14;
ALTER TABLE audit_logs AUTO_INCREMENT = 21;
-- ALTER TABLE notifications AUTO_INCREMENT = 15; -- Table belum ada

-- =========================================
-- VERIFICATION QUERIES
-- =========================================
SELECT 'OPDs Count:' as Info, COUNT(*) as Total FROM opds;
SELECT 'Users Count:' as Info, COUNT(*) as Total FROM users;
SELECT 'Applications Count:' as Info, COUNT(*) as Total FROM applications;
SELECT 'Domains Count:' as Info, COUNT(*) as Total FROM domains;
SELECT 'Hostings Count:' as Info, COUNT(*) as Total FROM hostings;
SELECT 'Documents Count:' as Info, COUNT(*) as Total FROM documents;
SELECT 'Audit Logs Count:' as Info, COUNT(*) as Total FROM audit_logs;
-- SELECT 'Notifications Count:' as Info, COUNT(*) as Total FROM notifications; -- Table belum ada

-- Show sample data
SELECT 'Sample Domains:' as Info;
SELECT id, domain_name, status FROM domains LIMIT 5;

SELECT 'Sample Users:' as Info;
SELECT id, username, email, role FROM users LIMIT 5;

-- =========================================
-- SELESAI!
-- =========================================
-- Data Kalimantan Barat berhasil diimport ke database
-- Total: 20 OPD, 15 Users, 22 Applications, 10 Domains, 5 Hostings
-- =========================================
