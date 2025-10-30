export interface QueryResult<T> {
  rows: T[];
  rowCount: number;
}

export interface DatabaseConnection {
  query<T>(text: string, params?: any[]): Promise<QueryResult<T>>;
  release(): void;
}

export interface DatabasePool {
  query<T>(text: string, params?: any[]): Promise<QueryResult<T>>;
  getConnection(): Promise<DatabaseConnection>;
}