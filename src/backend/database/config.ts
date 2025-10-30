import { createPool } from 'mysql2/promise';
import { DatabasePool } from './types';

// Baca konfigurasi dari environment variables
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'domain_manager',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Buat pool koneksi
const pool = createPool(dbConfig) as unknown as DatabasePool;

export { pool as db };