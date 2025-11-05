#!/bin/bash

#######################################################
# Database Migration Script
# From: Development Server (Your Personal Server)
# To: Production Server (Government Server)
#######################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Domain Manager - Database Migration ===${NC}"
echo ""

# ===================================
# CONFIGURATION
# ===================================

# Source Database (Your Personal Server)
read -p "Source DB Host (your personal server): " SRC_HOST
read -p "Source DB Port [3306]: " SRC_PORT
SRC_PORT=${SRC_PORT:-3306}
read -p "Source DB User: " SRC_USER
read -sp "Source DB Password: " SRC_PASS
echo ""
read -p "Source DB Name [domain_manager]: " SRC_DB
SRC_DB=${SRC_DB:-domain_manager}

echo ""

# Target Database (Government Server)
read -p "Target DB Host (production server) [localhost]: " TGT_HOST
TGT_HOST=${TGT_HOST:-localhost}
read -p "Target DB Port [3306]: " TGT_PORT
TGT_PORT=${TGT_PORT:-3306}
read -p "Target DB User: " TGT_USER
read -sp "Target DB Password: " TGT_PASS
echo ""
read -p "Target DB Name [domain_manager]: " TGT_DB
TGT_DB=${TGT_DB:-domain_manager}

# Backup directory
BACKUP_DIR="./database-migration-backup"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/domain_manager_$TIMESTAMP.sql"

echo ""
echo -e "${YELLOW}=== Configuration ===${NC}"
echo "Source: $SRC_USER@$SRC_HOST:$SRC_PORT/$SRC_DB"
echo "Target: $TGT_USER@$TGT_HOST:$TGT_PORT/$TGT_DB"
echo "Backup: $BACKUP_FILE"
echo ""

read -p "Continue with migration? (yes/no): " CONFIRM
if [ "$CONFIRM" != "yes" ]; then
    echo -e "${RED}Migration cancelled.${NC}"
    exit 1
fi

# ===================================
# CREATE BACKUP DIRECTORY
# ===================================
echo ""
echo -e "${GREEN}[1/6] Creating backup directory...${NC}"
mkdir -p $BACKUP_DIR

# ===================================
# EXPORT FROM SOURCE
# ===================================
echo -e "${GREEN}[2/6] Exporting database from source...${NC}"
mysqldump -h $SRC_HOST -P $SRC_PORT -u $SRC_USER -p$SRC_PASS \
    --single-transaction \
    --routines \
    --triggers \
    --events \
    --add-drop-database \
    --databases $SRC_DB > $BACKUP_FILE

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Export successful: $BACKUP_FILE${NC}"
    
    # Get file size
    FILE_SIZE=$(du -h $BACKUP_FILE | cut -f1)
    echo "  File size: $FILE_SIZE"
    
    # Count tables
    TABLE_COUNT=$(grep -c "CREATE TABLE" $BACKUP_FILE || echo "0")
    echo "  Tables: $TABLE_COUNT"
else
    echo -e "${RED}✗ Export failed!${NC}"
    exit 1
fi

# ===================================
# COMPRESS BACKUP
# ===================================
echo ""
echo -e "${GREEN}[3/6] Compressing backup...${NC}"
gzip -f $BACKUP_FILE
BACKUP_FILE="$BACKUP_FILE.gz"

if [ -f "$BACKUP_FILE" ]; then
    COMPRESSED_SIZE=$(du -h $BACKUP_FILE | cut -f1)
    echo -e "${GREEN}✓ Compression successful${NC}"
    echo "  Compressed size: $COMPRESSED_SIZE"
else
    echo -e "${RED}✗ Compression failed!${NC}"
    exit 1
fi

# ===================================
# VERIFY TARGET CONNECTION
# ===================================
echo ""
echo -e "${GREEN}[4/6] Verifying target database connection...${NC}"
mysql -h $TGT_HOST -P $TGT_PORT -u $TGT_USER -p$TGT_PASS -e "SELECT VERSION();" > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Connection successful${NC}"
else
    echo -e "${RED}✗ Cannot connect to target database!${NC}"
    echo "Please check your credentials and try again."
    exit 1
fi

# ===================================
# CREATE DATABASE IF NOT EXISTS
# ===================================
echo ""
echo -e "${GREEN}[5/6] Creating target database...${NC}"
mysql -h $TGT_HOST -P $TGT_PORT -u $TGT_USER -p$TGT_PASS -e "CREATE DATABASE IF NOT EXISTS $TGT_DB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Database ready${NC}"
else
    echo -e "${RED}✗ Cannot create database!${NC}"
    exit 1
fi

# ===================================
# IMPORT TO TARGET
# ===================================
echo ""
echo -e "${GREEN}[6/6] Importing to target database...${NC}"
echo -e "${YELLOW}This may take a few minutes...${NC}"

gunzip -c $BACKUP_FILE | mysql -h $TGT_HOST -P $TGT_PORT -u $TGT_USER -p$TGT_PASS $TGT_DB

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Import successful${NC}"
else
    echo -e "${RED}✗ Import failed!${NC}"
    exit 1
fi

# ===================================
# VERIFY IMPORT
# ===================================
echo ""
echo -e "${GREEN}=== Verifying Import ===${NC}"

# Count tables
TABLE_COUNT=$(mysql -h $TGT_HOST -P $TGT_PORT -u $TGT_USER -p$TGT_PASS $TGT_DB -e "SHOW TABLES;" | wc -l)
TABLE_COUNT=$((TABLE_COUNT - 1))  # Remove header
echo "Tables imported: $TABLE_COUNT"

# Count records in key tables
USERS_COUNT=$(mysql -h $TGT_HOST -P $TGT_PORT -u $TGT_USER -p$TGT_PASS $TGT_DB -e "SELECT COUNT(*) FROM users;" -N 2>/dev/null || echo "N/A")
APPS_COUNT=$(mysql -h $TGT_HOST -P $TGT_PORT -u $TGT_USER -p$TGT_PASS $TGT_DB -e "SELECT COUNT(*) FROM applications;" -N 2>/dev/null || echo "N/A")
DOMAINS_COUNT=$(mysql -h $TGT_HOST -P $TGT_PORT -u $TGT_USER -p$TGT_PASS $TGT_DB -e "SELECT COUNT(*) FROM domains;" -N 2>/dev/null || echo "N/A")

echo "Records:"
echo "  - Users: $USERS_COUNT"
echo "  - Applications: $APPS_COUNT"
echo "  - Domains: $DOMAINS_COUNT"

# ===================================
# SUMMARY
# ===================================
echo ""
echo -e "${GREEN}=== Migration Complete! ===${NC}"
echo ""
echo "Backup file: $BACKUP_FILE"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "1. Update .env.production with new database credentials"
echo "2. Test application connection to new database"
echo "3. Verify all data is accessible"
echo "4. Keep backup file safe for at least 30 days"
echo ""
echo -e "${GREEN}✓ Done!${NC}"
