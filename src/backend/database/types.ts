import { Pool, PoolConnection, ResultSetHeader, RowDataPacket } from 'mysql2/promise';

export interface DatabaseRow extends RowDataPacket {}

export interface QueryResult<T> extends Array<T & DatabaseRow> {
  meta: ResultSetHeader;
}

export interface DatabaseConnection extends PoolConnection {
  query<T>(text: string, params?: any[]): Promise<QueryResult<T>>;
}

export interface DatabasePool extends Pool {
  query<T>(text: string, params?: any[]): Promise<[QueryResult<T>, any]>;
  getConnection(): Promise<DatabaseConnection>;
}