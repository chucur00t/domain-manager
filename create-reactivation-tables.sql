-- Create reactivation_requests table
CREATE TABLE IF NOT EXISTS reactivation_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    domain_id INT NOT NULL,
    requester_id INT NOT NULL,
    reason TEXT NOT NULL,
    status ENUM('Pending', 'Approved', 'Rejected') NOT NULL DEFAULT 'Pending',
    decision_comment TEXT NULL,
    decided_by INT NULL,
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

-- Create reactivation_documents table
CREATE TABLE IF NOT EXISTS reactivation_documents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    reactivation_request_id INT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    uploaded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (reactivation_request_id) REFERENCES reactivation_requests(id) ON DELETE CASCADE ON UPDATE CASCADE,
    
    INDEX idx_reactivation_request_id (reactivation_request_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
