import { Pool, PoolConnection, ResultSetHeader, RowDataPacket, FieldPacket } from 'mysql2/promise';

export interface DatabaseRow extends RowDataPacket {}

export interface QueryResult<T> extends Array<T & DatabaseRow> {
  meta: ResultSetHeader;
}

// Use the actual mysql2 types directly
export type DatabaseConnection = PoolConnection;
export type DatabasePool = Pool;