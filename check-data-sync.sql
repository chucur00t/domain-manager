-- Check data sinkronisasi untuk Audit Trail dan Laporan
-- Script ini akan menampilkan data yang seharusnya muncul di halaman

-- 1. Check Audit Logs (untuk halaman Audit Trail)
SELECT 
    'AUDIT LOGS' as TABLE_NAME,
    COUNT(*) as TOTAL_RECORDS
FROM audit_logs;

-- Detail audit logs
SELECT 
    al.id,
    al.user_id,
    u.username,
    u.role,
    al.action,
    al.application_id,
    al.details,
    al.timestamp
FROM audit_logs al
LEFT JOIN users u ON al.user_id = u.id
ORDER BY al.timestamp DESC
LIMIT 20;

-- 2. Check Applications (untuk halaman Laporan)
SELECT 
    'APPLICATIONS' as TABLE_NAME,
    COUNT(*) as TOTAL_RECORDS
FROM applications;

-- Detail applications
SELECT 
    a.id,
    a.domain_name,
    a.submitter_id,
    u.username as submitter_name,
    a.opd,
    a.status,
    a.reason,
    a.application_type,
    a.created_at,
    a.updated_at
FROM applications a
LEFT JOIN users u ON a.submitter_id = u.id
ORDER BY a.created_at DESC
LIMIT 20;

-- 3. Check status distribution aplikasi
SELECT 
    status,
    COUNT(*) as jumlah
FROM applications
GROUP BY status;

-- 4. Check action distribution audit logs
SELECT 
    action,
    COUNT(*) as jumlah
FROM audit_logs
GROUP BY action
ORDER BY jumlah DESC
LIMIT 10;

-- 5. Check users yang melakukan aktivitas
SELECT 
    u.username,
    u.role,
    COUNT(al.id) as total_activities
FROM users u
LEFT JOIN audit_logs al ON u.id = al.user_id
WHERE u.is_active = TRUE
GROUP BY u.id, u.username, u.role
ORDER BY total_activities DESC;
