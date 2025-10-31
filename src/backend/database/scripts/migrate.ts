import { db } from '../config.js';
import { readFileSync } from 'fs';
import { join } from 'path';

export async function runMigrations(): Promise<void> {
  try {
    console.log('🚀 Starting database migrations...');

    // Read and execute schema.sql
    const schemaPath = join(process.cwd(), 'src/backend/database/schema.sql');
    const schemaSql = readFileSync(schemaPath, 'utf-8');
    
    console.log('📄 Executing schema.sql...');
    await db.execute(schemaSql);
    
    // Execute migration files
    const migrationFiles = [
      '004_create_domain_health_history.sql',
      '005_create_password_reset_tokens.sql'
    ];
    
    for (const migrationFile of migrationFiles) {
      try {
        const migrationPath = join(process.cwd(), `src/backend/database/migrations/${migrationFile}`);
        const migrationSql = readFileSync(migrationPath, 'utf-8');
        console.log(`📄 Executing migration: ${migrationFile}...`);
        await db.execute(migrationSql);
      } catch (error) {
        console.log(`⚠️ Migration ${migrationFile} may already be applied`);
      }
    }

    console.log('✅ Database migrations completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

export async function checkDatabaseConnection(): Promise<void> {
  try {
    console.log('🔌 Testing database connection...');
    
    const [rows] = await db.execute('SELECT 1 as test');
    console.log('✅ Database connection successful!');
    
    // Check if required tables exist
    const tables = ['users', 'applications', 'domains', 'opds', 'audit_logs'];
    for (const table of tables) {
      try {
        await db.execute(`SELECT COUNT(*) FROM ${table}`);
        console.log(`✅ Table '${table}' exists and accessible`);
      } catch (error) {
        console.log(`⚠️ Table '${table}' may not exist or not accessible`);
      }
    }
    
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
}

// CLI execution
if (require.main === module) {
  (async () => {
    try {
      await checkDatabaseConnection();
      await runMigrations();
    } catch (error) {
      console.error('Migration process failed:', error);
      process.exit(1);
    } finally {
      process.exit(0);
    }
  })();
}
