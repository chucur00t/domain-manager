// Database configuration dengan fallback untuk serverless environment
interface DatabaseConfig {
  host: string;
  user: string;
  password: string;
  database: string;
  waitForConnections: boolean;
  connectionLimit: number;
  queueLimit: number;
}

// Baca konfigurasi dari environment variables
const dbConfig: DatabaseConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'domain_manager',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Mock database untuk environment yang tidak support mysql2
const createMockDb = () => ({
  execute: async (query: string) => {
    console.warn('🔶 Using mock database - mysql2 not available');
    return [{ mock: true }];
  },
  getConnection: async () => ({
    execute: async (query: string) => [{ mock: true }],
    release: () => {}
  })
});

// Coba setup database pool, fallback ke mock jika gagal
let pool: any;

try {
  // Import mysql2 hanya di environment yang mendukungnya
  if (typeof window === 'undefined' && process.env.NODE_ENV !== 'test') {
    const mysql = await import('mysql2/promise');
    pool = mysql.createPool(dbConfig);
  } else {
    pool = createMockDb();
  }
} catch (error) {
  console.warn('⚠️ Database connection failed, using mock implementation');
  pool = createMockDb();
}

export const db = pool;

// Also export default untuk compatibility
export default db;
