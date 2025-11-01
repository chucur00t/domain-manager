# 🚀 Quick Start Guide - Database Migration

Panduan cepat untuk memulai migrasi dari mock data ke MySQL database.

## Prerequisites Checklist

- [ ] MySQL 8.0+ installed
- [ ] Node.js 20.x installed
- [ ] Project dependencies installed (`npm install`)

## Quick Setup (5 minutes)

### 1️⃣ Create Database

```bash
# Login to MySQL
mysql -u root -p

# Run this in MySQL console:
CREATE DATABASE domain_manager CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

### 2️⃣ Run Schema

```bash
# From project root
mysql -u root -p domain_manager < src/backend/database/schema.sql
```

### 3️⃣ Load Sample Data (Optional)

```bash
mysql -u root -p domain_manager < src/backend/database/seeders/001-initial-data.sql
```

### 4️⃣ Configure Environment

```bash
# Copy example file
cp .env.example .env.local
```

**Edit `.env.local`:**
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=domain_manager
```

### 5️⃣ Test Connection

Create `test-connection.js`:
```javascript
const mysql = require('mysql2/promise');

async function test() {
  try {
    const conn = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'your_password',
      database: 'domain_manager'
    });
    
    const [rows] = await conn.execute('SELECT COUNT(*) as count FROM users');
    console.log('✅ Connected! Users:', rows[0].count);
    await conn.end();
  } catch (error) {
    console.error('❌ Failed:', error.message);
  }
}

test();
```

Run test:
```bash
node test-connection.js
```

## What's Been Done ✅

1. ✅ Database helpers and utilities created
2. ✅ User Repository implemented
3. ✅ Database schema ready
4. ✅ Sample data seeder ready
5. ✅ Configuration files set up

## What's Next 🔄

1. **Complete Repositories** (80% remaining)
   - OPD Repository
   - Application Repository
   - Domain Repository
   - Hosting Repository
   - Document Repository
   - Audit Log Repository

2. **Update Services** (100% remaining)
   - Migrate from mock data to repositories
   - Update all service methods

3. **Update Server Actions** (100% remaining)
   - Update to use new service layer
   - Test all endpoints

## File Structure

```
src/backend/
├── database/
│   ├── config.ts              ✅ MySQL connection config
│   ├── helpers.ts             ✅ Query helpers
│   ├── schema.sql             ✅ Database schema
│   ├── repositories/
│   │   └── user.repository.ts ✅ User CRUD operations
│   └── seeders/
│       └── 001-initial-data.sql ✅ Sample data
├── services/
│   └── firebase/
│       └── services.ts        🔄 Needs update
└── actions/
    ├── applications.ts        ❌ Needs update
    ├── domains.ts            ❌ Needs update
    ├── hosting.ts            ❌ Needs update
    └── users.ts              ❌ Needs update
```

## Current Progress: 22%

| Phase | Status | Progress |
|-------|--------|----------|
| Database Setup | ✅ Complete | 100% |
| Repository Pattern | 🔄 In Progress | 14% |
| Service Migration | ❌ Not Started | 0% |
| Action Updates | ❌ Not Started | 0% |

## Need Help?

### Common Issues

**Can't connect to MySQL?**
```bash
# Check if MySQL is running
sudo systemctl status mysql  # Linux
brew services list           # macOS

# Start MySQL
sudo systemctl start mysql   # Linux
brew services start mysql    # macOS
```

**Access denied?**
```sql
ALTER USER 'root'@'localhost' IDENTIFIED BY 'new_password';
FLUSH PRIVILEGES;
```

**Tables not created?**
```bash
# Re-run schema
mysql -u root -p domain_manager < src/backend/database/schema.sql
```

## Documentation

- 📖 [DATABASE_SETUP.md](DATABASE_SETUP.md) - Detailed setup guide
- 📊 [MIGRATION_PROGRESS.md](MIGRATION_PROGRESS.md) - Progress tracking
- 📋 [SRS & SDD](docs/) - Requirements & design docs

## Next Actions

Run these commands to continue:

```bash
# 1. Verify database setup
mysql -u root -p -e "USE domain_manager; SHOW TABLES;"

# 2. Check data loaded
mysql -u root -p -e "USE domain_manager; SELECT COUNT(*) FROM users;"

# 3. Start development server
npm run dev

# 4. Open in browser
# http://localhost:9002
```

## Timeline

- **Week 1**: Complete repositories ← YOU ARE HERE
- **Week 2**: Migrate services
- **Week 3**: Update actions & test
- **Week 4**: Remove mock data, production ready

---

**Ready to continue?** 

See [MIGRATION_PROGRESS.md](MIGRATION_PROGRESS.md) for detailed tasks.

**Questions?** Check [DATABASE_SETUP.md](DATABASE_SETUP.md) for troubleshooting.
