# ===============================================
# Database Setup untuk XAMPP
# ===============================================

Write-Host "`n=== SETUP DATABASE DENGAN XAMPP ===" -ForegroundColor Green

$DB_HOST = "localhost"
$DB_USER = "root"
$DB_PASSWORD = ""
$DB_NAME = "domain_manager"

# Path MySQL di XAMPP (sesuaikan jika berbeda)
$MYSQL_PATH = "C:\xampp\mysql\bin\mysql.exe"

# Cek apakah MySQL ada
if (-not (Test-Path $MYSQL_PATH)) {
    Write-Host "[ERROR] MySQL tidak ditemukan di: $MYSQL_PATH" -ForegroundColor Red
    Write-Host "Pastikan XAMPP sudah terinstall dan path MySQL benar." -ForegroundColor Yellow
    exit 1
}

Write-Host "`nKonfigurasi:" -ForegroundColor Cyan
Write-Host "   Host: $DB_HOST" -ForegroundColor White
Write-Host "   User: $DB_USER" -ForegroundColor White
Write-Host "   Database: $DB_NAME" -ForegroundColor White

# Test koneksi MySQL
Write-Host "`nMengecek koneksi MySQL..." -ForegroundColor Yellow
$testConnection = & $MYSQL_PATH -h $DB_HOST -u $DB_USER -e "SELECT 1;" 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Koneksi MySQL gagal!" -ForegroundColor Red
    Write-Host "   - Pastikan XAMPP MySQL sudah running (Start di XAMPP Control Panel)" -ForegroundColor Yellow
    Write-Host "   - Cek apakah port 3306 tidak diblokir" -ForegroundColor Yellow
    exit 1
}
Write-Host "[OK] Koneksi MySQL berhasil!" -ForegroundColor Green

# Cek apakah database sudah ada
Write-Host "`nMengecek database..." -ForegroundColor Yellow
$dbExists = & $MYSQL_PATH -h $DB_HOST -u $DB_USER -e "SHOW DATABASES LIKE '$DB_NAME';" -N 2>&1

if ($dbExists -match $DB_NAME) {
    Write-Host "[OK] Database '$DB_NAME' sudah ada!" -ForegroundColor Green
    Write-Host "   Akan menggunakan database yang sudah ada..." -ForegroundColor White
} else {
    Write-Host "Database belum ada, membuat database: $DB_NAME..." -ForegroundColor Cyan
    & $MYSQL_PATH -h $DB_HOST -u $DB_USER -e "CREATE DATABASE $DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERROR] Gagal membuat database!" -ForegroundColor Red
        exit 1
    }
    Write-Host "[OK] Database berhasil dibuat!" -ForegroundColor Green
}

# Import schema
Write-Host "`nMembuat tabel dari schema..." -ForegroundColor Cyan

# Cek file schema-tables-only.sql
$schemaFile = "src\backend\database\schema-tables-only.sql"
if (-not (Test-Path $schemaFile)) {
    # Fallback ke schema.sql
    $schemaFile = "src\backend\database\schema.sql"
}

if (Test-Path $schemaFile) {
    Write-Host "   Mengimport: $schemaFile" -ForegroundColor White
    
    # Import menggunakan redirect
    $errorOutput = & cmd /c "type `"$schemaFile`" | `"$MYSQL_PATH`" -h $DB_HOST -u $DB_USER $DB_NAME 2>&1"
    
    if ($LASTEXITCODE -eq 0 -or $errorOutput -notmatch "ERROR") {
        Write-Host "[OK] Schema berhasil diimport!" -ForegroundColor Green
    } else {
        Write-Host "[WARN] Ada warning, melanjutkan..." -ForegroundColor Yellow
        if ($errorOutput) {
            Write-Host "   Detail: $errorOutput" -ForegroundColor Gray
        }
    }
} else {
    Write-Host "[ERROR] File schema tidak ditemukan!" -ForegroundColor Red
    exit 1
}

# Import seed data
Write-Host "`nMengisi data awal..." -ForegroundColor Cyan
$seederFiles = Get-ChildItem "src\backend\database\seeders\*.sql" -ErrorAction SilentlyContinue | Sort-Object Name

if ($seederFiles) {
    foreach ($seederFile in $seederFiles) {
        Write-Host "   Running: $($seederFile.Name)" -ForegroundColor White
        Get-Content $seederFile.FullName | & $MYSQL_PATH -h $DB_HOST -u $DB_USER $DB_NAME 2>&1 | Out-Null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "   [OK] Berhasil" -ForegroundColor Green
        } else {
            Write-Host "   [WARN] Mungkin gagal" -ForegroundColor Yellow
        }
    }
} else {
    Write-Host "   [INFO] Tidak ada file seeder" -ForegroundColor Yellow
}

# Verifikasi tabel
Write-Host "`nMemverifikasi tabel yang dibuat..." -ForegroundColor Cyan
$tables = & $MYSQL_PATH -h $DB_HOST -u $DB_USER $DB_NAME -e "SHOW TABLES;" 2>&1
Write-Host $tables -ForegroundColor White

# Hitung jumlah record
Write-Host "`nMenghitung record..." -ForegroundColor Cyan
$tablesToCount = @("users", "opds", "applications", "domains", "hostings")

foreach ($table in $tablesToCount) {
    $count = & $MYSQL_PATH -h $DB_HOST -u $DB_USER $DB_NAME -e "SELECT COUNT(*) as count FROM $table;" -N 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   $table : $count rows" -ForegroundColor White
    }
}

Write-Host "`n=== SETUP DATABASE SELESAI! ===" -ForegroundColor Green
Write-Host "`nLangkah selanjutnya:" -ForegroundColor Yellow
Write-Host "   1. Pastikan file .env.local sudah dibuat dengan konfigurasi database" -ForegroundColor White
Write-Host "   2. Restart dev server: Ctrl+C lalu npm run dev" -ForegroundColor White
Write-Host "   3. Refresh browser di http://localhost:9002" -ForegroundColor White
Write-Host "   4. Data permohonan sekarang akan tersimpan di database!" -ForegroundColor White
Write-Host ""
