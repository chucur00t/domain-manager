import { db } from './config';
import type { RowDataPacket, ResultSetHeader } from 'mysql2';

/**
 * Helper functions untuk MySQL database operations
 */

export interface QueryResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Execute SELECT query dan return rows
 */
export async function query<T = any>(
  sql: string,
  params: any[] = []
): Promise<QueryResult<T[]>> {
  try {
    const [rows] = await db.execute(sql, params) as [T[], any];
    return { success: true, data: rows };
  } catch (error) {
    console.error('Database query error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown database error' 
    };
  }
}

/**
 * Execute INSERT/UPDATE/DELETE dan return affected info
 */
export async function execute(
  sql: string,
  params: any[] = []
): Promise<QueryResult<ResultSetHeader>> {
  try {
    const [result] = await db.execute(sql, params) as [ResultSetHeader, any];
    return { success: true, data: result };
  } catch (error) {
    console.error('Database execute error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown database error' 
    };
  }
}

/**
 * Execute query dan return single row
 */
export async function queryOne<T = any>(
  sql: string,
  params: any[] = []
): Promise<QueryResult<T | null>> {
  try {
    const [rows] = await db.execute(sql, params) as [T[], any];
    return { success: true, data: rows[0] || null };
  } catch (error) {
    console.error('Database queryOne error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown database error' 
    };
  }
}

/**
 * Execute transaction
 */
export async function transaction<T>(
  callback: (connection: any) => Promise<T>
): Promise<QueryResult<T>> {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return { success: true, data: result };
  } catch (error) {
    await connection.rollback();
    console.error('Transaction error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Transaction failed' 
    };
  } finally {
    connection.release();
  }
}

/**
 * Check if database connection is alive
 */
export async function checkConnection(): Promise<boolean> {
  try {
    await db.execute('SELECT 1');
    return true;
  } catch (error) {
    console.error('Database connection check failed:', error);
    return false;
  }
}
