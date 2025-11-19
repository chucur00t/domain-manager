import { db } from './config';

export class DatabaseError extends Error {
  constructor(message: string, public cause?: Error) {
    super(message + (cause ? `: ${cause.message}` : ''));
    this.name = 'DatabaseError';
  }
}

// Transaction wrapper for database operations
export async function withTransaction<T>(
  callback: (connection: any) => Promise<T>
): Promise<T> {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw new DatabaseError('Transaction failed', error as Error);
  } finally {
    connection.release();
  }
}

// Generic query executor with proper error handling
export async function query<T = any>(
  sql: string,
  params: any[] = [],
  connection?: any
): Promise<T[]> {
  try {
    if (connection) {
      const result = await connection.query(sql, params);
      // Handle both mysql2 promise and mock result formats
      if (Array.isArray(result)) {
        return result[0] as T[];
      } else {
        return result.rows || [];
      }
    } else {
      const result = await db.query(sql, params);
      // Handle both mysql2 promise and mock result formats  
      if (Array.isArray(result)) {
        return result[0] as T[];
      } else {
        return result.rows || [];
      }
    }
  } catch (error) {
    throw new DatabaseError(`Query failed: ${sql}`, error as Error);
  }
}

// Execute non-select query (INSERT, UPDATE, DELETE)
export async function execute(
  sql: string,
  params: any[] = [],
  connection?: any
): Promise<{ insertId?: number; affectedRows?: number }> {
  try {
    if (connection) {
      const result = await connection.query(sql, params);
      // Handle mysql2 result format
      if (Array.isArray(result)) {
        const [queryResult] = result;
        return {
          insertId: queryResult.insertId,
          affectedRows: queryResult.affectedRows
        };
      }
      // Handle mock result format
      return {
        insertId: (result as any).insertId,
        affectedRows: (result as any).affectedRows
      };
    } else {
      const result = await db.query(sql, params);
      // Handle mysql2 result format
      if (Array.isArray(result)) {
        const [queryResult] = result;
        return {
          insertId: queryResult.insertId,
          affectedRows: queryResult.affectedRows
        };
      }
      // Handle mock result format
      return {
        insertId: (result as any).insertId,
        affectedRows: (result as any).affectedRows
      };
    }
  } catch (error) {
    throw new DatabaseError(`Execute failed: ${sql}`, error as Error);
  }
}

// Utility function to build WHERE clauses
export function buildWhereClause(filters: Record<string, any>): {
  clause: string;
  params: any[];
} {
  const conditions: string[] = [];
  const params: any[] = [];

  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== null) {
      conditions.push(`${key} = ?`);
      params.push(value);
    }
  }

  return {
    clause: conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '',
    params
  };
}

// Utility function to build pagination
export function buildPagination(page: number = 1, limit: number = 10): {
  offset: number;
  limit: number;
} {
  const pageNum = Math.max(1, parseInt(page.toString()) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit.toString()) || 10));
  
  return {
    offset: (pageNum - 1) * limitNum,
    limit: limitNum
  };
}
