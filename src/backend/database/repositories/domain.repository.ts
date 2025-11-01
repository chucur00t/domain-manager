import { query, queryOne, execute } from '../helpers';
import { ResultSetHeader } from 'mysql2';

export type DomainStatus = 'active' | 'inactive' | 'expired' | 'pending';

export interface Domain {
  id: number;
  application_id: number | null;
  domain_name: string;
  status: DomainStatus;
  activated_at: Date;
  expires_at: Date;
  // Joined fields
  opd_name?: string;
  application_type?: string;
  submitter_name?: string;
}

export interface CreateDomainInput {
  application_id?: number;
  domain_name: string;
  status?: DomainStatus;
  activated_at?: Date;
  expires_at: Date;
}

export interface UpdateDomainInput {
  domain_name?: string;
  status?: DomainStatus;
  activated_at?: Date;
  expires_at?: Date;
}

/**
 * Domain Repository
 * Handles database operations for domains
 */
export const DomainRepository = {
  /**
   * Get all domains with joined application and OPD data
   */
  async findAll(): Promise<Domain[]> {
    const sql = `
      SELECT 
        d.id, d.application_id, d.domain_name, d.status, 
        d.activated_at, d.expires_at,
        o.name as opd_name,
        a.application_type,
        u.username as submitter_name
      FROM domains d
      LEFT JOIN applications a ON d.application_id = a.id
      LEFT JOIN opds o ON a.opd_id = o.id
      LEFT JOIN users u ON a.submitter_id = u.id
      ORDER BY d.created_at DESC
    `;
    const result = await query<Domain>(sql);
    return result.data || [];
  },

  /**
   * Get domain by ID with joined data
   */
  async findById(id: number): Promise<Domain | null> {
    const sql = `
      SELECT 
        d.id, d.application_id, d.domain_name, d.status, 
        d.activated_at, d.expires_at,
        o.name as opd_name,
        a.application_type,
        u.username as submitter_name
      FROM domains d
      LEFT JOIN applications a ON d.application_id = a.id
      LEFT JOIN opds o ON a.opd_id = o.id
      LEFT JOIN users u ON a.submitter_id = u.id
      WHERE d.id = ?
    `;
    const result = await queryOne<Domain>(sql, [id]);
    return result.data || null;
  },

  /**
   * Get domain by domain name
   */
  async findByDomainName(domainName: string): Promise<Domain | null> {
    const sql = `
      SELECT 
        d.id, d.application_id, d.domain_name, d.status, 
        d.activated_at, d.expires_at,
        o.name as opd_name,
        a.application_type,
        u.username as submitter_name
      FROM domains d
      LEFT JOIN applications a ON d.application_id = a.id
      LEFT JOIN opds o ON a.opd_id = o.id
      LEFT JOIN users u ON a.submitter_id = u.id
      WHERE d.domain_name = ?
    `;
    const result = await queryOne<Domain>(sql, [domainName]);
    return result.data || null;
  },

  /**
   * Get domains by status
   */
  async findByStatus(status: DomainStatus): Promise<Domain[]> {
    const sql = `
      SELECT 
        d.id, d.application_id, d.domain_name, d.status, 
        d.activated_at, d.expires_at,
        o.name as opd_name,
        a.application_type,
        u.username as submitter_name
      FROM domains d
      LEFT JOIN applications a ON d.application_id = a.id
      LEFT JOIN opds o ON a.opd_id = o.id
      LEFT JOIN users u ON a.submitter_id = u.id
      WHERE d.status = ?
      ORDER BY d.created_at DESC
    `;
    const result = await query<Domain>(sql, [status]);
    return result.data || [];
  },

  /**
   * Get domains by OPD (through application relationship)
   */
  async findByOPD(opdId: number): Promise<Domain[]> {
    const sql = `
      SELECT 
        d.id, d.application_id, d.domain_name, d.status, 
        d.activated_at, d.expires_at,
        o.name as opd_name,
        a.application_type,
        u.username as submitter_name
      FROM domains d
      INNER JOIN applications a ON d.application_id = a.id
      LEFT JOIN opds o ON a.opd_id = o.id
      LEFT JOIN users u ON a.submitter_id = u.id
      WHERE a.opd_id = ?
      ORDER BY d.created_at DESC
    `;
    const result = await query<Domain>(sql, [opdId]);
    return result.data || [];
  },

  /**
   * Get domains expiring soon (within N days)
   */
  async findExpiringSoon(days: number = 30): Promise<Domain[]> {
    const sql = `
      SELECT 
        d.id, d.application_id, d.domain_name, d.status, 
        d.activated_at, d.expires_at,
        o.name as opd_name,
        a.application_type,
        u.username as submitter_name
      FROM domains d
      LEFT JOIN applications a ON d.application_id = a.id
      LEFT JOIN opds o ON a.opd_id = o.id
      LEFT JOIN users u ON a.submitter_id = u.id
      WHERE d.expires_at <= DATE_ADD(NOW(), INTERVAL ? DAY)
        AND d.expires_at > NOW()
        AND d.status = 'active'
      ORDER BY d.expires_at ASC
    `;
    const result = await query<Domain>(sql, [days]);
    return result.data || [];
  },

  /**
   * Get expired domains
   */
  async findExpired(): Promise<Domain[]> {
    const sql = `
      SELECT 
        d.id, d.application_id, d.domain_name, d.status, 
        d.activated_at, d.expires_at,
        o.name as opd_name,
        a.application_type,
        u.username as submitter_name
      FROM domains d
      LEFT JOIN applications a ON d.application_id = a.id
      LEFT JOIN opds o ON a.opd_id = o.id
      LEFT JOIN users u ON a.submitter_id = u.id
      WHERE d.expires_at < NOW() AND d.status != 'expired'
      ORDER BY d.expires_at DESC
    `;
    const result = await query<Domain>(sql);
    return result.data || [];
  },

  /**
   * Create new domain
   */
  async create(data: CreateDomainInput): Promise<number> {
    const sql = `
      INSERT INTO domains (application_id, domain_name, status, activated_at, expires_at)
      VALUES (?, ?, ?, ?, ?)
    `;
    const result = await execute(sql, [
      data.application_id || null,
      data.domain_name,
      data.status || 'pending',
      data.activated_at || new Date(),
      data.expires_at,
    ]);
    return result.data?.insertId || 0;
  },

  /**
   * Update domain
   */
  async update(id: number, data: UpdateDomainInput): Promise<boolean> {
    const fields: string[] = [];
    const values: any[] = [];

    if (data.domain_name !== undefined) {
      fields.push('domain_name = ?');
      values.push(data.domain_name);
    }
    if (data.status !== undefined) {
      fields.push('status = ?');
      values.push(data.status);
    }
    if (data.activated_at !== undefined) {
      fields.push('activated_at = ?');
      values.push(data.activated_at);
    }
    if (data.expires_at !== undefined) {
      fields.push('expires_at = ?');
      values.push(data.expires_at);
    }

    if (fields.length === 0) {
      return false;
    }

    values.push(id);
    const sql = `UPDATE domains SET ${fields.join(', ')} WHERE id = ?`;
    const result = await execute(sql, values);
    return (result.data?.affectedRows || 0) > 0;
  },

  /**
   * Delete domain
   */
  async delete(id: number): Promise<boolean> {
    const sql = `DELETE FROM domains WHERE id = ?`;
    const result = await execute(sql, [id]);
    return (result.data?.affectedRows || 0) > 0;
  },

  /**
   * Update expired domains status
   */
  async updateExpiredDomains(): Promise<number> {
    const sql = `
      UPDATE domains 
      SET status = 'Expired' 
      WHERE expiry_date < NOW() AND status = 'Active'
    `;
    const result = await execute(sql);
    return result.data?.affectedRows || 0;
  },

  /**
   * Count domains by status
   */
  async countByStatus(status: DomainStatus): Promise<number> {
    const sql = 'SELECT COUNT(*) as total FROM domains WHERE status = ?';
    const result = await queryOne<{ total: number }>(sql, [status]);
    return result.data?.total || 0;
  },

  /**
   * Search domains by name
   */
  async search(searchTerm: string): Promise<Domain[]> {
    const sql = `
      SELECT 
        d.id, d.application_id, d.domain_name, d.status, 
        d.activated_at, d.expires_at,
        o.name as opd_name,
        a.application_type,
        u.username as submitter_name
      FROM domains d
      LEFT JOIN applications a ON d.application_id = a.id
      LEFT JOIN opds o ON a.opd_id = o.id
      LEFT JOIN users u ON a.submitter_id = u.id
      WHERE d.domain_name LIKE ?
      ORDER BY d.created_at DESC
    `;
    const result = await query<Domain>(sql, [`%${searchTerm}%`]);
    return result.data || [];
  },
};
