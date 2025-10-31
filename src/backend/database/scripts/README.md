# Database Scripts

## Overview
This directory contains database management scripts for the Domain Manager application.

## Scripts

### Migration Script (`migrate.ts`)
Automated database migration script that:
- Tests database connection
- Executes schema.sql to create tables
- Runs incremental migrations
- Validates database structure

```bash
# Run migration
npx ts-node src/backend/database/scripts/migrate.ts
```

### Seed Script (`seed.ts`)
Database seeding script that populates the database with:
- OPD (Organisasi Perangkat Daerah) data
- Default users with different roles
- Sample applications
- Sample domains for testing

```bash
# Run seeding
npx ts-node src/backend/database/scripts/seed.ts
```

## Usage

### Development Setup
1. Configure database connection in `.env`
2. Run migrations: `npx ts-node src/backend/database/scripts/migrate.ts`
3. Seed database: `npx ts-node src/backend/database/scripts/seed.ts`

### Testing
The seed script includes automated tests to verify:
- UserService operations
- DomainService operations  
- ApplicationService operations
- Statistics calculations

## Database Services

### UserService
- User CRUD operations
- Role-based filtering
- OPD association
- User existence validation

### DomainService
- Domain CRUD operations
- Status management
- Expiry tracking
- Domain existence validation

### ApplicationService
- Application CRUD operations
- Status workflow (pending → approved/rejected)
- OPD auto-creation
- Statistics tracking

## Notes
- All services use connection pooling for performance
- Error handling with descriptive messages
- Type-safe interfaces
- Comprehensive pagination support
