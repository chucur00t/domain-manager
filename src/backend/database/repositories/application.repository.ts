import { query, queryOne, execute } from '../helpers';
import { ResultSetHeader } from 'mysql2';

export type ApplicationType = 'domain' | 'hosting';
export type ApplicationStatus = 'Pending' | 'Approved' | 'Rejected';

export interface Application {
  id: number;
  application_type: ApplicationType;
  opd_id: number | null;
  submitter_id: number | null;
  status: ApplicationStatus;
  reason: string | null;
  submitted_at: Date;
  approved_at: Date | null;
  last_updated_by: number | null;
  // Joined fields
  opd_name?: string;
  submitter_name?: string;
  submitter_email?: string;
  updater_name?: string;
}

export interface CreateApplicationInput {
  application_type: ApplicationType;
  opd_id?: number;
  submitter_id?: number;
  status?: ApplicationStatus;
  reason?: string;
}

export interface UpdateApplicationInput {
  status?: ApplicationStatus;
  reason?: string;
  approved_at?: Date;
  last_updated_by?: number;
}

/**
 * Application Repository
 * Handles database operations for domain and hosting applications
 */
export const ApplicationRepository = {
  /**
   * Get all applications with joined OPD and user data
   */
  async findAll(): Promise<Application[]> {
    const sql = `
      SELECT 
        a.id, a.application_type, a.opd_id, a.submitter_id, 
        a.status, a.reason, a.submitted_at, a.approved_at, a.last_updated_by,
        o.name as opd_name,
        u1.username as submitter_name,
        u1.email as submitter_email,
        u2.username as updater_name
      FROM applications a
      LEFT JOIN opds o ON a.opd_id = o.id
      LEFT JOIN users u1 ON a.submitter_id = u1.id
      LEFT JOIN users u2 ON a.last_updated_by = u2.id
      ORDER BY a.submitted_at DESC
    `;
    const result = await query<Application>(sql);
    return result.data || [];
  },

  /**
   * Get application by ID with joined data
   */
  async findById(id: number): Promise<Application | null> {
    const sql = `
      SELECT 
        a.id, a.application_type, a.opd_id, a.submitter_id, 
        a.status, a.reason, a.submitted_at, a.approved_at, a.last_updated_by,
        o.name as opd_name,
        u1.username as submitter_name,
        u1.email as submitter_email,
        u2.username as updater_name
      FROM applications a
      LEFT JOIN opds o ON a.opd_id = o.id
      LEFT JOIN users u1 ON a.submitter_id = u1.id
      LEFT JOIN users u2 ON a.last_updated_by = u2.id
      WHERE a.id = ?
    `;
    const result = await queryOne<Application>(sql, [id]);
    return result.data || null;
  },

  /**
   * Get applications by status
   */
  async findByStatus(status: ApplicationStatus): Promise<Application[]> {
    const sql = `
      SELECT 
        a.id, a.application_type, a.opd_id, a.submitter_id, 
        a.status, a.reason, a.submitted_at, a.approved_at, a.last_updated_by,
        o.name as opd_name,
        u1.username as submitter_name,
        u1.email as submitter_email,
        u2.username as updater_name
      FROM applications a
      LEFT JOIN opds o ON a.opd_id = o.id
      LEFT JOIN users u1 ON a.submitter_id = u1.id
      LEFT JOIN users u2 ON a.last_updated_by = u2.id
      WHERE a.status = ?
      ORDER BY a.submitted_at DESC
    `;
    const result = await query<Application>(sql, [status]);
    return result.data || [];
  },

  /**
   * Get applications by OPD
   */
  async findByOPD(opdId: number): Promise<Application[]> {
    const sql = `
      SELECT 
        a.id, a.application_type, a.opd_id, a.submitter_id, 
        a.status, a.reason, a.submitted_at, a.approved_at, a.last_updated_by,
        o.name as opd_name,
        u1.username as submitter_name,
        u1.email as submitter_email,
        u2.username as updater_name
      FROM applications a
      LEFT JOIN opds o ON a.opd_id = o.id
      LEFT JOIN users u1 ON a.submitter_id = u1.id
      LEFT JOIN users u2 ON a.last_updated_by = u2.id
      WHERE a.opd_id = ?
      ORDER BY a.submitted_at DESC
    `;
    const result = await query<Application>(sql, [opdId]);
    return result.data || [];
  },

  /**
   * Get applications by submitter
   */
  async findBySubmitter(userId: number): Promise<Application[]> {
    const sql = `
      SELECT 
        a.id, a.application_type, a.opd_id, a.submitter_id, 
        a.status, a.reason, a.submitted_at, a.approved_at, a.last_updated_by,
        o.name as opd_name,
        u1.username as submitter_name,
        u1.email as submitter_email,
        u2.username as updater_name
      FROM applications a
      LEFT JOIN opds o ON a.opd_id = o.id
      LEFT JOIN users u1 ON a.submitter_id = u1.id
      LEFT JOIN users u2 ON a.last_updated_by = u2.id
      WHERE a.submitter_id = ?
      ORDER BY a.submitted_at DESC
    `;
    const result = await query<Application>(sql, [userId]);
    return result.data || [];
  },

  /**
   * Get applications by type
   */
  async findByType(type: ApplicationType): Promise<Application[]> {
    const sql = `
      SELECT 
        a.id, a.application_type, a.opd_id, a.submitter_id, 
        a.status, a.reason, a.submitted_at, a.approved_at, a.last_updated_by,
        o.name as opd_name,
        u1.username as submitter_name,
        u1.email as submitter_email,
        u2.username as updater_name
      FROM applications a
      LEFT JOIN opds o ON a.opd_id = o.id
      LEFT JOIN users u1 ON a.submitter_id = u1.id
      LEFT JOIN users u2 ON a.last_updated_by = u2.id
      WHERE a.application_type = ?
      ORDER BY a.submitted_at DESC
    `;
    const result = await query<Application>(sql, [type]);
    return result.data || [];
  },

  /**
   * Create new application
   */
  async create(data: CreateApplicationInput): Promise<number> {
    const sql = `
      INSERT INTO applications (application_type, opd_id, submitter_id, status, reason)
      VALUES (?, ?, ?, ?, ?)
    `;
    const result = await execute(sql, [
      data.application_type,
      data.opd_id || null,
      data.submitter_id || null,
      data.status || 'Pending',
      data.reason || null,
    ]);
    return result.data?.insertId || 0;
  },

  /**
   * Update application
   */
  async update(id: number, data: UpdateApplicationInput): Promise<boolean> {
    const fields: string[] = [];
    const values: any[] = [];

    if (data.status !== undefined) {
      fields.push('status = ?');
      values.push(data.status);
    }
    if (data.reason !== undefined) {
      fields.push('reason = ?');
      values.push(data.reason);
    }
    if (data.approved_at !== undefined) {
      fields.push('approved_at = ?');
      values.push(data.approved_at);
    }
    if (data.last_updated_by !== undefined) {
      fields.push('last_updated_by = ?');
      values.push(data.last_updated_by);
    }

    if (fields.length === 0) {
      return false;
    }

    values.push(id);
    const sql = `UPDATE applications SET ${fields.join(', ')} WHERE id = ?`;
    const result = await execute(sql, values);
    return (result.data?.affectedRows || 0) > 0;
  },

  /**
   * Delete application
   */
  async delete(id: number): Promise<boolean> {
    const sql = `DELETE FROM applications WHERE id = ?`;
    const result = await execute(sql, [id]);
    return (result.data?.affectedRows || 0) > 0;
  },

  /**
   * Count applications by status
   */
  async countByStatus(status: ApplicationStatus): Promise<number> {
    const sql = `SELECT COUNT(*) as total FROM applications WHERE status = ?`;
    const result = await queryOne<{ total: number }>(sql, [status]);
    return result.data?.total || 0;
  },

  /**
   * Count applications by type
   */
  async countByType(type: ApplicationType): Promise<number> {
    const sql = 'SELECT COUNT(*) as total FROM applications WHERE application_type = ?';
    const result = await queryOne<{ total: number }>(sql, [type]);
    return result.data?.total || 0;
  },

  /**
   * Get recent applications (last N days)
   */
  async findRecent(days: number = 30): Promise<Application[]> {
    const sql = `
      SELECT 
        a.id, a.application_type, a.opd_id, a.submitter_id, 
        a.status, a.reason, a.submitted_at, a.approved_at, a.last_updated_by,
        o.name as opd_name,
        u1.username as submitter_name,
        u1.email as submitter_email,
        u2.username as updater_name
      FROM applications a
      LEFT JOIN opds o ON a.opd_id = o.id
      LEFT JOIN users u1 ON a.submitter_id = u1.id
      LEFT JOIN users u2 ON a.last_updated_by = u2.id
      WHERE a.submitted_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
      ORDER BY a.submitted_at DESC
    `;
    const result = await query<Application>(sql, [days]);
    return result.data || [];
  },
};
