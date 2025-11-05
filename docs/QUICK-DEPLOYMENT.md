# 🚀 QUICK START - Production Deployment

**Untuk:** Tim IT DISKOMINFO yang akan deploy pertama kali  
**Waktu:** ~2-3 jam untuk setup lengkap

---

## 📝 PREREQUISITES

Pastikan sudah punya:
- ✅ Server Ubuntu 22.04 LTS dengan akses root/sudo
- ✅ Domain: `domain-manager.kalbarprov.go.id` (atau subdomain lain)
- ✅ Backup database dari development (file .sql.gz)
- ✅ Source code aplikasi
- ✅ Credentials database baru (user, password)

---

## ⚡ QUICK DEPLOYMENT (30 Minutes)

### Step 1: Setup Server (10 min)
```bash
# Login ke server
ssh admin@your-server-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18 LTS
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install MySQL (jika belum ada)
sudo apt install -y mysql-server

# Install Nginx
sudo apt install -y nginx

# Install PM2
sudo npm install -g pm2

# Install Certbot (untuk SSL)
sudo apt install -y certbot python3-certbot-nginx
```

### Step 2: Setup Database (10 min)
```bash
# Login ke MySQL
sudo mysql

# Buat database dan user
CREATE DATABASE domain_manager CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'domain_app'@'localhost' IDENTIFIED BY 'PASSWORD_KUAT_DI_SINI';
GRANT ALL PRIVILEGES ON domain_manager.* TO 'domain_app'@'localhost';
FLUSH PRIVILEGES;
EXIT;

# Import backup database
gunzip -c backup.sql.gz | mysql -u domain_app -p domain_manager

# Verify
mysql -u domain_app -p domain_manager
SHOW TABLES;
SELECT COUNT(*) FROM users;
EXIT;
```

### Step 3: Deploy Application (10 min)
```bash
# Create directory
sudo mkdir -p /var/www/domain-manager
sudo chown -R $USER:$USER /var/www/domain-manager

# Clone/upload source code
cd /var/www/domain-manager
# (upload via SCP atau clone dari git)

# Create .env.production
nano .env.production
```
```env
NODE_ENV=production
DB_HOST=localhost
DB_PORT=3306
DB_USER=domain_app
DB_PASSWORD=your_strong_password
DB_NAME=domain_manager
PORT=3000
```
```bash
# Install dependencies & build
npm install --production
npm run build

# Start with PM2
pm2 start npm --name "domain-manager" -- start
pm2 startup
pm2 save

# Verify running
pm2 status
```

### Step 4: Setup Nginx (5 min)
```bash
# Create Nginx config
sudo nano /etc/nginx/sites-available/domain-manager
```
Paste this config:
```nginx
server {
    listen 80;
    server_name domain-manager.kalbarprov.go.id;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```
```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/domain-manager /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Step 5: Setup SSL (5 min)
```bash
# Get SSL certificate
sudo certbot --nginx -d domain-manager.kalbarprov.go.id

# Test auto-renewal
sudo certbot renew --dry-run
```

### Step 6: Verify (5 min)
```bash
# Check all services
sudo systemctl status nginx
pm2 status
mysql -u domain_app -p -e "SELECT COUNT(*) FROM domain_manager.users;"

# Test application
curl https://domain-manager.kalbarprov.go.id
```

✅ **DONE!** Aplikasi seharusnya sudah running di `https://domain-manager.kalbarprov.go.id`

---

## 🔧 COMMON COMMANDS

### Application Management
```bash
# Start application
pm2 start domain-manager

# Stop application
pm2 stop domain-manager

# Restart application
pm2 restart domain-manager

# View logs
pm2 logs domain-manager

# Monitor resources
pm2 monit
```

### Nginx Management
```bash
# Test config
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx

# Check status
sudo systemctl status nginx

# View access logs
sudo tail -f /var/log/nginx/access.log

# View error logs
sudo tail -f /var/log/nginx/error.log
```

### Database Management
```bash
# Login to MySQL
mysql -u domain_app -p domain_manager

# Backup database
mysqldump -u domain_app -p domain_manager | gzip > backup_$(date +%Y%m%d).sql.gz

# Check database size
mysql -u domain_app -p -e "SELECT table_schema, SUM(data_length + index_length) / 1024 / 1024 AS 'Size (MB)' FROM information_schema.tables WHERE table_schema = 'domain_manager';"

# Show active connections
mysql -u root -p -e "SHOW PROCESSLIST;"
```

---

## 🔥 TROUBLESHOOTING

### Problem: Application tidak bisa diakses
```bash
# Check PM2 status
pm2 status
pm2 logs domain-manager --lines 50

# Check if app is listening
sudo netstat -tulpn | grep 3000

# Restart
pm2 restart domain-manager
```

### Problem: Database connection error
```bash
# Check MySQL running
sudo systemctl status mysql

# Test connection
mysql -u domain_app -p -h localhost domain_manager

# Check credentials in .env.production
cat /var/www/domain-manager/.env.production
```

### Problem: Nginx tidak bisa akses aplikasi
```bash
# Check Nginx config
sudo nginx -t

# Check Nginx running
sudo systemctl status nginx

# Check logs
sudo tail -f /var/log/nginx/error.log

# Restart Nginx
sudo systemctl restart nginx
```

### Problem: SSL certificate error
```bash
# Check certificate
sudo certbot certificates

# Renew manually
sudo certbot renew

# Check Nginx config
sudo nginx -t
```

### Problem: Out of memory
```bash
# Check memory usage
free -h
pm2 monit

# Restart application
pm2 restart domain-manager

# If persistent, increase server RAM or add swap
```

---

## 📊 MONITORING

### Check Application Health
```bash
# CPU & Memory usage
pm2 monit

# Server resources
htop

# Disk space
df -h

# Active connections
sudo netstat -an | grep :3000 | wc -l
```

### Check Logs
```bash
# Application logs
pm2 logs domain-manager

# Nginx access logs
sudo tail -f /var/log/nginx/access.log

# Nginx error logs
sudo tail -f /var/log/nginx/error.log

# MySQL error logs
sudo tail -f /var/log/mysql/error.log

# System logs
sudo journalctl -u nginx -f
```

---

## 🔐 SECURITY CHECKLIST

```bash
# Enable firewall
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable

# Disable MySQL remote access
# Edit /etc/mysql/mysql.conf.d/mysqld.cnf
# Make sure: bind-address = 127.0.0.1

# Change default passwords
# - Database password
# - Super Admin password
# - SSH keys

# Setup fail2ban
sudo apt install fail2ban
sudo systemctl enable fail2ban
```

---

## 📞 NEED HELP?

### Check Documentation
1. `/docs/DEPLOYMENT-GUIDE.md` - Full deployment guide
2. `/docs/HANDOVER-CHECKLIST.md` - Handover checklist
3. `/docs/ARCHITECTURE.md` - System architecture
4. `/README.md` - Project overview

### Contact Developer
- Email: [your-email]
- Phone: [your-phone]
- Support Hours: [hours]

### Emergency
- Level 1: DISKOMINFO Help Desk
- Level 2: DISKOMINFO IT Team
- Level 3: Developer (You)

---

**Last Updated:** November 5, 2025  
**Version:** 1.0
