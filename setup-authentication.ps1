# Setup Authentication System
# Script untuk menambahkan fitur autentikasi ke database yang sudah ada

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  Domain Manager - Authentication Setup" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Database configuration
$dbHost = "localhost"
$dbUser = "root"
$dbPassword = ""
$dbName = "domain_manager"

Write-Host "Database Configuration:" -ForegroundColor Yellow
Write-Host "  Host: $dbHost"
Write-Host "  User: $dbUser"
Write-Host "  Database: $dbName"
Write-Host ""

# Check if MySQL is running
Write-Host "Checking MySQL service..." -ForegroundColor Yellow
$mysqlService = Get-Service -Name "MySQL*" -ErrorAction SilentlyContinue
if ($null -eq $mysqlService) {
    Write-Host "ERROR: MySQL service not found!" -ForegroundColor Red
    Write-Host "Please start XAMPP MySQL service first." -ForegroundColor Red
    exit 1
}

if ($mysqlService.Status -ne "Running") {
    Write-Host "ERROR: MySQL service is not running!" -ForegroundColor Red
    Write-Host "Please start XAMPP MySQL service first." -ForegroundColor Red
    exit 1
}

Write-Host "✓ MySQL service is running" -ForegroundColor Green
Write-Host ""

# Execute SQL script
Write-Host "Applying authentication schema changes..." -ForegroundColor Yellow

$sqlScript = @"
-- Tambah kolom baru ke tabel users jika belum ada
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255) NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS full_name VARCHAR(100) NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS opd_address TEXT,
ADD COLUMN IF NOT EXISTS contact VARCHAR(20);

-- Update role format
UPDATE users SET role = 'Admin Daerah' WHERE role = 'AdminDaerah';
UPDATE users SET role = 'Super Admin' WHERE role = 'SuperAdmin';

-- Buat tabel untuk tracking login Super Admin
CREATE TABLE IF NOT EXISTS super_admin_sessions (
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

-- Insert OPD Diskominfo jika belum ada
INSERT INTO opds (name, address, contact_person, phone_number)
SELECT 'Diskominfo Provinsi Kalimantan Barat', 
       'Kompleks Kantor Gubernur Kalimantan Barat', 
       'Super Admin', 
       '0564123145'
WHERE NOT EXISTS (
    SELECT 1 FROM opds WHERE name = 'Diskominfo Provinsi Kalimantan Barat'
);

SELECT 'Authentication schema updated successfully!' as message;
"@

# Save to temp file
$tempFile = [System.IO.Path]::GetTempFileName()
$sqlScript | Out-File -FilePath $tempFile -Encoding UTF8

try {
    # Execute using mysql command
    $mysqlPath = "C:\xampp\mysql\bin\mysql.exe"
    
    if (-not (Test-Path $mysqlPath)) {
        Write-Host "ERROR: MySQL executable not found at $mysqlPath" -ForegroundColor Red
        Write-Host "Please update the script with correct MySQL path." -ForegroundColor Red
        exit 1
    }

    $arguments = "-h$dbHost -u$dbUser"
    if ($dbPassword) {
        $arguments += " -p$dbPassword"
    }
    $arguments += " $dbName"

    Get-Content $tempFile | & $mysqlPath $arguments

    Write-Host "✓ Database schema updated successfully!" -ForegroundColor Green
    Write-Host ""

} catch {
    Write-Host "ERROR: Failed to execute SQL script" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
} finally {
    Remove-Item $tempFile -ErrorAction SilentlyContinue
}

# Create Super Admin account via API
Write-Host "Creating default Super Admin account..." -ForegroundColor Yellow
Write-Host ""

try {
    # Check if server is running
    $response = Invoke-WebRequest -Uri "http://localhost:9002/api/auth/setup" -Method POST -ErrorAction Stop
    $result = $response.Content | ConvertFrom-Json

    if ($result.success) {
        Write-Host "✓ Super Admin account created successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Default Super Admin Credentials:" -ForegroundColor Cyan
        Write-Host "  Username: superadmin" -ForegroundColor White
        Write-Host "  Email: superadmin@kalbarprov.go.id" -ForegroundColor White
        Write-Host "  Password: Superadmin123" -ForegroundColor White
        Write-Host ""
        Write-Host "IMPORTANT: Please change the password after first login!" -ForegroundColor Yellow
    } else {
        Write-Host "Warning: $($result.message)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "Warning: Could not create Super Admin via API" -ForegroundColor Yellow
    Write-Host "Reason: Server might not be running" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Please run this command after starting the server:" -ForegroundColor Yellow
    Write-Host "  curl -X POST http://localhost:9002/api/auth/setup" -ForegroundColor White
    Write-Host ""
}

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  Setup Complete!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Start the development server: npm run dev"
Write-Host "  2. Open browser: http://localhost:9002"
Write-Host "  3. Login with Super Admin credentials"
Write-Host "  4. Admin Daerah can register at: /register"
Write-Host ""
Write-Host "Documentation: AUTHENTICATION-SYSTEM.md" -ForegroundColor Cyan
Write-Host ""
