-- Seeder untuk data awal Domain Manager
-- Jalankan setelah schema.sql

-- Insert OPDs (Organisasi Perangkat Daerah)
INSERT INTO opds (id, name, address, contact_person, phone_number) VALUES
(1, 'Dinas Komunikasi dan Informatika', 'Jl. Pemuda No. 123, Jakarta', 'Budi Santoso', '021-1234567'),
(2, 'Dinas Pendidikan', 'Jl. Merdeka No. 45, Jakarta', 'Siti Rahmawati', '021-2345678'),
(3, 'Dinas Kesehatan', 'Jl. Sudirman No. 67, Jakarta', 'Ahmad Wijaya', '021-3456789'),
(4, 'Dinas Perhubungan', 'Jl. Gatot Subroto No. 89, Jakarta', 'Dewi Lestari', '021-4567890'),
(5, 'Dinas Sosial', 'Jl. Thamrin No. 12, Jakarta', 'Rudi Hartono', '021-5678901');

-- Insert Super Admin User
INSERT INTO users (id, username, email, role, opd_id, is_active) VALUES
('user-superadmin-001', 'superadmin', 'superadmin@diskominfo.go.id', 'Super Admin', 1, true);

-- Insert Admin Daerah Users
INSERT INTO users (id, username, email, role, opd_id, is_active) VALUES
('user-admin-001', 'admin.pendidikan', 'admin@disdik.go.id', 'Admin Daerah', 2, true),
('user-admin-002', 'admin.kesehatan', 'admin@dinkes.go.id', 'Admin Daerah', 3, true),
('user-admin-003', 'admin.perhubungan', 'admin@dishub.go.id', 'Admin Daerah', 4, true),
('user-admin-004', 'admin.sosial', 'admin@dinsos.go.id', 'Admin Daerah', 5, true);

-- Insert Sample Applications (Domain)
INSERT INTO applications (id, application_type, opd_id, submitter_id, status, reason, submitted_at) VALUES
(1, 'domain', 2, 'user-admin-001', 'Approved', NULL, NOW() - INTERVAL 30 DAY),
(2, 'domain', 3, 'user-admin-002', 'Pending', NULL, NOW() - INTERVAL 15 DAY),
(3, 'domain', 4, 'user-admin-003', 'Approved', NULL, NOW() - INTERVAL 20 DAY),
(4, 'domain', 5, 'user-admin-004', 'Rejected', 'Dokumen tidak lengkap', NOW() - INTERVAL 10 DAY);

-- Insert Active Domains
INSERT INTO domains (id, application_id, domain_name, status, activated_at, expires_at) VALUES
(1, 1, 'pendidikan.jakarta.go.id', 'Active', NOW() - INTERVAL 30 DAY, NOW() + INTERVAL 335 DAY),
(2, 3, 'perhubungan.jakarta.go.id', 'Active', NOW() - INTERVAL 20 DAY, NOW() + INTERVAL 345 DAY);

-- Insert Sample Applications (Hosting)
INSERT INTO applications (id, application_type, opd_id, submitter_id, status, reason, submitted_at) VALUES
(5, 'hosting', 2, 'user-admin-001', 'Approved', NULL, NOW() - INTERVAL 25 DAY),
(6, 'hosting', 3, 'user-admin-002', 'Pending', NULL, NOW() - INTERVAL 5 DAY);

-- Insert Active Hostings
INSERT INTO hostings (id, application_id, domain_id, storage_capacity, bandwidth, server_type, status, activated_at) VALUES
(1, 5, 1, '10GB', '100GB', 'cPanel', 'Active', NOW() - INTERVAL 25 DAY);

-- Insert Sample Documents
INSERT INTO documents (id, application_id, file_name, file_path, file_type) VALUES
(1, 1, 'surat_permohonan_pendidikan.pdf', '/uploads/documents/app-1-surat.pdf', 'application/pdf'),
(2, 2, 'surat_permohonan_kesehatan.pdf', '/uploads/documents/app-2-surat.pdf', 'application/pdf'),
(3, 3, 'surat_permohonan_perhubungan.pdf', '/uploads/documents/app-3-surat.pdf', 'application/pdf'),
(4, 5, 'surat_permohonan_hosting.pdf', '/uploads/documents/app-5-surat.pdf', 'application/pdf');

-- Insert Sample Audit Logs
INSERT INTO audit_logs (id, user_id, application_id, action, details) VALUES
(1, 'user-superadmin-001', 1, 'APPROVE_APPLICATION', 'Menyetujui permohonan domain pendidikan.jakarta.go.id'),
(2, 'user-admin-001', 1, 'SUBMIT_APPLICATION', 'Mengajukan permohonan domain pendidikan.jakarta.go.id'),
(3, 'user-superadmin-001', 2, 'REVIEW_APPLICATION', 'Meninjau permohonan domain kesehatan.jakarta.go.id'),
(4, 'user-admin-002', 2, 'SUBMIT_APPLICATION', 'Mengajukan permohonan domain kesehatan.jakarta.go.id'),
(5, 'user-superadmin-001', 3, 'APPROVE_APPLICATION', 'Menyetujui permohonan domain perhubungan.jakarta.go.id'),
(6, 'user-superadmin-001', 4, 'REJECT_APPLICATION', 'Menolak permohonan - Dokumen tidak lengkap'),
(7, 'user-superadmin-001', 5, 'APPROVE_APPLICATION', 'Menyetujui permohonan hosting untuk domain pendidikan.jakarta.go.id');

-- Verify data
SELECT 'OPDs' as TableName, COUNT(*) as RecordCount FROM opds
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
SELECT 'Audit Logs', COUNT(*) FROM audit_logs;

-- Show summary
SELECT 
    'Summary of Seeded Data' as Info,
    (SELECT COUNT(*) FROM opds) as Total_OPDs,
    (SELECT COUNT(*) FROM users) as Total_Users,
    (SELECT COUNT(*) FROM applications) as Total_Applications,
    (SELECT COUNT(*) FROM domains) as Total_Domains,
    (SELECT COUNT(*) FROM hostings) as Total_Hostings;
