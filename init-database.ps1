# ===============================================
# Database Initialization Script
# ===============================================
# This script will:
# 1. Create domain_manager database
# 2. Create all tables (users, domains, hostings, etc.)
# 3. Insert initial seed data
# ===============================================

Write-Host "`n=== DATABASE INITIALIZATION ===" -ForegroundColor Green

# Load environment variables
$envFile = ".env.local"
$DB_HOST = "localhost"
$DB_USER = "root"
$DB_PASSWORD = "Taksaka99"
$DB_NAME = "domain_manager"

if (Test-Path $envFile) {
    Get-Content $envFile | ForEach-Object {
        if ($_ -match '^DB_HOST=(.*)$') { $DB_HOST = $matches[1].Trim() }
        if ($_ -match '^DB_USER=(.*)$') { $DB_USER = $matches[1].Trim() }
        if ($_ -match '^DB_PASSWORD=(.*)$') { $DB_PASSWORD = $matches[1].Trim() }
        if ($_ -match '^DB_NAME=(.*)$') { $DB_NAME = $matches[1].Trim() }
    }
}

$MYSQL_PATH = "C:\AppServ\MySQL\bin\mysql.exe"

Write-Host "`nConfiguration:" -ForegroundColor Cyan
Write-Host "   Host: $DB_HOST" -ForegroundColor White
Write-Host "   User: $DB_USER" -ForegroundColor White
Write-Host "   Database: $DB_NAME" -ForegroundColor White

# Test MySQL connection
Write-Host "`nTesting MySQL connection..." -ForegroundColor Yellow
$testConnection = & $MYSQL_PATH -h $DB_HOST -u $DB_USER -p$DB_PASSWORD -e "SELECT 1;" 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] MySQL connection failed!" -ForegroundColor Red
    Write-Host "   Error: $testConnection" -ForegroundColor Red
    exit 1
}
Write-Host "[OK] MySQL connection successful!" -ForegroundColor Green

# Drop existing database if exists
Write-Host "`nDropping existing database (if exists)..." -ForegroundColor Yellow
& $MYSQL_PATH -h $DB_HOST -u $DB_USER -p$DB_PASSWORD -e "DROP DATABASE IF EXISTS $DB_NAME;" 2>&1 | Out-Null

# Create database
Write-Host "`nCreating database: $DB_NAME..." -ForegroundColor Cyan
& $MYSQL_PATH -h $DB_HOST -u $DB_USER -p$DB_PASSWORD -e "CREATE DATABASE $DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Failed to create database!" -ForegroundColor Red
    exit 1
}
Write-Host "[OK] Database created successfully!" -ForegroundColor Green

# Run schema SQL
Write-Host "`nCreating tables from schema..." -ForegroundColor Cyan
$schemaFile = "src\backend\database\schema.sql"
if (Test-Path $schemaFile) {
    # Skip CREATE DATABASE and USE commands (already done)
    $schemaContent = Get-Content $schemaFile -Raw
    $schemaContent = $schemaContent -replace "CREATE DATABASE.*?;", ""
    $schemaContent = $schemaContent -replace "USE.*?;", ""
    
    $tempSchema = "temp-schema.sql"
    $schemaContent | Out-File -FilePath $tempSchema -Encoding UTF8
    
    Get-Content $tempSchema | & $MYSQL_PATH -h $DB_HOST -u $DB_USER -p$DB_PASSWORD $DB_NAME 2>&1 | Out-Null
    Remove-Item $tempSchema
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[OK] Tables created successfully!" -ForegroundColor Green
    } else {
        Write-Host "[ERROR] Failed to create tables!" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "[ERROR] Schema file not found: $schemaFile" -ForegroundColor Red
    exit 1
}

# Run seed data
Write-Host "`nInserting initial seed data..." -ForegroundColor Cyan
$seederFiles = Get-ChildItem "src\backend\database\seeders\*.sql" | Sort-Object Name

foreach ($seederFile in $seederFiles) {
    Write-Host "   Running: $($seederFile.Name)" -ForegroundColor White
    Get-Content $seederFile.FullName | & $MYSQL_PATH -h $DB_HOST -u $DB_USER -p$DB_PASSWORD $DB_NAME 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   [OK] Success" -ForegroundColor Green
    } else {
        Write-Host "   [WARN] Seeder may have failed" -ForegroundColor Yellow
    }
}

# Verify tables
Write-Host "`nVerifying tables..." -ForegroundColor Cyan
$tables = & $MYSQL_PATH -h $DB_HOST -u $DB_USER -p$DB_PASSWORD $DB_NAME -e "SHOW TABLES;" 2>&1
Write-Host $tables -ForegroundColor White

# Count records
Write-Host "`nCounting records..." -ForegroundColor Cyan
$counts = @(
    "users",
    "opds",
    "applications",
    "domains",
    "hostings"
)

foreach ($table in $counts) {
    $count = & $MYSQL_PATH -h $DB_HOST -u $DB_USER -p$DB_PASSWORD $DB_NAME -e "SELECT COUNT(*) as count FROM $table;" -N 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   $table : $count rows" -ForegroundColor White
    }
}

Write-Host "`nDATABASE INITIALIZATION COMPLETE!" -ForegroundColor Green
Write-Host "`nNext steps:" -ForegroundColor Yellow
Write-Host "   1. Restart dev server: npm run dev" -ForegroundColor White
Write-Host "   2. Refresh browser at http://localhost:9002" -ForegroundColor White
Write-Host "   3. Database errors should be gone!" -ForegroundColor White
Write-Host ""
