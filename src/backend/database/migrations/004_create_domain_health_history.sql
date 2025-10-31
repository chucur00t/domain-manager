-- UP Migration
CREATE TABLE IF NOT EXISTS domain_health_history (
  id BINARY(16) PRIMARY KEY DEFAULT (UUID_TO_BIN(UUID())),
  domain_id BINARY(16) NOT NULL,
  check_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  is_up BOOLEAN NOT NULL DEFAULT FALSE,
  response_time INT,
  ssl_valid BOOLEAN NOT NULL DEFAULT FALSE,
  ssl_expiry_date TIMESTAMP NULL,
  dns_valid BOOLEAN NOT NULL DEFAULT FALSE,
  FOREIGN KEY (domain_id) REFERENCES domains(id) ON DELETE CASCADE,
  INDEX idx_domain_date (domain_id, check_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- DOWN Migration
DROP TABLE IF EXISTS domain_health_history;