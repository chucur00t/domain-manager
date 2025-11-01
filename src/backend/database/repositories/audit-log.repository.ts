import { query, queryOne, execute } from '../helpers';
import { ResultSetHeader } from 'mysql2';

export interface AuditLog {
  id: number;
  user_id: number | null;
  application_id: number | null;
  action: string;
  details: string | null;
  timestamp: Date;
  // Joined fields
  username?: string;
  user_email?: string;
  user_role?: string;
  application_type?: string;
  opd_name?: string;
}

export interface CreateAuditLogInput {
  user_id?: number;
  application_id?: number;
  action: string;
  details?: string;
}

/**
 * Audit Log Repository
 * Handles database operations for audit trail/logging
 */
export const AuditLogRepository = {
  /**
   * Get all audit logs with joined user and application data
   */
  async findAll(limit: number = 100): Promise<AuditLog[]> {
    const sql = `
      SELECT 
        al.id, al.user_id, al.application_id, al.action, 
        al.details, al.timestamp,
        u.username,
        u.email as user_email,
        u.role as user_role,
        a.application_type,
        o.name as opd_name
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      LEFT JOIN applications a ON al.application_id = a.id
      LEFT JOIN opds o ON a.opd_id = o.id
      ORDER BY al.timestamp DESC
      LIMIT ?
    `;
    const result = await query<AuditLog>(sql, [limit]);
    return result.data || [];
  },

  /**
   * Get audit log by ID with joined data
   */
  async findById(id: number): Promise<AuditLog | null> {
    const sql = `
      SELECT 
        al.id, al.user_id, al.application_id, al.action, 
        al.details, al.timestamp,
        u.username,
        u.email as user_email,
        u.role as user_role,
        a.application_type,
        o.name as opd_name
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      LEFT JOIN applications a ON al.application_id = a.id
      LEFT JOIN opds o ON a.opd_id = o.id
      WHERE al.id = ?
    `;
    const result = await queryOne<AuditLog>(sql, [id]);
    return result.data || null;
  },

  /**
   * Get audit logs by user ID
   */
  async findByUser(userId: number, limit: number = 100): Promise<AuditLog[]> {
    const sql = `
      SELECT 
        al.id, al.user_id, al.application_id, al.action, 
        al.details, al.timestamp,
        u.username,
        u.email as user_email,
        u.role as user_role,
        a.application_type,
        o.name as opd_name
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      LEFT JOIN applications a ON al.application_id = a.id
      LEFT JOIN opds o ON a.opd_id = o.id
      WHERE al.user_id = ?
      ORDER BY al.timestamp DESC
      LIMIT ?
    `;
    const result = await query<AuditLog>(sql, [userId, limit]);
    return result.data || [];
  },

  /**
   * Get audit logs by application ID
   */
  async findByApplication(applicationId: number): Promise<AuditLog[]> {
    const sql = `
      SELECT 
        al.id, al.user_id, al.application_id, al.action, 
        al.details, al.timestamp,
        u.username,
        u.email as user_email,
        u.role as user_role,
        a.application_type,
        o.name as opd_name
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      LEFT JOIN applications a ON al.application_id = a.id
      LEFT JOIN opds o ON a.opd_id = o.id
      WHERE al.application_id = ?
      ORDER BY al.timestamp DESC
    `;
    const result = await query<AuditLog>(sql, [applicationId]);
    return result.data || [];
  },

  /**
   * Get audit logs by action type
   */
  async findByAction(action: string, limit: number = 100): Promise<AuditLog[]> {
    const sql = `
      SELECT 
        al.id, al.user_id, al.application_id, al.action, 
        al.details, al.timestamp,
        u.username,
        u.email as user_email,
        u.role as user_role,
        a.application_type,
        o.name as opd_name
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      LEFT JOIN applications a ON al.application_id = a.id
      LEFT JOIN opds o ON a.opd_id = o.id
      WHERE al.action = ?
      ORDER BY al.timestamp DESC
      LIMIT ?
    `;
    const result = await query<AuditLog>(sql, [action, limit]);
    return result.data || [];
  },

  /**
   * Get audit logs by date range
   */
  async findByDateRange(startDate: Date, endDate: Date, limit: number = 1000): Promise<AuditLog[]> {
    const sql = `
      SELECT 
        al.id, al.user_id, al.application_id, al.action, 
        al.details, al.timestamp,
        u.username,
        u.email as user_email,
        u.role as user_role,
        a.application_type,
        o.name as opd_name
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      LEFT JOIN applications a ON al.application_id = a.id
      LEFT JOIN opds o ON a.opd_id = o.id
      WHERE al.timestamp BETWEEN ? AND ?
      ORDER BY al.timestamp DESC
      LIMIT ?
    `;
    const result = await query<AuditLog>(sql, [startDate, endDate, limit]);
    return result.data || [];
  },

  /**
   * Get recent audit logs (last N days)
   */
  async findRecent(days: number = 7, limit: number = 100): Promise<AuditLog[]> {
    const sql = `
      SELECT 
        al.id, al.user_id, al.application_id, al.action, 
        al.details, al.timestamp,
        u.username,
        u.email as user_email,
        u.role as user_role,
        a.application_type,
        o.name as opd_name
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      LEFT JOIN applications a ON al.application_id = a.id
      LEFT JOIN opds o ON a.opd_id = o.id
      WHERE al.timestamp >= DATE_SUB(NOW(), INTERVAL ? DAY)
      ORDER BY al.timestamp DESC
      LIMIT ?
    `;
    const result = await query<AuditLog>(sql, [days, limit]);
    return result.data || [];
  },

  /**
   * Get audit logs by OPD (through application relationship)
   */
  async findByOPD(opdId: number, limit: number = 100): Promise<AuditLog[]> {
    const sql = `
      SELECT 
        al.id, al.user_id, al.application_id, al.action, 
        al.details, al.timestamp,
        u.username,
        u.email as user_email,
        u.role as user_role,
        a.application_type,
        o.name as opd_name
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      INNER JOIN applications a ON al.application_id = a.id
      LEFT JOIN opds o ON a.opd_id = o.id
      WHERE a.opd_id = ?
      ORDER BY al.timestamp DESC
      LIMIT ?
    `;
    const result = await query<AuditLog>(sql, [opdId, limit]);
    return result.data || [];
  },

  /**
   * Create new audit log entry
   */
  async create(data: CreateAuditLogInput): Promise<number> {
    const sql = `
      INSERT INTO audit_logs (user_id, application_id, action, details)
      VALUES (?, ?, ?, ?)
    `;
    const result = await execute(sql, [
      data.user_id || null,
      data.application_id || null,
      data.action,
      data.details || null,
    ]);
    return result.data?.insertId || 0;
  },

  /**
   * Delete audit log (generally not recommended, but available)
   */
  async delete(id: number): Promise<boolean> {
    const sql = 'DELETE FROM audit_logs WHERE id = ?';
    const result = await execute(sql, [id]);
    return (result.data?.affectedRows || 0) > 0;
  },

  /**
   * Delete old audit logs (cleanup, older than N days)
   */
  async deleteOlderThan(days: number): Promise<number> {
    const sql = `
      DELETE FROM audit_logs 
      WHERE timestamp < DATE_SUB(NOW(), INTERVAL ? DAY)
    `;
    const result = await execute(sql, [days]);
    return result.data?.affectedRows || 0;
  },

  /**
   * Count total audit logs
   */
  async count(): Promise<number> {
    const sql = 'SELECT COUNT(*) as total FROM audit_logs';
    const result = await queryOne<{ total: number }>(sql);
    return result.data?.total || 0;
  },

  /**
   * Count audit logs by user
   */
  async countByUser(userId: number): Promise<number> {
    const sql = 'SELECT COUNT(*) as total FROM audit_logs WHERE user_id = ?';
    const result = await queryOne<{ total: number }>(sql, [userId]);
    return result.data?.total || 0;
  },

  /**
   * Count audit logs by action
   */
  async countByAction(action: string): Promise<number> {
    const sql = 'SELECT COUNT(*) as total FROM audit_logs WHERE action = ?';
    const result = await queryOne<{ total: number }>(sql, [action]);
    return result.data?.total || 0;
  },

  /**
   * Search audit logs by action or details
   */
  async search(searchTerm: string, limit: number = 100): Promise<AuditLog[]> {
    const sql = `
      SELECT 
        al.id, al.user_id, al.application_id, al.action, 
        al.details, al.timestamp,
        u.username,
        u.email as user_email,
        u.role as user_role,
        a.application_type,
        o.name as opd_name
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      LEFT JOIN applications a ON al.application_id = a.id
      LEFT JOIN opds o ON a.opd_id = o.id
      WHERE al.action LIKE ? OR al.details LIKE ?
      ORDER BY al.timestamp DESC
      LIMIT ?
    `;
    const term = `%${searchTerm}%`;
    const result = await query<AuditLog>(sql, [term, term, limit]);
    return result.data || [];
  },
};
