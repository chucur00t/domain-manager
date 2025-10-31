import { db } from './config';
import { Domain } from '../models/types';

export async function findDomainById(id: string): Promise<Domain | null> {
  const [rows] = await db.query<Domain[]>(
    'SELECT * FROM domains WHERE id = ?',
    [id]
  );
  
  return rows[0] || null;
}

export async function findAllDomains(): Promise<Domain[]> {
  const [rows] = await db.query<Domain[]>('SELECT * FROM domains');
  return rows;
}

export async function updateDomain(id: string, data: Partial<Domain>): Promise<void> {
  const entries = Object.entries(data);
  if (entries.length === 0) return;

  const fields = entries.map(([key]) => `${key} = ?`).join(', ');
  const values = entries.map(([_, value]) => value);

  await db.query(
    `UPDATE domains SET ${fields} WHERE id = ?`,
    [...values, id]
  );
}