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
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL COMMENT 'Admin Daerah, Super Admin',
    opd_id INT,
    opd_address TEXT,
    contact VARCHAR(20),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (opd_id) REFERENCES opds(id) ON DELETE SET NULL ON UPDATE CASCADE,
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_opd_id (opd_id),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabel untuk tracking login Super Admin
CREATE TABLE super_admin_sessions (
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
    expires_at TIMESTAMP NULL COMMENT 'created_at + 6 bulan untuk auto-cleanup',
    is_email_sent BOOLEAN DEFAULT FALSE COMMENT 'tracking apakah email sudah terkirim',
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_user_status (user_id, status),
    INDEX idx_user_created (user_id, created_at DESC),
    INDEX idx_expires_at (expires_at),
    INDEX idx_related_entity (related_entity_type, related_entity_id),
    INDEX idx_type (type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE deactivation_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    domain_id INT NOT NULL,
    requester_id INT NOT NULL,
    reason TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Pending' COMMENT 'Pending, Approved, Rejected',
    decision_comment TEXT,
    decided_by INT,
    requested_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    decided_at TIMESTAMP NULL,
    
    FOREIGN KEY (domain_id) REFERENCES domains(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (requester_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (decided_by) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE,
    INDEX idx_domain_id (domain_id),
    INDEX idx_requester_id (requester_id),
    INDEX idx_status (status),
    INDEX idx_requested_at (requested_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE deactivation_documents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    deactivation_request_id INT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(512) NOT NULL,
    file_type VARCHAR(50),
    uploaded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (deactivation_request_id) REFERENCES deactivation_requests(id) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_deactivation_request_id (deactivation_request_id),
    INDEX idx_uploaded_at (uploaded_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE reactivation_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    domain_id INT NOT NULL,
    requester_id INT NOT NULL,
    reason TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Pending' COMMENT 'Pending, Approved, Rejected',
    decision_comment TEXT,
    decided_by INT,
    requested_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    decided_at TIMESTAMP NULL,
    
    FOREIGN KEY (domain_id) REFERENCES domains(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (requester_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (decided_by) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE,
    INDEX idx_domain_id (domain_id),
    INDEX idx_requester_id (requester_id),
    INDEX idx_status (status),
    INDEX idx_requested_at (requested_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE reactivation_documents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    reactivation_request_id INT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(512) NOT NULL,
    file_type VARCHAR(50),
    uploaded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (reactivation_request_id) REFERENCES reactivation_requests(id) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_reactivation_request_id (reactivation_request_id),
    INDEX idx_uploaded_at (uploaded_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;