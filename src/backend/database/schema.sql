CREATE DATABASE IF NOT EXISTS domain_manager
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE domain_manager;

CREATE TABLE opds (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    address TEXT,
    contact_person VARCHAR(100),
    phone_number VARCHAR(20),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    role VARCHAR(20) NOT NULL COMMENT 'AdminDaerah, SuperAdmin',
    opd_id INT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (opd_id) REFERENCES opds(id) ON DELETE SET NULL ON UPDATE CASCADE,
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_opd_id (opd_id),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE applications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    application_type VARCHAR(20) NOT NULL COMMENT 'domain, hosting',
    opd_id INT NOT NULL,
    submitter_id INT NOT NULL,
    status VARCHAR(50) NOT NULL COMMENT 'Pending, Approved, Rejected',
    reason TEXT,
    submitted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    approved_at TIMESTAMP NULL,
    last_updated_by INT,
    
    FOREIGN KEY (opd_id) REFERENCES opds(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (submitter_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (last_updated_by) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE,
    INDEX idx_application_type (application_type),
    INDEX idx_opd_id (opd_id),
    INDEX idx_submitter_id (submitter_id),
    INDEX idx_status (status),
    INDEX idx_submitted_at (submitted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE domains (
    id INT AUTO_INCREMENT PRIMARY KEY,
    application_id INT NOT NULL,
    domain_name VARCHAR(255) NOT NULL UNIQUE,
    status VARCHAR(50) NOT NULL COMMENT 'Active, Suspended, Deactivated',
    activated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    
    FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_domain_name (domain_name),
    INDEX idx_status (status),
    INDEX idx_application_id (application_id),
    INDEX idx_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE hostings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    application_id INT NOT NULL,
    domain_id INT NOT NULL,
    storage_capacity VARCHAR(50),
    bandwidth VARCHAR(50),
    server_type VARCHAR(50),
    status VARCHAR(50) NOT NULL COMMENT 'Active, Deactivated',
    activated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (domain_id) REFERENCES domains(id) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_application_id (application_id),
    INDEX idx_domain_id (domain_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE documents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    application_id INT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    uploaded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_application_id (application_id),
    INDEX idx_uploaded_at (uploaded_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    application_id INT NULL,
    action VARCHAR(255) NOT NULL,
    details TEXT,
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_application_id (application_id),
    INDEX idx_timestamp (timestamp),
    INDEX idx_action (action)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    message TEXT NOT NULL,
    type ENUM('domain', 'hosting', 'perpanjangan', 'suspensi', 'deaktivasi', 'system') NOT NULL,
    status ENUM('unread', 'read') NOT NULL DEFAULT 'unread',
    related_entity_type VARCHAR(255) NULL COMMENT 'nilai: domain, hosting, application, user',
    related_entity_id INT NULL COMMENT 'ID dari domain/hosting/application',
    link VARCHAR(500) NULL COMMENT 'URL ke halaman terkait',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP NULL COMMENT 'diisi saat notifikasi dibaca',
    expires_at TIMESTAMP NOT NULL COMMENT 'created_at + 6 bulan untuk auto-cleanup',
    is_email_sent BOOLEAN DEFAULT FALSE COMMENT 'tracking apakah email sudah terkirim',
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_user_status (user_id, status),
    INDEX idx_user_created (user_id, created_at DESC),
    INDEX idx_expires_at (expires_at),
    INDEX idx_related_entity (related_entity_type, related_entity_id),
    INDEX idx_type (type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DELIMITER $$

CREATE TRIGGER before_insert_notifications
BEFORE INSERT ON notifications
FOR EACH ROW
BEGIN
    IF NEW.expires_at IS NULL OR NEW.expires_at = '0000-00-00 00:00:00' THEN
        SET NEW.expires_at = DATE_ADD(NEW.created_at, INTERVAL 6 MONTH);
    END IF;
END$$

DELIMITER ;

SET GLOBAL event_scheduler = ON;

DELIMITER $$

CREATE EVENT cleanup_expired_notifications
ON SCHEDULE EVERY 1 DAY
STARTS CURRENT_TIMESTAMP
DO
BEGIN
    DELETE FROM notifications WHERE expires_at < CURRENT_TIMESTAMP;
END$$

DELIMITER ;

DELIMITER $$

CREATE PROCEDURE get_unread_notification_count(IN p_user_id INT)
BEGIN
    SELECT COUNT(*) AS unread_count 
    FROM notifications 
    WHERE user_id = p_user_id AND status = 'unread';
END$$

DELIMITER ;

DELIMITER $$

CREATE PROCEDURE mark_all_notifications_as_read(IN p_user_id INT)
BEGIN
    UPDATE notifications 
    SET status = 'read', read_at = CURRENT_TIMESTAMP 
    WHERE user_id = p_user_id AND status = 'unread';
    
    SELECT ROW_COUNT() AS updated_count;
END$$

DELIMITER ;

DELIMITER $$

CREATE PROCEDURE get_user_notifications(
    IN p_user_id INT,
    IN p_type VARCHAR(50),
    IN p_status VARCHAR(10),
    IN p_limit INT,
    IN p_offset INT
)
BEGIN
    SELECT 
        id,
        user_id,
        message,
        type,
        status,
        related_entity_type,
        related_entity_id,
        link,
        created_at,
        read_at,
        is_email_sent
    FROM notifications
    WHERE user_id = p_user_id
        AND (p_type IS NULL OR type = p_type)
        AND (p_status IS NULL OR status = p_status)
    ORDER BY created_at DESC
    LIMIT p_limit OFFSET p_offset;
    
    SELECT COUNT(*) AS total_count
    FROM notifications
    WHERE user_id = p_user_id
        AND (p_type IS NULL OR type = p_type)
        AND (p_status IS NULL OR status = p_status);
END$$

DELIMITER ;

-- sample OPD
INSERT INTO opds (name, address, contact_person, phone_number) VALUES
('Dinas Pendidikan', 'Jl. Pendidikan No. 1', 'Budi Santoso', '081234567890'),
('Dinas Kesehatan', 'Jl. Kesehatan No. 2', 'Siti Aminah', '081234567891');

-- sample Users
INSERT INTO users (username, email, role, opd_id, is_active) VALUES
('admin.disdik', 'admin@disdik.go.id', 'AdminDaerah', 1, TRUE),
('admin.dinkes', 'admin@dinkes.go.id', 'AdminDaerah', 2, TRUE),
('superadmin', 'superadmin@diskominfo.go.id', 'SuperAdmin', NULL, TRUE);