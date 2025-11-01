import { query, queryOne, execute } from '../helpers';
import { ResultSetHeader } from 'mysql2';

export type HostingStatus = 'Active' | 'Deactivated';

export interface Hosting {
  id: number;
  application_id: number | null;
  domain_id: number | null;
  storage_capacity: string | null;
  bandwidth: string | null;
  server_type: string | null;
  status: HostingStatus;
  activated_at: Date;
  // Joined fields
  domain_name?: string;
  opd_name?: string;
  submitter_name?: string;
}

export interface CreateHostingInput {
  application_id?: number;
  domain_id?: number;
  storage_capacity?: string;
  bandwidth?: string;
  server_type?: string;
  status?: HostingStatus;
  activated_at?: Date;
}

export interface UpdateHostingInput {
  storage_capacity?: string;
  bandwidth?: string;
  server_type?: string;
  status?: HostingStatus;
}

/**
 * Hosting Repository
 * Handles database operations for hosting services
 */
export const HostingRepository = {
  /**
   * Get all hostings with joined domain, application, and OPD data
   */
  async findAll(): Promise<Hosting[]> {
    const sql = `
      SELECT 
        h.id, h.application_id, h.domain_id, h.storage_capacity, 
        h.bandwidth, h.server_type, h.status, h.activated_at,
        d.domain_name,
        o.name as opd_name,
        u.username as submitter_name
      FROM hostings h
      LEFT JOIN domains d ON h.domain_id = d.id
      LEFT JOIN applications a ON h.application_id = a.id
      LEFT JOIN opds o ON a.opd_id = o.id
      LEFT JOIN users u ON a.submitter_id = u.id
      ORDER BY h.created_at DESC
    `;
    const result = await query<Hosting>(sql);
    return result.data || [];
  },

  /**
   * Get hosting by ID with joined data
   */
  async findById(id: number): Promise<Hosting | null> {
    const sql = `
      SELECT 
        h.id, h.application_id, h.domain_id, h.storage_capacity, 
        h.bandwidth, h.server_type, h.status, h.activated_at,
        d.domain_name,
        o.name as opd_name,
        u.username as submitter_name
      FROM hostings h
      LEFT JOIN domains d ON h.domain_id = d.id
      LEFT JOIN applications a ON h.application_id = a.id
      LEFT JOIN opds o ON a.opd_id = o.id
      LEFT JOIN users u ON a.submitter_id = u.id
      WHERE h.id = ?
    `;
    const result = await queryOne<Hosting>(sql, [id]);
    return result.data || null;
  },

  /**
   * Get hosting by domain ID
   */
  async findByDomain(domainId: number): Promise<Hosting | null> {
    const sql = `
      SELECT 
        h.id, h.application_id, h.domain_id, h.storage_capacity, 
        h.bandwidth, h.server_type, h.status, h.activated_at,
        d.domain_name,
        o.name as opd_name,
        u.username as submitter_name
      FROM hostings h
      LEFT JOIN domains d ON h.domain_id = d.id
      LEFT JOIN applications a ON h.application_id = a.id
      LEFT JOIN opds o ON a.opd_id = o.id
      LEFT JOIN users u ON a.submitter_id = u.id
      WHERE h.domain_id = ?
    `;
    const result = await queryOne<Hosting>(sql, [domainId]);
    return result.data || null;
  },

  /**
   * Get hostings by status
   */
  async findByStatus(status: HostingStatus): Promise<Hosting[]> {
    const sql = `
      SELECT 
        h.id, h.application_id, h.domain_id, h.storage_capacity, 
        h.bandwidth, h.server_type, h.status, h.activated_at,
        d.domain_name,
        o.name as opd_name,
        u.username as submitter_name
      FROM hostings h
      LEFT JOIN domains d ON h.domain_id = d.id
      LEFT JOIN applications a ON h.application_id = a.id
      LEFT JOIN opds o ON a.opd_id = o.id
      LEFT JOIN users u ON a.submitter_id = u.id
      WHERE h.status = ?
      ORDER BY h.created_at DESC
    `;
    const result = await query<Hosting>(sql, [status]);
    return result.data || [];
  },

  /**
   * Get hostings by OPD (through application relationship)
   */
  async findByOPD(opdId: number): Promise<Hosting[]> {
    const sql = `
      SELECT 
        h.id, h.application_id, h.domain_id, h.storage_capacity, 
        h.bandwidth, h.server_type, h.status, h.activated_at,
        d.domain_name,
        o.name as opd_name,
        u.username as submitter_name
      FROM hostings h
      LEFT JOIN domains d ON h.domain_id = d.id
      INNER JOIN applications a ON h.application_id = a.id
      LEFT JOIN opds o ON a.opd_id = o.id
      LEFT JOIN users u ON a.submitter_id = u.id
      WHERE a.opd_id = ?
      ORDER BY h.created_at DESC
    `;
    const result = await query<Hosting>(sql, [opdId]);
    return result.data || [];
  },

  /**
   * Get hostings by application ID
   */
  async findByApplication(applicationId: number): Promise<Hosting[]> {
    const sql = `
      SELECT 
        h.id, h.application_id, h.domain_id, h.storage_capacity, 
        h.bandwidth, h.server_type, h.status, h.activated_at,
        d.domain_name,
        o.name as opd_name,
        u.username as submitter_name
      FROM hostings h
      LEFT JOIN domains d ON h.domain_id = d.id
      LEFT JOIN applications a ON h.application_id = a.id
      LEFT JOIN opds o ON a.opd_id = o.id
      LEFT JOIN users u ON a.submitter_id = u.id
      WHERE h.application_id = ?
      ORDER BY h.created_at DESC
    `;
    const result = await query<Hosting>(sql, [applicationId]);
    return result.data || [];
  },

  /**
   * Create new hosting
   */
  async create(data: CreateHostingInput): Promise<number> {
    const sql = `
      INSERT INTO hostings (
        application_id, domain_id, storage_capacity, 
        bandwidth, server_type, status, activated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const result = await execute(sql, [
      data.application_id || null,
      data.domain_id || null,
      data.storage_capacity || null,
      data.bandwidth || null,
      data.server_type || null,
      data.status || 'Active',
      data.activated_at || new Date(),
    ]);
    return result.data?.insertId || 0;
  },

  /**
   * Update hosting
   */
  async update(id: number, data: UpdateHostingInput): Promise<boolean> {
    const fields: string[] = [];
    const values: any[] = [];

    if (data.storage_capacity !== undefined) {
      fields.push('storage_capacity = ?');
      values.push(data.storage_capacity);
    }
    if (data.bandwidth !== undefined) {
      fields.push('bandwidth = ?');
      values.push(data.bandwidth);
    }
    if (data.server_type !== undefined) {
      fields.push('server_type = ?');
      values.push(data.server_type);
    }
    if (data.status !== undefined) {
      fields.push('status = ?');
      values.push(data.status);
    }

    if (fields.length === 0) {
      return false;
    }

    values.push(id);
    const sql = `UPDATE hosting SET ${fields.join(', ')} WHERE id = ?`;
    const result = await execute(sql, values);
    return (result.data?.affectedRows || 0) > 0;
  },

  /**
   * Delete hosting
   */
  async delete(id: number): Promise<boolean> {
    const sql = `DELETE FROM hosting WHERE id = ?`;
    const result = await execute(sql, [id]);
    return (result.data?.affectedRows || 0) > 0;
  },

  /**
   * Count hostings by status
   */
  async countByStatus(status: HostingStatus): Promise<number> {
    const sql = 'SELECT COUNT(*) as total FROM hostings WHERE status = ?';
    const result = await queryOne<{ total: number }>(sql, [status]);
    return result.data?.total || 0;
  },

  /**
   * Get active hostings count
   */
  async countActive(): Promise<number> {
    return this.countByStatus('Active');
  },

  /**
   * Deactivate hosting
   */
  async deactivate(id: number): Promise<boolean> {
    return this.update(id, { status: 'Deactivated' });
  },

  /**
   * Activate hosting
   */
  async activate(id: number): Promise<boolean> {
    return this.update(id, { status: 'Active' });
  },
};
