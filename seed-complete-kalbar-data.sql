-- =====================================================
-- COMPLETE DUMMY DATA FOR DOMAIN MANAGER KALBAR
-- Includes all features and conditions
-- Date: 2025-11-18
-- =====================================================

USE domain_manager;

-- Clear existing data (in correct order due to foreign keys)
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE reactivation_documents;
TRUNCATE TABLE reactivation_requests;
TRUNCATE TABLE deactivation_documents;
TRUNCATE TABLE deactivation_requests;
TRUNCATE TABLE notifications;
TRUNCATE TABLE audit_logs;
TRUNCATE TABLE documents;
TRUNCATE TABLE hostings;
TRUNCATE TABLE domains;
TRUNCATE TABLE applications;
TRUNCATE TABLE users;
TRUNCATE TABLE opds;
SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================
-- OPDs (Organisasi Perangkat Daerah)
-- =====================================================
INSERT INTO opds (id, name, address, contact_person, phone_number, created_at) VALUES
(1, 'Dinas Komunikasi dan Informatika', 'Jl. Ahmad Yani, Pontianak, Kalimantan Barat', 'Ir. Hartoyo, M.T.', '0561-736622', '2024-01-15 08:00:00'),
(2, 'Dinas Pendidikan dan Kebudayaan', 'Jl. Letjen Sutoyo, Pontianak, Kalimantan Barat', 'Dr. Sri Wahyuni, M.Pd.', '0561-735306', '2024-01-15 08:00:00'),
(3, 'Dinas Kesehatan', 'Jl. K. H. Wahid Hasyim No. 249, Pontianak, Kalimantan Barat', 'dr. Harisson, M.Kes., Sp.PD.', '0561-736711', '2024-01-15 08:00:00'),
(4, 'Dinas Pekerjaan Umum dan Penataan Ruang', 'Jl. Jend. Urip Sumoharjo, Pontianak, Kalimantan Barat', 'Ir. Andi Wijaya, M.T.', '0561-736415', '2024-01-15 08:00:00'),
(5, 'Dinas Sosial', 'Jl. Sultan Abdurrahman, Pontianak, Kalimantan Barat', 'Bambang Suryanto, S.Sos., M.Si.', '0561-734128', '2024-01-15 08:00:00'),
(6, 'Dinas Perhubungan', 'Jl. Khatulistiwa, Pontianak, Kalimantan Barat', 'Drs. Iskandar, M.M.', '0561-767890', '2024-01-15 08:00:00'),
(7, 'Dinas Pariwisata', 'Jl. Gajah Mada No. 168, Pontianak, Kalimantan Barat', 'Siti Nurhaliza, S.Par., M.M.', '0561-742567', '2024-01-15 08:00:00'),
(8, 'Dinas Pertanian', 'Jl. Imam Bonjol, Pontianak, Kalimantan Barat', 'Ir. Ahmad Dahlan, M.P.', '0561-738901', '2024-01-15 08:00:00'),
(9, 'Dinas Perikanan', 'Jl. Patimura No. 45, Pontianak, Kalimantan Barat', 'Ir. Budi Santoso, M.Si.', '0561-745678', '2024-01-15 08:00:00'),
(10, 'Dinas Perdagangan', 'Jl. Diponegoro No. 25, Pontianak, Kalimantan Barat', 'Dra. Siti Aminah, M.M.', '0561-756789', '2024-01-15 08:00:00'),
(11, 'Badan Perencanaan Pembangunan Daerah', 'Jl. Kom Yos Sudarso, Pontianak, Kalimantan Barat', 'Drs. Hendra Gunawan, M.Si.', '0561-765432', '2024-01-15 08:00:00'),
(12, 'Badan Pengelolaan Keuangan dan Aset Daerah', 'Jl. Rahadi Usman, Pontianak, Kalimantan Barat', 'Drs. Agus Salim, M.M.', '0561-778899', '2024-01-15 08:00:00'),
(13, 'Badan Kepegawaian Daerah', 'Jl. Sultan Syarif Abdurrahman, Pontianak, Kalimantan Barat', 'Dra. Ratna Sari, M.Si.', '0561-712345', '2024-01-15 08:00:00'),
(14, 'Dinas Lingkungan Hidup', 'Jl. Adisucipto, Pontianak, Kalimantan Barat', 'Ir. Eko Prasetyo, M.T.', '0561-798765', '2024-01-15 08:00:00'),
(15, 'Dinas Perindustrian', 'Jl. A. Yani Km 5, Pontianak, Kalimantan Barat', 'Ir. Budiman, M.T.', '0561-723456', '2024-01-15 08:00:00'),
(16, 'Satuan Polisi Pamong Praja', 'Jl. Jend. Sudirman, Pontianak, Kalimantan Barat', 'Kombes Pol. Rudi Hartono', '0561-734567', '2024-01-15 08:00:00'),
(17, 'Dinas Kependudukan dan Pencatatan Sipil', 'Jl. Prof. M. Yamin, Pontianak, Kalimantan Barat', 'Drs. Firman Syah, M.Si.', '0561-756543', '2024-01-15 08:00:00'),
(18, 'Dinas Pemberdayaan Masyarakat', 'Jl. Tanjungpura, Pontianak, Kalimantan Barat', 'Dra. Mega Wati, M.M.', '0561-767654', '2024-01-15 08:00:00'),
(19, 'Dinas Pemuda dan Olahraga', 'Jl. Stadion, Pontianak, Kalimantan Barat', 'Drs. Tono Suratno, M.Pd.', '0561-778765', '2024-01-15 08:00:00'),
(20, 'Dinas Perpustakaan dan Kearsipan', 'Jl. Sutan Syahrir, Pontianak, Kalimantan Barat', 'Dra. Lilis Suryani, M.Pd.', '0561-789876', '2024-01-15 08:00:00');

-- =====================================================
-- USERS
-- =====================================================
INSERT INTO users (id, username, email, role, opd_id, is_active, created_at) VALUES
-- Super Admin
(1, 'Hartoyo', 'superadmin@kalbarprov.go.id', 'Super Admin', 1, TRUE, '2024-01-15 08:00:00'),
-- Admin Daerah untuk setiap OPD (20 Admin Daerah)
(2, 'Rina Kusumawati', 'admin.diskominfo@kalbarprov.go.id', 'Admin Daerah', 1, TRUE, '2024-01-15 09:00:00'),
(3, 'Sri Wahyuni', 'admin.disdikbud@kalbarprov.go.id', 'Admin Daerah', 2, TRUE, '2024-01-15 09:00:00'),
(4, 'Harisson', 'admin.dinkes@kalbarprov.go.id', 'Admin Daerah', 3, TRUE, '2024-01-15 09:00:00'),
(5, 'Andi Wijaya', 'admin.dpupr@kalbarprov.go.id', 'Admin Daerah', 4, TRUE, '2024-01-15 09:00:00'),
(6, 'Bambang Suryanto', 'admin.dinsos@kalbarprov.go.id', 'Admin Daerah', 5, TRUE, '2024-01-15 09:00:00'),
(7, 'Iskandar', 'admin.dishub@kalbarprov.go.id', 'Admin Daerah', 6, TRUE, '2024-01-15 09:00:00'),
(8, 'Siti Nurhaliza', 'admin.dispar@kalbarprov.go.id', 'Admin Daerah', 7, TRUE, '2024-01-15 09:00:00'),
(9, 'Ahmad Dahlan', 'admin.disperta@kalbarprov.go.id', 'Admin Daerah', 8, TRUE, '2024-01-15 09:00:00'),
(10, 'Budi Santoso', 'admin.dkp@kalbarprov.go.id', 'Admin Daerah', 9, TRUE, '2024-01-15 09:00:00'),
(11, 'Siti Aminah', 'admin.disdag@kalbarprov.go.id', 'Admin Daerah', 10, TRUE, '2024-01-15 09:00:00'),
(12, 'Hendra Gunawan', 'admin.bappeda@kalbarprov.go.id', 'Admin Daerah', 11, TRUE, '2024-01-15 09:00:00'),
(13, 'Agus Salim', 'admin.bpkad@kalbarprov.go.id', 'Admin Daerah', 12, TRUE, '2024-01-15 09:00:00'),
(14, 'Ratna Sari', 'admin.bkd@kalbarprov.go.id', 'Admin Daerah', 13, TRUE, '2024-01-15 09:00:00'),
(15, 'Eko Prasetyo', 'admin.dlh@kalbarprov.go.id', 'Admin Daerah', 14, TRUE, '2024-01-15 09:00:00'),
(16, 'Budiman', 'admin.disperindag@kalbarprov.go.id', 'Admin Daerah', 15, TRUE, '2024-01-15 09:00:00'),
(17, 'Rudi Hartono', 'admin.satpolpp@kalbarprov.go.id', 'Admin Daerah', 16, TRUE, '2024-01-15 09:00:00'),
(18, 'Firman Syah', 'admin.disdukcapil@kalbarprov.go.id', 'Admin Daerah', 17, TRUE, '2024-01-15 09:00:00'),
(19, 'Mega Wati', 'admin.dpmd@kalbarprov.go.id', 'Admin Daerah', 18, TRUE, '2024-01-15 09:00:00'),
(20, 'Tono Suratno', 'admin.dispora@kalbarprov.go.id', 'Admin Daerah', 19, TRUE, '2024-01-15 09:00:00'),
(21, 'Lilis Suryani', 'admin.perpusda@kalbarprov.go.id', 'Admin Daerah', 20, TRUE, '2024-01-15 09:00:00'),
-- User tidak aktif untuk testing
(22, 'User Inactive', 'inactive@kalbarprov.go.id', 'Admin Daerah', 1, FALSE, '2024-01-15 09:00:00');

-- =====================================================
-- APPLICATIONS - Domain Subdomain (berbagai status)
-- =====================================================
INSERT INTO applications (id, application_type, opd_id, submitter_id, status, reason, submitted_at, approved_at, last_updated_by) VALUES
-- APPROVED applications (15 aplikasi sudah disetujui)
(1, 'domain', 1, 2, 'Approved', NULL, '2024-02-01 10:00:00', '2024-02-02 14:00:00', 1),
(2, 'domain', 2, 3, 'Approved', NULL, '2024-02-05 09:30:00', '2024-02-06 11:00:00', 1),
(3, 'domain', 3, 4, 'Approved', NULL, '2024-02-10 14:20:00', '2024-02-11 10:30:00', 1),
(4, 'domain', 4, 5, 'Approved', NULL, '2024-03-01 08:15:00', '2024-03-02 09:00:00', 1),
(5, 'domain', 5, 6, 'Approved', NULL, '2024-03-05 11:45:00', '2024-03-06 13:30:00', 1),
(6, 'domain', 6, 7, 'Approved', NULL, '2024-03-10 10:30:00', '2024-03-11 15:00:00', 1),
(7, 'domain', 7, 8, 'Approved', NULL, '2024-03-15 09:00:00', '2024-03-16 10:30:00', 1),
(8, 'domain', 8, 9, 'Approved', NULL, '2024-04-01 13:20:00', '2024-04-02 14:00:00', 1),
(9, 'domain', 9, 10, 'Approved', NULL, '2024-04-05 08:30:00', '2024-04-06 09:45:00', 1),
(10, 'domain', 10, 11, 'Approved', NULL, '2024-04-10 14:00:00', '2024-04-11 16:00:00', 1),
(11, 'domain', 11, 12, 'Approved', NULL, '2024-05-01 10:15:00', '2024-05-02 11:30:00', 1),
(12, 'domain', 12, 13, 'Approved', NULL, '2024-05-05 09:45:00', '2024-05-06 10:00:00', 1),
(13, 'domain', 13, 14, 'Approved', NULL, '2024-05-10 11:30:00', '2024-05-11 13:00:00', 1),
(14, 'domain', 14, 15, 'Approved', NULL, '2024-06-01 08:45:00', '2024-06-02 09:30:00', 1),
(15, 'domain', 15, 16, 'Approved', NULL, '2024-06-05 14:30:00', '2024-06-06 15:45:00', 1),

-- PENDING applications (7 aplikasi menunggu persetujuan)
(16, 'domain', 16, 17, 'Pending', NULL, '2024-11-10 10:00:00', NULL, NULL),
(17, 'domain', 17, 18, 'Pending', NULL, '2024-11-11 09:30:00', NULL, NULL),
(18, 'domain', 18, 19, 'Pending', NULL, '2024-11-12 14:20:00', NULL, NULL),
(19, 'domain', 19, 20, 'Pending', NULL, '2024-11-13 11:15:00', NULL, NULL),
(20, 'domain', 20, 21, 'Pending', NULL, '2024-11-14 08:45:00', NULL, NULL),
(21, 'domain', 1, 2, 'Pending', NULL, '2024-11-15 10:30:00', NULL, NULL),
(22, 'domain', 2, 3, 'Pending', NULL, '2024-11-16 13:00:00', NULL, NULL),

-- REJECTED applications (3 aplikasi ditolak)
(23, 'domain', 3, 4, 'Rejected', 'Nama domain tidak sesuai dengan kebijakan penamaan domain pemerintah Kalbar', '2024-10-01 10:00:00', '2024-10-02 14:30:00', 1),
(24, 'domain', 4, 5, 'Rejected', 'Dokumen persyaratan tidak lengkap', '2024-10-05 09:00:00', '2024-10-06 11:00:00', 1),
(25, 'domain', 5, 6, 'Rejected', 'Permohonan tidak sesuai dengan kewenangan OPD', '2024-10-10 14:00:00', '2024-10-11 16:00:00', 1);

-- =====================================================
-- APPLICATIONS - Hosting (berbagai status)
-- =====================================================
INSERT INTO applications (id, application_type, opd_id, submitter_id, status, reason, submitted_at, approved_at, last_updated_by) VALUES
-- APPROVED hosting applications (10 hosting disetujui)
(26, 'hosting', 1, 2, 'Approved', NULL, '2024-02-03 10:00:00', '2024-02-04 14:00:00', 1),
(27, 'hosting', 2, 3, 'Approved', NULL, '2024-02-07 09:30:00', '2024-02-08 11:00:00', 1),
(28, 'hosting', 3, 4, 'Approved', NULL, '2024-03-03 14:20:00', '2024-03-04 10:30:00', 1),
(29, 'hosting', 4, 5, 'Approved', NULL, '2024-03-07 08:15:00', '2024-03-08 09:00:00', 1),
(30, 'hosting', 5, 6, 'Approved', NULL, '2024-04-03 11:45:00', '2024-04-04 13:30:00', 1),
(31, 'hosting', 6, 7, 'Approved', NULL, '2024-04-07 10:30:00', '2024-04-08 15:00:00', 1),
(32, 'hosting', 7, 8, 'Approved', NULL, '2024-05-03 09:00:00', '2024-05-04 10:30:00', 1),
(33, 'hosting', 8, 9, 'Approved', NULL, '2024-05-07 13:20:00', '2024-05-08 14:00:00', 1),
(34, 'hosting', 9, 10, 'Approved', NULL, '2024-06-03 08:30:00', '2024-06-04 09:45:00', 1),
(35, 'hosting', 10, 11, 'Approved', NULL, '2024-06-07 14:00:00', '2024-06-08 16:00:00', 1),

-- PENDING hosting applications (5 hosting menunggu)
(36, 'hosting', 11, 12, 'Pending', NULL, '2024-11-10 10:00:00', NULL, NULL),
(37, 'hosting', 12, 13, 'Pending', NULL, '2024-11-11 09:30:00', NULL, NULL),
(38, 'hosting', 13, 14, 'Pending', NULL, '2024-11-12 14:20:00', NULL, NULL),
(39, 'hosting', 14, 15, 'Pending', NULL, '2024-11-13 11:15:00', NULL, NULL),
(40, 'hosting', 15, 16, 'Pending', NULL, '2024-11-14 08:45:00', NULL, NULL),

-- REJECTED hosting applications (2 hosting ditolak)
(41, 'hosting', 16, 17, 'Rejected', 'Kapasitas penyimpanan yang diminta melebihi alokasi standar', '2024-10-01 10:00:00', '2024-10-02 14:30:00', 1),
(42, 'hosting', 17, 18, 'Rejected', 'Spesifikasi teknis tidak memenuhi standar keamanan', '2024-10-05 09:00:00', '2024-10-06 11:00:00', 1);

-- =====================================================
-- DOMAINS (berbagai status: Active, Suspended, Deactivated)
-- =====================================================
INSERT INTO domains (id, application_id, domain_name, status, activated_at, expires_at) VALUES
-- Active domains (10 domain aktif)
(1, 1, 'diskominfo.kalbarprov.go.id', 'Active', '2024-02-02 14:00:00', '2025-02-02 14:00:00'),
(2, 2, 'disdikbud.kalbarprov.go.id', 'Active', '2024-02-06 11:00:00', '2025-02-06 11:00:00'),
(3, 3, 'dinkes.kalbarprov.go.id', 'Active', '2024-02-11 10:30:00', '2025-02-11 10:30:00'),
(4, 4, 'dpupr.kalbarprov.go.id', 'Active', '2024-03-02 09:00:00', '2025-03-02 09:00:00'),
(5, 5, 'dinsos.kalbarprov.go.id', 'Active', '2024-03-06 13:30:00', '2025-03-06 13:30:00'),
(6, 6, 'dishub.kalbarprov.go.id', 'Active', '2024-03-11 15:00:00', '2025-03-11 15:00:00'),
(7, 7, 'dispar.kalbarprov.go.id', 'Active', '2024-03-16 10:30:00', '2025-03-16 10:30:00'),
(8, 8, 'disperta.kalbarprov.go.id', 'Active', '2024-04-02 14:00:00', '2025-04-02 14:00:00'),
(9, 9, 'dkp.kalbarprov.go.id', 'Active', '2024-04-06 09:45:00', '2025-04-06 09:45:00'),
(10, 10, 'disdag.kalbarprov.go.id', 'Active', '2024-04-11 16:00:00', '2025-04-11 16:00:00'),

-- Suspended domains (3 domain ditangguhkan - untuk testing reactivation)
(11, 11, 'bappeda.kalbarprov.go.id', 'Suspended', '2024-05-02 11:30:00', '2025-05-02 11:30:00'),
(12, 12, 'bpkad.kalbarprov.go.id', 'Suspended', '2024-05-06 10:00:00', '2025-05-06 10:00:00'),
(13, 13, 'bkd.kalbarprov.go.id', 'Suspended', '2024-05-11 13:00:00', '2025-05-11 13:00:00'),

-- Deactivated domains (2 domain dinonaktifkan - untuk testing reactivation)
(14, 14, 'dlh.kalbarprov.go.id', 'Deactivated', '2024-06-02 09:30:00', '2025-06-02 09:30:00'),
(15, 15, 'disperindag.kalbarprov.go.id', 'Deactivated', '2024-06-06 15:45:00', '2025-06-06 15:45:00');

-- =====================================================
-- HOSTINGS (berbagai status)
-- =====================================================
INSERT INTO hostings (id, application_id, domain_id, storage_capacity, bandwidth, server_type, status, activated_at) VALUES
-- Active hostings
(1, 26, 1, '10 GB', 'Unlimited', 'Shared', 'Active', '2024-02-04 14:00:00'),
(2, 27, 2, '20 GB', 'Unlimited', 'VPS', 'Active', '2024-02-08 11:00:00'),
(3, 28, 3, '15 GB', 'Unlimited', 'Shared', 'Active', '2024-03-04 10:30:00'),
(4, 29, 4, '25 GB', 'Unlimited', 'VPS', 'Active', '2024-03-08 09:00:00'),
(5, 30, 5, '10 GB', 'Unlimited', 'Shared', 'Active', '2024-04-04 13:30:00'),
(6, 31, 6, '30 GB', 'Unlimited', 'Dedicated', 'Active', '2024-04-08 15:00:00'),
(7, 32, 7, '15 GB', 'Unlimited', 'Shared', 'Active', '2024-05-04 10:30:00'),
(8, 33, 8, '20 GB', 'Unlimited', 'VPS', 'Active', '2024-05-08 14:00:00'),
(9, 34, 9, '10 GB', 'Unlimited', 'Shared', 'Active', '2024-06-04 09:45:00'),
(10, 35, 10, '40 GB', 'Unlimited', 'Dedicated', 'Active', '2024-06-08 16:00:00');

-- =====================================================
-- DOCUMENTS (dokumen untuk aplikasi)
-- =====================================================
INSERT INTO documents (id, application_id, file_name, file_path, file_type, uploaded_at) VALUES
-- Documents for approved domain applications
(1, 1, 'surat_permohonan_diskominfo.pdf', '/uploads/applications/1/surat_permohonan.pdf', 'application/pdf', '2024-02-01 10:05:00'),
(2, 1, 'proposal_diskominfo.pdf', '/uploads/applications/1/proposal.pdf', 'application/pdf', '2024-02-01 10:10:00'),
(3, 2, 'surat_permohonan_disdikbud.pdf', '/uploads/applications/2/surat_permohonan.pdf', 'application/pdf', '2024-02-05 09:35:00'),
(4, 3, 'surat_permohonan_dinkes.pdf', '/uploads/applications/3/surat_permohonan.pdf', 'application/pdf', '2024-02-10 14:25:00'),
(5, 4, 'surat_permohonan_dpupr.pdf', '/uploads/applications/4/surat_permohonan.pdf', 'application/pdf', '2024-03-01 08:20:00'),

-- Documents for pending applications
(6, 16, 'surat_permohonan_satpolpp.pdf', '/uploads/applications/16/surat_permohonan.pdf', 'application/pdf', '2024-11-10 10:05:00'),
(7, 17, 'surat_permohonan_disdukcapil.pdf', '/uploads/applications/17/surat_permohonan.pdf', 'application/pdf', '2024-11-11 09:35:00'),

-- Documents for hosting applications
(8, 26, 'spesifikasi_hosting_diskominfo.pdf', '/uploads/applications/26/spesifikasi.pdf', 'application/pdf', '2024-02-03 10:05:00'),
(9, 27, 'spesifikasi_hosting_disdikbud.pdf', '/uploads/applications/27/spesifikasi.pdf', 'application/pdf', '2024-02-07 09:35:00'),
(10, 28, 'spesifikasi_hosting_dinkes.pdf', '/uploads/applications/28/spesifikasi.pdf', 'application/pdf', '2024-03-03 14:25:00');

-- =====================================================
-- DEACTIVATION REQUESTS (berbagai status)
-- =====================================================
INSERT INTO deactivation_requests (id, domain_id, requester_id, reason, status, decision_comment, decided_by, requested_at, decided_at) VALUES
-- Pending deactivation requests (3 permohonan menunggu)
(1, 1, 2, 'Domain tidak lagi digunakan untuk layanan publik. Website sudah dipindahkan ke platform baru.', 'Pending', NULL, NULL, '2024-11-15 10:00:00', NULL),
(2, 2, 3, 'Reorganisasi struktur OPD, domain akan diganti dengan nama baru sesuai nomenklatur terbaru.', 'Pending', NULL, NULL, '2024-11-16 09:30:00', NULL),
(3, 3, 4, 'Migrasi sistem informasi ke cloud, domain lama tidak diperlukan lagi.', 'Pending', NULL, NULL, '2024-11-17 14:20:00', NULL),

-- Approved deactivation requests (2 sudah disetujui - resulting in deactivated domains)
(4, 14, 15, 'Pergantian sistem informasi, domain lama sudah tidak digunakan.', 'Approved', 'Permohonan disetujui. Domain akan dinonaktifkan.', 1, '2024-10-01 10:00:00', '2024-10-02 14:00:00'),
(5, 15, 16, 'Konsolidasi website, beberapa domain akan digabung menjadi satu portal.', 'Approved', 'Disetujui untuk konsolidasi layanan digital.', 1, '2024-10-05 09:00:00', '2024-10-06 11:00:00'),

-- Rejected deactivation requests (1 ditolak)
(6, 4, 5, 'Domain tidak produktif dan ingin dinonaktifkan.', 'Rejected', 'Permohonan ditolak. Domain masih digunakan untuk layanan penting.', 1, '2024-09-15 10:00:00', '2024-09-16 14:00:00');

-- =====================================================
-- DEACTIVATION DOCUMENTS
-- =====================================================
INSERT INTO deactivation_documents (id, deactivation_request_id, file_name, file_path, file_type, uploaded_at) VALUES
(1, 1, 'surat_permohonan_deaktivasi.pdf', '/uploads/deactivation/1/surat_permohonan.pdf', 'application/pdf', '2024-11-15 10:05:00'),
(2, 1, 'bukti_migrasi.pdf', '/uploads/deactivation/1/bukti_migrasi.pdf', 'application/pdf', '2024-11-15 10:10:00'),
(3, 2, 'sk_reorganisasi.pdf', '/uploads/deactivation/2/sk_reorganisasi.pdf', 'application/pdf', '2024-11-16 09:35:00'),
(4, 3, 'proposal_cloud_migration.pdf', '/uploads/deactivation/3/proposal.pdf', 'application/pdf', '2024-11-17 14:25:00');

-- =====================================================
-- REACTIVATION REQUESTS (berbagai status)
-- =====================================================
INSERT INTO reactivation_requests (id, domain_id, requester_id, reason, status, decision_comment, decided_by, requested_at, decided_at) VALUES
-- Pending reactivation requests (2 permohonan menunggu)
(1, 11, 12, 'Domain diperlukan kembali untuk sistem perencanaan pembangunan online yang baru diluncurkan.', 'Pending', NULL, NULL, '2024-11-15 11:00:00', NULL),
(2, 12, 13, 'Sistem keuangan membutuhkan domain aktif untuk integrasi dengan aplikasi e-budgeting.', 'Pending', NULL, NULL, '2024-11-16 10:30:00', NULL),

-- Approved reactivation requests (1 sudah disetujui)
(3, 13, 14, 'Domain diperlukan untuk sistem kepegawaian yang telah diperbaharui.', 'Approved', 'Permohonan disetujui. Domain telah diaktifkan kembali.', 1, '2024-11-10 10:00:00', '2024-11-11 14:00:00'),

-- Rejected reactivation requests (1 ditolak)
(4, 14, 15, 'Ingin mengaktifkan kembali domain untuk kegiatan sementara.', 'Rejected', 'Permohonan ditolak. Gunakan subdomain alternatif untuk kegiatan sementara.', 1, '2024-11-05 10:00:00', '2024-11-06 14:00:00');

-- =====================================================
-- REACTIVATION DOCUMENTS
-- =====================================================
INSERT INTO reactivation_documents (id, reactivation_request_id, file_name, file_path, file_type, uploaded_at) VALUES
(1, 1, 'surat_permohonan_reaktivasi.pdf', '/uploads/reactivation/1/surat_permohonan.pdf', 'application/pdf', '2024-11-15 11:05:00'),
(2, 1, 'proposal_sistem_baru.pdf', '/uploads/reactivation/1/proposal.pdf', 'application/pdf', '2024-11-15 11:10:00'),
(3, 2, 'surat_kebutuhan_integrasi.pdf', '/uploads/reactivation/2/surat_kebutuhan.pdf', 'application/pdf', '2024-11-16 10:35:00');

-- =====================================================
-- NOTIFICATIONS (berbagai tipe dan status)
-- =====================================================
INSERT INTO notifications (id, user_id, message, type, status, related_entity_type, related_entity_id, link, created_at, read_at, expires_at) VALUES
-- Unread notifications untuk Super Admin
(1, 1, 'Permohonan domain baru dari Satuan Polisi Pamong Praja menunggu persetujuan', 'domain', 'unread', 'application', 16, '/super-admin/applications/16', '2024-11-10 10:05:00', NULL, '2025-05-10 10:05:00'),
(2, 1, 'Permohonan deaktivasi domain diskominfo.kalbarprov.go.id menunggu persetujuan', 'deaktivasi', 'unread', 'deactivation_request', 1, '/super-admin/deactivation-requests/1', '2024-11-15 10:05:00', NULL, '2025-05-15 10:05:00'),
(3, 1, 'Permohonan reaktivasi domain bappeda.kalbarprov.go.id menunggu persetujuan', 'domain', 'unread', 'reactivation_request', 1, '/super-admin/reactivation-requests/1', '2024-11-15 11:05:00', NULL, '2025-05-15 11:05:00'),
(4, 1, 'Permohonan hosting baru dari Badan Perencanaan Pembangunan Daerah menunggu persetujuan', 'hosting', 'unread', 'application', 36, '/super-admin/hosting-applications/36', '2024-11-10 10:05:00', NULL, '2025-05-10 10:05:00'),

-- Read notifications untuk Super Admin
(5, 1, 'Permohonan domain dari Dinas Komunikasi dan Informatika telah disetujui', 'domain', 'read', 'application', 1, '/super-admin/applications/1', '2024-02-02 14:05:00', '2024-02-02 15:00:00', '2024-08-02 14:05:00'),
(6, 1, 'Permohonan domain dari Dinas Pendidikan dan Kebudayaan telah disetujui', 'domain', 'read', 'application', 2, '/super-admin/applications/2', '2024-02-06 11:05:00', '2024-02-06 12:00:00', '2024-08-06 11:05:00'),

-- Unread notifications untuk Admin Daerah
(7, 2, 'Permohonan domain Anda telah disetujui. Domain diskominfo.kalbarprov.go.id sekarang aktif.', 'domain', 'unread', 'domain', 1, '/domains/1', '2024-02-02 14:05:00', NULL, '2024-08-02 14:05:00'),
(8, 3, 'Permohonan domain Anda telah disetujui. Domain disdikbud.kalbarprov.go.id sekarang aktif.', 'domain', 'unread', 'domain', 2, '/domains/2', '2024-02-06 11:05:00', NULL, '2024-08-06 11:05:00'),
(9, 17, 'Permohonan domain Anda sedang dalam proses review oleh Super Admin', 'domain', 'unread', 'application', 16, '/applications/16', '2024-11-10 10:10:00', NULL, '2025-05-10 10:10:00'),

-- Notification untuk perpanjangan domain (warning)
(10, 2, 'Domain diskominfo.kalbarprov.go.id akan kadaluarsa dalam 90 hari. Harap perbarui segera.', 'perpanjangan', 'unread', 'domain', 1, '/domains/1', '2024-11-05 08:00:00', NULL, '2025-05-05 08:00:00'),
(11, 3, 'Domain disdikbud.kalbarprov.go.id akan kadaluarsa dalam 80 hari. Harap perbarui segera.', 'perpanjangan', 'unread', 'domain', 2, '/domains/2', '2024-11-18 08:00:00', NULL, '2025-05-18 08:00:00'),

-- Read notifications untuk Admin Daerah
(12, 4, 'Permohonan domain Anda telah ditolak. Alasan: Nama domain tidak sesuai dengan kebijakan.', 'domain', 'read', 'application', 23, '/applications/23', '2024-10-02 14:35:00', '2024-10-02 15:00:00', '2025-04-02 14:35:00'),

-- System notifications
(13, 1, 'Sistem akan menjalani pemeliharaan rutin pada tanggal 20 November 2024 pukul 00:00 - 04:00 WIB', 'system', 'unread', NULL, NULL, NULL, '2024-11-17 10:00:00', NULL, '2025-05-17 10:00:00');

-- =====================================================
-- AUDIT LOGS (tracking semua aktivitas)
-- =====================================================
INSERT INTO audit_logs (id, user_id, application_id, action, details, timestamp) VALUES
-- Login activities
(1, 1, NULL, 'LOGIN', 'Super Admin login ke sistem', '2024-11-18 08:00:00'),
(2, 2, NULL, 'LOGIN', 'Admin Daerah Diskominfo login ke sistem', '2024-11-18 08:15:00'),
(3, 3, NULL, 'LOGIN', 'Admin Daerah Disdikbud login ke sistem', '2024-11-18 08:30:00'),

-- Application submissions
(4, 2, 1, 'SUBMIT_APPLICATION', 'Mengajukan permohonan domain baru untuk diskominfo.kalbarprov.go.id', '2024-02-01 10:00:00'),
(5, 3, 2, 'SUBMIT_APPLICATION', 'Mengajukan permohonan domain baru untuk disdikbud.kalbarprov.go.id', '2024-02-05 09:30:00'),
(6, 17, 16, 'SUBMIT_APPLICATION', 'Mengajukan permohonan domain baru untuk satpolpp.kalbarprov.go.id', '2024-11-10 10:00:00'),

-- Application approvals
(7, 1, 1, 'APPROVE_APPLICATION', 'Menyetujui permohonan domain dari Dinas Komunikasi dan Informatika', '2024-02-02 14:00:00'),
(8, 1, 2, 'APPROVE_APPLICATION', 'Menyetujui permohonan domain dari Dinas Pendidikan dan Kebudayaan', '2024-02-06 11:00:00'),
(9, 1, 3, 'APPROVE_APPLICATION', 'Menyetujui permohonan domain dari Dinas Kesehatan', '2024-02-11 10:30:00'),

-- Application rejections
(10, 1, 23, 'REJECT_APPLICATION', 'Menolak permohonan domain: Nama domain tidak sesuai dengan kebijakan', '2024-10-02 14:30:00'),
(11, 1, 24, 'REJECT_APPLICATION', 'Menolak permohonan domain: Dokumen persyaratan tidak lengkap', '2024-10-06 11:00:00'),

-- Domain activations
(12, 1, 1, 'ACTIVATE_DOMAIN', 'Mengaktifkan domain diskominfo.kalbarprov.go.id', '2024-02-02 14:00:00'),
(13, 1, 2, 'ACTIVATE_DOMAIN', 'Mengaktifkan domain disdikbud.kalbarprov.go.id', '2024-02-06 11:00:00'),

-- Domain suspensions
(14, 1, NULL, 'SUSPEND_DOMAIN', 'Menangguhkan domain bappeda.kalbarprov.go.id karena pelanggaran kebijakan', '2024-09-01 14:00:00'),
(15, 1, NULL, 'SUSPEND_DOMAIN', 'Menangguhkan domain bpkad.kalbarprov.go.id untuk maintenance', '2024-09-05 11:00:00'),

-- Deactivation requests
(16, 2, 1, 'SUBMIT_DEACTIVATION_REQUEST', 'Mengajukan permohonan deaktivasi domain diskominfo.kalbarprov.go.id', '2024-11-15 10:00:00'),
(17, 3, 2, 'SUBMIT_DEACTIVATION_REQUEST', 'Mengajukan permohonan deaktivasi domain disdikbud.kalbarprov.go.id', '2024-11-16 09:30:00'),
(18, 1, NULL, 'APPROVE_DEACTIVATION', 'Menyetujui permohonan deaktivasi domain dlh.kalbarprov.go.id', '2024-10-02 14:00:00'),

-- Reactivation requests
(19, 12, NULL, 'SUBMIT_REACTIVATION_REQUEST', 'Mengajukan permohonan reaktivasi domain bappeda.kalbarprov.go.id', '2024-11-15 11:00:00'),
(20, 13, NULL, 'SUBMIT_REACTIVATION_REQUEST', 'Mengajukan permohonan reaktivasi domain bpkad.kalbarprov.go.id', '2024-11-16 10:30:00'),
(21, 1, NULL, 'APPROVE_REACTIVATION', 'Menyetujui permohonan reaktivasi domain bkd.kalbarprov.go.id', '2024-11-11 14:00:00'),

-- Hosting operations
(22, 2, 26, 'SUBMIT_HOSTING_APPLICATION', 'Mengajukan permohonan hosting untuk diskominfo.kalbarprov.go.id', '2024-02-03 10:00:00'),
(23, 1, 26, 'APPROVE_HOSTING', 'Menyetujui permohonan hosting dari Dinas Komunikasi dan Informatika', '2024-02-04 14:00:00'),

-- User management
(24, 1, NULL, 'CREATE_USER', 'Membuat akun user baru untuk Admin Daerah Satuan Polisi Pamong Praja', '2024-01-15 09:00:00'),
(25, 1, NULL, 'UPDATE_USER', 'Memperbarui informasi user untuk Admin Daerah Diskominfo', '2024-05-10 10:00:00'),
(26, 1, NULL, 'DEACTIVATE_USER', 'Menonaktifkan akun user inactive@kalbarprov.go.id', '2024-08-01 14:00:00'),

-- Document uploads
(27, 2, 1, 'UPLOAD_DOCUMENT', 'Mengunggah dokumen surat_permohonan_diskominfo.pdf', '2024-02-01 10:05:00'),
(28, 2, 1, 'UPLOAD_DOCUMENT', 'Mengunggah dokumen proposal_diskominfo.pdf', '2024-02-01 10:10:00'),

-- System activities
(29, 1, NULL, 'SYSTEM_BACKUP', 'Melakukan backup database sistem', '2024-11-17 02:00:00'),
(30, 1, NULL, 'GENERATE_REPORT', 'Menghasilkan laporan domain bulanan', '2024-11-01 09:00:00');

-- =====================================================
-- Verify data counts
-- =====================================================
SELECT 
    'OPDs' as entity, COUNT(*) as total FROM opds
UNION ALL
SELECT 'Users', COUNT(*) FROM users
UNION ALL
SELECT 'Applications', COUNT(*) FROM applications
UNION ALL
SELECT 'Domains', COUNT(*) FROM domains
UNION ALL
SELECT 'Hostings', COUNT(*) FROM hostings
UNION ALL
SELECT 'Documents', COUNT(*) FROM documents
UNION ALL
SELECT 'Deactivation Requests', COUNT(*) FROM deactivation_requests
UNION ALL
SELECT 'Deactivation Documents', COUNT(*) FROM deactivation_documents
UNION ALL
SELECT 'Reactivation Requests', COUNT(*) FROM reactivation_requests
UNION ALL
SELECT 'Reactivation Documents', COUNT(*) FROM reactivation_documents
UNION ALL
SELECT 'Notifications', COUNT(*) FROM notifications
UNION ALL
SELECT 'Audit Logs', COUNT(*) FROM audit_logs;

-- =====================================================
-- Show data summary by status
-- =====================================================
SELECT 
    'Domain Applications by Status' as summary_type,
    status,
    COUNT(*) as count
FROM applications 
WHERE application_type = 'domain'
GROUP BY status

UNION ALL

SELECT 
    'Hosting Applications by Status',
    status,
    COUNT(*)
FROM applications 
WHERE application_type = 'hosting'
GROUP BY status

UNION ALL

SELECT 
    'Domains by Status',
    status,
    COUNT(*)
FROM domains
GROUP BY status

UNION ALL

SELECT 
    'Deactivation Requests by Status',
    status,
    COUNT(*)
FROM deactivation_requests
GROUP BY status

UNION ALL

SELECT 
    'Reactivation Requests by Status',
    status,
    COUNT(*)
FROM reactivation_requests
GROUP BY status

UNION ALL

SELECT 
    'Notifications by Status',
    status,
    COUNT(*)
FROM notifications
GROUP BY status;

-- =====================================================
-- END OF SCRIPT
-- =====================================================
