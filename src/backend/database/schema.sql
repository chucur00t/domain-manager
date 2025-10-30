CREATE DATABASE domain_manager;
USE domain_manager;

CREATE TABLE opds (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    address TEXT,
    contact_person VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    role ENUM('Super Admin', 'Admin Daerah') NOT NULL,
    opd_id INT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_users_opds FOREIGN KEY (opd_id) REFERENCES opds(id) ON DELETE SET NULL
);

CREATE TABLE applications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    application_type ENUM('domain', 'hosting') NOT NULL,
    opd_id INT,
    submitter_id INT,
    status ENUM('Pending', 'Approved', 'Rejected') NOT NULL,
    reason TEXT,
    submitted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    approved_at TIMESTAMP NULL,
    last_updated_by INT,
    CONSTRAINT fk_applications_opds FOREIGN KEY (opd_id) REFERENCES opds(id) ON DELETE CASCADE,
    CONSTRAINT fk_applications_submitter FOREIGN KEY (submitter_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_applications_updater FOREIGN KEY (last_updated_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE domains (
    id INT AUTO_INCREMENT PRIMARY KEY,
    application_id INT,
    domain_name VARCHAR(255) NOT NULL UNIQUE,
    status ENUM('active', 'inactive', 'expired', 'pending') NOT NULL,
    activated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_domains_applications FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE
);

CREATE TABLE hostings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    application_id INT,
    domain_id INT,
    storage_capacity VARCHAR(50),
    bandwidth VARCHAR(50),
    server_type VARCHAR(50),
    status ENUM('Active', 'Deactivated') NOT NULL,
    activated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_hostings_applications FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE,
    CONSTRAINT fk_hostings_domains FOREIGN KEY (domain_id) REFERENCES domains(id) ON DELETE CASCADE
);

CREATE TABLE documents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    application_id INT,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    uploaded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_documents_applications FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE
);

CREATE TABLE audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    application_id INT NULL,
    action VARCHAR(255) NOT NULL,
    details TEXT,
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_auditlogs_users FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_auditlogs_applications FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE
);
