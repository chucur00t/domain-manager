# 🚀 PANDUAN DEPLOYMENT KE PRODUCTION (PEMERINTAH)

**Tanggal:** 5 November 2025  
**Untuk:** Pemprov Kalimantan Barat  
**Status:** DRAFT - Perlu Review Tim IT Pemerintah

---

## 📊 OPSI DEPLOYMENT

### ✅ **OPSI 1: ON-PREMISE (RECOMMENDED)**
Deploy di server milik pemerintah di data center DISKOMINFO.

**Keuntungan:**
- Kedaulatan data (sesuai UU ITE & Perpres 95/2018)
- Kontrol penuh atas infrastruktur
- Keamanan tinggi sesuai standar pemerintah
- Biaya operasional lebih rendah dalam jangka panjang

**Kekurangan:**
- Butuh tim IT untuk maintenance
- Setup awal lebih kompleks
- Backup & disaster recovery perlu dikelola sendiri

---

### ⚠️ **OPSI 2: CLOUD (Azure/AWS/GCP)**
Deploy di cloud provider dengan sertifikasi pemerintah.

**Keuntungan:**
- Setup cepat & mudah
- Auto-scaling & high availability
- Managed backup & disaster recovery
- Tim vendor support 24/7

**Kekurangan:**
- Biaya bulanan tinggi (subscription)
- Data di luar kontrol langsung
- Perlu approval khusus (karena data pemerintah)

**Cloud yang Direkomendasikan:**
1. **Microsoft Azure** - Punya Azure Government (khusus pemerintah)
2. **AWS** - Punya data center Jakarta
3. **Google Cloud Platform** - Punya region Jakarta

---

## 🔧 PERSIAPAN DEPLOYMENT

### **1. SPESIFIKASI SERVER MINIMAL**

#### Production Server:
```
Web Server (Next.js):
- CPU: 4 cores (Intel Xeon/AMD EPYC)
- RAM: 8GB (16GB recommended)
- Storage: 50GB SSD
- OS: Ubuntu 22.04 LTS
- Network: 100 Mbps dedicated

Database Server (MySQL):
- CPU: 4 cores
- RAM: 16GB (32GB recommended untuk >10,000 records)
- Storage: 500GB SSD (RAID 10 untuk redundancy)
- OS: Ubuntu 22.04 LTS
- Network: 100 Mbps dedicated + Private VLAN

Backup Server:
- Storage: 1TB HDD/SSD
- Automated daily backup
- Retention: 30 days minimum
```

#### Development/Staging Server:
```
- CPU: 2 cores
- RAM: 4GB
- Storage: 50GB SSD
- OS: Ubuntu 22.04 LTS
```

---

### **2. NETWORK & SECURITY REQUIREMENTS**

#### Domain & SSL:
```
Domain: domain-manager.kalbarprov.go.id (atau subdomain lain)
SSL Certificate: 
  - Let's Encrypt (gratis, auto-renew)
  - atau SSL dari BSSN/Kominfo (berbayar)

DNS Records:
  A Record: domain-manager.kalbarprov.go.id → IP Server
  CNAME: www.domain-manager.kalbarprov.go.id → domain-manager.kalbarprov.go.id
```

#### Firewall Rules:
```
Allowed Inbound:
  - Port 80 (HTTP) - redirect to HTTPS
  - Port 443 (HTTPS) - Web access
  - Port 22 (SSH) - Admin only, IP whitelist

Blocked Inbound:
  - Port 3306 (MySQL) - Database tidak boleh diakses dari luar
  - All other ports

Allowed Outbound:
  - Port 80, 443 - Updates & API calls
  - Port 25, 587 - Email notifications (SMTP)
```

#### Security Measures:
```
1. Firewall: UFW/iptables + WAF (Web Application Firewall)
2. Fail2ban: Auto-block brute force attacks
3. SSH: Key-based authentication only (disable password)
4. Database: Bind to localhost only (127.0.0.1)
5. SSL: TLS 1.2+ only, disable weak ciphers
6. Rate Limiting: Nginx rate limit
7. DDoS Protection: Cloudflare atau sejenisnya
```

---

### **3. MIGRASI DATABASE**

#### Step 1: Export Database dari Development
```bash
# Di server development Anda saat ini
mysqldump -u root -p domain_manager > domain_manager_backup.sql

# Include stored procedures, triggers, views
mysqldump -u root -p --routines --triggers domain_manager > domain_manager_full_backup.sql

# Compress untuk transfer
gzip domain_manager_full_backup.sql
```

#### Step 2: Transfer ke Server Pemerintah
```bash
# Via SCP (Secure Copy)
scp domain_manager_full_backup.sql.gz admin@server-pemerintah:/tmp/

# Atau via SFTP client (WinSCP, FileZilla)
```

#### Step 3: Import di Server Pemerintah
```bash
# Login ke server pemerintah
ssh admin@server-pemerintah

# Extract backup
gunzip /tmp/domain_manager_full_backup.sql.gz

# Create database
mysql -u root -p
CREATE DATABASE domain_manager CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'domain_app'@'localhost' IDENTIFIED BY 'STRONG_PASSWORD_HERE';
GRANT ALL PRIVILEGES ON domain_manager.* TO 'domain_app'@'localhost';
FLUSH PRIVILEGES;
EXIT;

# Import data
mysql -u root -p domain_manager < /tmp/domain_manager_full_backup.sql

# Verify
mysql -u root -p domain_manager
SHOW TABLES;
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM applications;
EXIT;
```

---

### **4. UPDATE KONFIGURASI DATABASE**

#### Update file `.env.local` atau `.env.production`:
```env
# SEBELUM (Development - Server Pribadi):
DB_HOST=your-personal-server.com
DB_PORT=3306
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=domain_manager

# SESUDAH (Production - Server Pemerintah):
DB_HOST=localhost  # atau IP private server database
DB_PORT=3306
DB_USER=domain_app
DB_PASSWORD=STRONG_PASSWORD_FROM_GOVT_IT
DB_NAME=domain_manager

# Security (WAJIB diubah untuk production!)
DB_SSL=true
DB_SSL_CA=/path/to/ca-cert.pem  # Optional jika pakai SSL
```

#### Update file `src/backend/database/config.ts`:
```typescript
// Pastikan menggunakan environment variables
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  
  // PRODUCTION: Wajib enable SSL
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: true,
    ca: fs.readFileSync(process.env.DB_SSL_CA || '')
  } : undefined,
  
  // Connection pool untuk performance
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};
```

---

### **5. DEPLOYMENT STEPS**

#### A. Install Dependencies di Server
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18 LTS
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 (Process Manager)
sudo npm install -g pm2

# Install Nginx (Reverse Proxy)
sudo apt install -y nginx

# Install MySQL Client (untuk testing)
sudo apt install -y mysql-client
```

#### B. Clone & Build Application
```bash
# Create app directory
sudo mkdir -p /var/www/domain-manager
sudo chown -R $USER:$USER /var/www/domain-manager

# Clone repository (atau upload via FTP/SCP)
cd /var/www/domain-manager
git clone https://github.com/your-repo/domain-manager.git .

# Install dependencies
npm install --production

# Build Next.js
npm run build

# Test build
npm run start
```

#### C. Configure PM2 (Process Manager)
```bash
# Create PM2 ecosystem file
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'domain-manager',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/domain-manager',
    instances: 2,  // Sesuaikan dengan CPU cores
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/log/domain-manager/error.log',
    out_file: '/var/log/domain-manager/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    max_memory_restart: '1G'
  }]
};
EOF

# Create log directory
sudo mkdir -p /var/log/domain-manager
sudo chown -R $USER:$USER /var/log/domain-manager

# Start with PM2
pm2 start ecosystem.config.js

# Setup auto-start on boot
pm2 startup
pm2 save

# Monitor
pm2 monit
```

#### D. Configure Nginx (Reverse Proxy)
```bash
# Create Nginx config
sudo nano /etc/nginx/sites-available/domain-manager

# Paste this config:
```
```nginx
server {
    listen 80;
    server_name domain-manager.kalbarprov.go.id;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name domain-manager.kalbarprov.go.id;

    # SSL Certificate (ganti dengan path sebenarnya)
    ssl_certificate /etc/ssl/certs/domain-manager.crt;
    ssl_certificate_key /etc/ssl/private/domain-manager.key;
    
    # SSL Configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Logging
    access_log /var/log/nginx/domain-manager-access.log;
    error_log /var/log/nginx/domain-manager-error.log;

    # Rate Limiting
    limit_req_zone $binary_remote_addr zone=domain_limit:10m rate=10r/s;
    limit_req zone=domain_limit burst=20 nodelay;

    # Proxy to Next.js
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Static files caching
    location /_next/static {
        proxy_pass http://localhost:3000;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # File upload size limit
    client_max_body_size 10M;
}
```
```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/domain-manager /etc/nginx/sites-enabled/

# Test config
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

#### E. Setup SSL Certificate (Let's Encrypt)
```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d domain-manager.kalbarprov.go.id

# Auto-renew (already setup by certbot)
sudo certbot renew --dry-run
```

---

### **6. BACKUP & DISASTER RECOVERY**

#### Automated Daily Backup Script:
```bash
# Create backup script
sudo nano /usr/local/bin/backup-domain-manager.sh
```
```bash
#!/bin/bash

# Configuration
BACKUP_DIR="/backup/domain-manager"
DATE=$(date +%Y%m%d_%H%M%S)
DB_USER="domain_app"
DB_PASS="PASSWORD_HERE"
DB_NAME="domain_manager"
RETENTION_DAYS=30

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup database
mysqldump -u $DB_USER -p$DB_PASS $DB_NAME | gzip > $BACKUP_DIR/db_backup_$DATE.sql.gz

# Backup application files
tar -czf $BACKUP_DIR/app_backup_$DATE.tar.gz /var/www/domain-manager

# Delete old backups (older than retention period)
find $BACKUP_DIR -type f -mtime +$RETENTION_DAYS -delete

# Log
echo "$(date): Backup completed - $BACKUP_DIR/db_backup_$DATE.sql.gz" >> /var/log/backup.log
```
```bash
# Make executable
sudo chmod +x /usr/local/bin/backup-domain-manager.sh

# Setup cron job (daily at 2 AM)
sudo crontab -e
# Add this line:
0 2 * * * /usr/local/bin/backup-domain-manager.sh
```

---

### **7. MONITORING & MAINTENANCE**

#### A. Setup Monitoring
```bash
# Install monitoring tools
sudo apt install -y htop iotop nethogs

# PM2 monitoring
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7

# Database monitoring
mysql -u root -p
SHOW PROCESSLIST;
SHOW STATUS LIKE 'Threads_connected';
```

#### B. Log Monitoring
```bash
# Application logs
pm2 logs domain-manager

# Nginx logs
sudo tail -f /var/log/nginx/domain-manager-access.log
sudo tail -f /var/log/nginx/domain-manager-error.log

# MySQL logs
sudo tail -f /var/log/mysql/error.log
```

#### C. Performance Monitoring
```bash
# Server resources
htop
iotop
nethogs

# Database performance
mysql -u root -p
SHOW FULL PROCESSLIST;
SHOW ENGINE INNODB STATUS\G
```

---

### **8. SECURITY HARDENING**

#### A. Firewall (UFW)
```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
sudo ufw status
```

#### B. Fail2ban
```bash
sudo apt install -y fail2ban

# Configure
sudo nano /etc/fail2ban/jail.local
```
```ini
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5

[sshd]
enabled = true
port = 22
logpath = /var/log/auth.log

[nginx-limit-req]
enabled = true
port = http,https
logpath = /var/log/nginx/domain-manager-error.log
```
```bash
sudo systemctl restart fail2ban
```

#### C. SSH Hardening
```bash
sudo nano /etc/ssh/sshd_config
```
```
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
Port 22  # Atau ganti ke port lain
```
```bash
sudo systemctl restart sshd
```

---

### **9. KOORDINASI DENGAN TIM IT PEMERINTAH**

#### Checklist Diskusi:
- [ ] **Infrastruktur**: Spesifikasi server, network, storage
- [ ] **Domain**: Subdomain apa yang akan digunakan
- [ ] **SSL**: Dari mana (Let's Encrypt/BSSN/Kominfo)
- [ ] **Firewall**: Rules & IP whitelisting
- [ ] **Backup**: Lokasi, retention policy, disaster recovery
- [ ] **Monitoring**: Tools yang dipakai (Zabbix/Nagios/Prometheus)
- [ ] **Access Control**: Siapa saja yang punya akses SSH/Database
- [ ] **Maintenance Window**: Kapan boleh downtime untuk update
- [ ] **SLA**: Uptime target (99.9%?)
- [ ] **Support**: Eskalasi jika ada masalah

#### Dokumen yang Perlu Disiapkan:
1. **Dokumentasi Teknis** (arsitektur, API, database schema)
2. **User Manual** (untuk Admin Daerah & Super Admin)
3. **SOP Operasional** (backup, monitoring, troubleshooting)
4. **Security Assessment Report**
5. **Handover Document** (credentials, access, contact)

---

### **10. TESTING SEBELUM GO-LIVE**

#### Checklist Testing:
- [ ] **Functional Testing**: Semua fitur berfungsi
- [ ] **Performance Testing**: Load test dengan 100+ concurrent users
- [ ] **Security Testing**: Penetration test, vulnerability scan
- [ ] **Backup/Restore Testing**: Restore dari backup benar-benar work
- [ ] **Disaster Recovery Testing**: Simulasi server down
- [ ] **User Acceptance Testing (UAT)**: Dengan user sebenarnya
- [ ] **SSL Testing**: SSL Labs A+ rating
- [ ] **Mobile Testing**: Responsive di semua device

---

## 📞 KONTAK & ESKALASI

### Tim yang Terlibat:
1. **DISKOMINFO Kalimantan Barat**
   - Kepala Bidang TI
   - Tim Infrastruktur
   - Tim Keamanan Siber

2. **Developer/Vendor** (Anda)
   - Technical Support
   - On-call support (3 bulan pertama)

3. **User** 
   - Admin Daerah dari OPD
   - Super Admin (DISKOMINFO)

### Escalation Path:
```
Level 1: User → Help Desk DISKOMINFO
Level 2: Help Desk → Tim IT DISKOMINFO
Level 3: Tim IT → Developer (Anda)
Level 4: Developer → Vendor Infrastruktur (jika hardware issue)
```

---

## 📅 TIMELINE DEPLOYMENT (ESTIMATE)

```
Week 1-2: Persiapan
  - Survey server & network
  - Koordinasi dengan Tim IT
  - Persiapan dokumentasi
  - UAT planning

Week 3: Setup Infrastructure
  - Server setup
  - Network configuration
  - SSL certificate
  - Firewall rules

Week 4: Deployment
  - Database migration
  - Application deployment
  - Testing & verification
  - Monitoring setup

Week 5: UAT
  - User training
  - Pilot testing
  - Bug fixing
  - Documentation finalization

Week 6: Go-Live
  - Final deployment
  - Monitoring 24/7
  - On-call support
  - Handover to IT team
```

---

## ⚠️ PENTING!

### Hal yang WAJIB Diubah dari Development ke Production:
1. ✅ Database credentials (user, password, host)
2. ✅ JWT secret key (untuk authentication)
3. ✅ Environment variables (`.env.production`)
4. ✅ Disable debug mode
5. ✅ Enable SSL/HTTPS
6. ✅ Enable rate limiting
7. ✅ Enable logging & monitoring
8. ✅ Remove development tools
9. ✅ Update CORS settings
10. ✅ Change default admin password

### Hal yang TIDAK BOLEH Dilakukan:
❌ Expose database port (3306) ke public  
❌ Use weak password  
❌ Run as root user  
❌ Disable SSL  
❌ Skip backup  
❌ No monitoring  
❌ Hard-code credentials in code  
❌ Use development database in production  

---

**Disusun oleh:** [Nama Anda]  
**Tanggal:** 5 November 2025  
**Versi:** 1.0 - DRAFT  
**Status:** Menunggu Review Tim IT Pemerintah
