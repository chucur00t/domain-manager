import { query, queryOne, execute } from '../helpers';
import { ResultSetHeader } from 'mysql2';

export interface OPD {
  id: number;
  name: string;
  address: string | null;
  contact_person: string;
  phone_number: string;
  created_at: Date;
}

export interface CreateOPDInput {
  name: string;
  address?: string;
  contact_person: string;
  phone_number: string;
}

export interface UpdateOPDInput {
  name?: string;
  address?: string;
  contact_person?: string;
  phone_number?: string;
}

/**
 * OPD Repository
 * Handles database operations for Organisasi Perangkat Daerah
 */
export const OPDRepository = {
  /**
   * Get all OPDs
   */
  async findAll(): Promise<OPD[]> {
    const sql = `
      SELECT id, name, address, contact_person, phone_number, created_at
      FROM opds
      ORDER BY name ASC
    `;
    const result = await query<OPD>(sql);
    return result.data || [];
  },

  /**
   * Get OPD by ID
   */
  async findById(id: number): Promise<OPD | null> {
    const sql = `
      SELECT id, name, address, contact_person, phone_number, created_at
      FROM opds
      WHERE id = ?
    `;
    const result = await queryOne<OPD>(sql, [id]);
    return result.data || null;
  },

  /**
   * Get OPD by name
   */
  async findByName(name: string): Promise<OPD | null> {
    const sql = `
      SELECT id, name, address, contact_person, phone_number, created_at
      FROM opds
      WHERE name = ?
    `;
    const result = await queryOne<OPD>(sql, [name]);
    return result.data || null;
  },

  /**
   * Create new OPD
   */
  async create(data: CreateOPDInput): Promise<number> {
    const sql = `
      INSERT INTO opds (name, address, contact_person, phone_number)
      VALUES (?, ?, ?, ?)
    `;
    const result = await execute(sql, [
      data.name,
      data.address || null,
      data.contact_person,
      data.phone_number,
    ]);
    return result.data?.insertId || 0;
  },

  /**
   * Update OPD
   */
  async update(id: number, data: UpdateOPDInput): Promise<boolean> {
    const fields: string[] = [];
    const values: any[] = [];

    if (data.name !== undefined) {
      fields.push('name = ?');
      values.push(data.name);
    }
    if (data.address !== undefined) {
      fields.push('address = ?');
      values.push(data.address);
    }
    if (data.contact_person !== undefined) {
      fields.push('contact_person = ?');
      values.push(data.contact_person);
    }
    if (data.phone_number !== undefined) {
      fields.push('phone_number = ?');
      values.push(data.phone_number);
    }

    if (fields.length === 0) {
      return false;
    }

    values.push(id);
    const sql = `UPDATE opds SET ${fields.join(', ')} WHERE id = ?`;
    const result = await execute(sql, values);
    return (result.data?.affectedRows || 0) > 0;
  },

  /**
   * Delete OPD
   */
  async delete(id: number): Promise<boolean> {
    const sql = 'DELETE FROM opds WHERE id = ?';
    const result = await execute(sql, [id]);
    return (result.data?.affectedRows || 0) > 0;
  },

  /**
   * Count total OPDs
   */
  async count(): Promise<number> {
    const sql = 'SELECT COUNT(*) as total FROM opds';
    const result = await queryOne<{ total: number }>(sql);
    return result.data?.total || 0;
  },

  /**
   * Search OPDs by name
   */
  async search(searchTerm: string): Promise<OPD[]> {
    const sql = `
      SELECT id, name, address, contact_person, phone_number, created_at
      FROM opds
      WHERE name LIKE ? OR contact_person LIKE ?
      ORDER BY name ASC
    `;
    const term = `%${searchTerm}%`;
    const result = await query<OPD>(sql, [term, term]);
    return result.data || [];
  },
};
