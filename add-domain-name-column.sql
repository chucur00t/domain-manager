-- Add requested_domain_name column to applications table
ALTER TABLE applications 
ADD COLUMN requested_domain_name VARCHAR(255) AFTER application_type;

-- Add index for performance
ALTER TABLE applications 
ADD INDEX idx_requested_domain_name (requested_domain_name);
