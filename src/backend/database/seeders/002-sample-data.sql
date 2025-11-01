-- Sample Applications Data
-- This adds realistic test data for applications

USE domain_manager;

-- Insert Sample Applications (Subdomain Requests)
INSERT INTO applications (application_type, opd_id, submitter_id, status, submitted_at, approved_at, last_updated_by) VALUES
('domain', 1, 2, 'Approved', NOW() - INTERVAL 10 DAY, NOW() - INTERVAL 5 DAY, 1),
('domain', 2, 3, 'Approved', NOW() - INTERVAL 8 DAY, NOW() - INTERVAL 3 DAY, 1),
('domain', 3, 4, 'Pending', NOW() - INTERVAL 2 DAY, NULL, NULL),
('hosting', 1, 2, 'Approved', NOW() - INTERVAL 15 DAY, NOW() - INTERVAL 7 DAY, 1),
('hosting', 4, 5, 'Pending', NOW() - INTERVAL 1 DAY, NULL, NULL);

-- Insert Sample Domains (Created from approved applications)
-- Note: Using actual application IDs from database (2 and 3)
INSERT INTO domains (application_id, domain_name, status, activated_at, expires_at) VALUES
(2, 'pendidikan.kotabogor.go.id', 'active', NOW() - INTERVAL 5 DAY, NOW() + INTERVAL 360 DAY),
(3, 'kesehatan.kotabogor.go.id', 'active', NOW() - INTERVAL 3 DAY, NOW() + INTERVAL 362 DAY);

-- Insert Sample Hosting Services
INSERT INTO hostings (domain_id, status, activated_at, expires_at) VALUES
(1, 'active', NOW() - INTERVAL 7 DAY, NOW() + INTERVAL 358 DAY);

-- Insert Sample Documents
INSERT INTO documents (application_id, file_name, file_path, file_type, file_size, uploaded_at) VALUES
(2, 'surat_permohonan_pendidikan.pdf', '/uploads/2024/10/surat_permohonan_1.pdf', 'application/pdf', 245678, NOW() - INTERVAL 10 DAY),
(2, 'sk_kepala_opd.pdf', '/uploads/2024/10/sk_kepala_1.pdf', 'application/pdf', 189234, NOW() - INTERVAL 10 DAY),
(3, 'surat_permohonan_kesehatan.pdf', '/uploads/2024/10/surat_permohonan_2.pdf', 'application/pdf', 298765, NOW() - INTERVAL 8 DAY);

-- Insert Sample Audit Logs
INSERT INTO audit_logs (user_id, action, resource_type, resource_id, description, ip_address, user_agent) VALUES
(1, 'create', 'application', '2', 'Created subdomain application for pendidikan.kotabogor.go.id', '192.168.1.100', 'Mozilla/5.0'),
(1, 'approve', 'application', '2', 'Approved subdomain application for pendidikan.kotabogor.go.id', '192.168.1.100', 'Mozilla/5.0'),
(1, 'create', 'domain', '1', 'Created domain pendidikan.kotabogor.go.id', '192.168.1.100', 'Mozilla/5.0'),
(2, 'create', 'application', '3', 'Created subdomain application for kesehatan.kotabogor.go.id', '192.168.1.101', 'Mozilla/5.0'),
(1, 'approve', 'application', '3', 'Approved subdomain application for kesehatan.kotabogor.go.id', '192.168.1.100', 'Mozilla/5.0'),
(3, 'create', 'application', '4', 'Created subdomain application pending review', '192.168.1.102', 'Mozilla/5.0'),
(1, 'login', 'user', '1', 'User logged in', '192.168.1.100', 'Mozilla/5.0'),
(2, 'login', 'user', '2', 'User logged in', '192.168.1.101', 'Mozilla/5.0');

-- Verify data inserted
SELECT 'Applications' as TableName, COUNT(*) as RowCount FROM applications
UNION ALL
SELECT 'Domains', COUNT(*) FROM domains
UNION ALL
SELECT 'Hostings', COUNT(*) FROM hostings
UNION ALL
SELECT 'Documents', COUNT(*) FROM documents
UNION ALL
SELECT 'Audit Logs', COUNT(*) FROM audit_logs;

-- Show sample data
SELECT 'Sample Applications:' as Info;
SELECT a.id, a.application_type, o.name as opd_name, u.username as submitter, a.status, a.submitted_at
FROM applications a
LEFT JOIN opds o ON a.opd_id = o.id
LEFT JOIN users u ON a.submitter_id = u.id;

SELECT 'Sample Domains:' as Info;
SELECT d.id, d.domain_name, d.status, d.activated_at, d.expires_at
FROM domains d;

SELECT 'Sample Audit Logs:' as Info;
SELECT al.id, u.username, al.action, al.resource_type, al.description, al.created_at
FROM audit_logs al
LEFT JOIN users u ON al.user_id = u.id
ORDER BY al.created_at DESC
LIMIT 10;
