-- Insert OPD data
INSERT INTO opds (name, address, contact_person, phone_number) VALUES
('Dinas Komunikasi dan Informatika', 'Jl. Jendral Ahmad Yani', 'Budi Santoso', '0561-123456'),
('Dinas Pendidikan dan Kebudayaan', 'Jl. Sultan Abdurrahman', 'Siti Nurhaliza', '0561-234567'),
('Dinas Kesehatan', 'Jl. Dr. Sutomo', 'Dr. Ahmad Wijaya', '0561-345678'),
('Badan Perencanaan Pembangunan Daerah', 'Jl. Imam Bonjol', 'Hendra Gunawan', '0561-456789');

-- Insert users
INSERT INTO users (username, email, role, opd_id, is_active) VALUES
('superadmin', 'superadmin@kalbarprov.go.id', 'Super Admin', NULL, TRUE),
('admin.diskominfo', 'admin@diskominfo.kalbarprov.go.id', 'Admin Daerah', 1, TRUE),
('admin.disdikbud', 'admin@disdikbud.kalbarprov.go.id', 'Admin Daerah', 2, TRUE),
('admin.dinkes', 'admin@dinkes.kalbarprov.go.id', 'Admin Daerah', 3, TRUE);

-- Insert sample applications
INSERT INTO applications (application_type, opd_id, submitter_id, status, reason, submitted_at) VALUES
('domain', 1, 2, 'Approved', 'Website resmi Diskominfo Kalbar', '2024-01-15 10:00:00'),
('domain', 2, 3, 'Pending', 'Portal pendidikan online', NOW()),
('hosting', 1, 2, 'Approved', 'Hosting untuk website Diskominfo', '2024-01-20 14:00:00');

-- Insert sample domains
INSERT INTO domains (application_id, domain_name, status, activated_at, expires_at) VALUES
(1, 'diskominfo.kalbarprov.go.id', 'Active', '2024-01-15 10:00:00', '2025-01-15 10:00:00'),
(3, 'portal.kalbarprov.go.id', 'Active', '2024-01-20 14:00:00', '2025-01-20 14:00:00');
