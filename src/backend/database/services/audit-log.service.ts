import { query, execute, buildPagination } from '../utils';
import type { DatabaseRow } from '../types';
import type { AuditLog } from '@/backend/models/types';

export interface AuditLogRow extends DatabaseRow {
  id: number;
  user_id: number;
  action: string;
  application_id?: number;
  details?: string;
  timestamp: Date;
  // Related data from JOINs
  username?: string;
  email?: string;
}

export interface CreateAuditLogData {
  user_id: number;
  action: string;
  application_id?: number;
  details?: string;
}

export interface AuditLogFilter {
  user_id?: number;
  action?: string;
  application_id?: number;
  startDate?: Date;
  endDate?: Date;
}

export class AuditLogService {
  // Get all audit logs with pagination and filtering
  async getAuditLogs(page: number = 1, limit: number = 50, filters: AuditLogFilter = {}): Promise<{
    logs: AuditLog[];
    total: number;
    page: number;
    limit: number;
  }> {
    try {
      // Build where clause
      const conditions = [];
      const params: any[] = [];

      if (filters.user_id) {
        conditions.push('al.user_id = ?');
        params.push(filters.user_id);
      }

      if (filters.action) {
        conditions.push('al.action = ?');
        params.push(filters.action);
      }

      if (filters.application_id) {
        conditions.push('al.application_id = ?');
        params.push(filters.application_id);
      }

      if (filters.startDate) {
        conditions.push('al.timestamp >= ?');
        params.push(filters.startDate);
      }

      if (filters.endDate) {
        conditions.push('al.timestamp <= ?');
        params.push(filters.endDate);
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

      // Get total count
      const countSql = `
        SELECT COUNT(*) as total
        FROM audit_logs al
        ${whereClause}
      `;
      const countResult = await query<{ total: number }>(countSql, params);
      const total = countResult[0]?.total || 0;

      // Get audit logs with pagination
      const { offset, limit: paginationLimit } = buildPagination(page, limit);
      
      const logsSql = `
        SELECT al.id, al.user_id, al.action, al.application_id,
               al.details, al.timestamp,
               u.username, u.email, u.role
        FROM audit_logs al
        LEFT JOIN users u ON al.user_id = u.id
        ${whereClause}
        ORDER BY al.timestamp DESC
        LIMIT ? OFFSET ?
      `;

      const logs = await query<AuditLogRow>(logsSql, [...params, paginationLimit, offset]);

      // Convert to AuditLog format
      const formattedLogs: AuditLog[] = logs.map(log => ({
        id: log.id.toString(),
        userId: log.user_id.toString(),
        action: log.action,
        resourceType: log.application_id ? 'Application' : 'System',
        resourceId: log.application_id?.toString() || '',
        description: log.details || log.action,
        timestamp: log.timestamp.toISOString(),
        user: log.username || log.email,
        userRole: (log as any).role,
        details: log.details
      }));

      return {
        logs: formattedLogs,
        total,
        page,
        limit
      };
    } catch (error) {
      console.error('Error getting audit logs:', error);
      throw error;
    }
  }

  // Get single audit log by ID
  async getAuditLog(id: number): Promise<AuditLog | null> {
    try {
      const sql = `
        SELECT al.id, al.user_id, al.action, al.application_id,
               al.details, al.timestamp,
               u.username, u.email, u.role
        FROM audit_logs al
        LEFT JOIN users u ON al.user_id = u.id
        WHERE al.id = ?
      `;

      const result = await query<AuditLogRow>(sql, [id]);
      
      if (result.length === 0) {
        return null;
      }

      const log = result[0];
      
      return {
        id: log.id.toString(),
        userId: log.user_id.toString(),
        action: log.action,
        resourceType: log.application_id ? 'Application' : 'System',
        resourceId: log.application_id?.toString() || '',
        description: log.details || log.action,
        timestamp: log.timestamp.toISOString(),
        user: log.username || log.email,
        userRole: (log as any).role,
        details: log.details
      };
    } catch (error) {
      console.error('Error getting audit log:', error);
      throw error;
    }
  }

  // Create new audit log
  async createAuditLog(data: CreateAuditLogData): Promise<string> {
    try {
      const sql = `
        INSERT INTO audit_logs (
          user_id, action, application_id, details, timestamp
        ) VALUES (?, ?, ?, ?, NOW())
      `;

      const result = await execute(sql, [
        data.user_id,
        data.action,
        data.application_id || null,
        data.details || null
      ]);

      return result.insertId?.toString() || '0';
    } catch (error) {
      console.error('Error creating audit log:', error);
      throw error;
    }
  }

  // Get logs by user
  async getLogsByUser(userId: number, page: number = 1, limit: number = 50): Promise<{
    logs: AuditLog[];
    total: number;
  }> {
    try {
      const result = await this.getAuditLogs(page, limit, { user_id: userId });
      return {
        logs: result.logs,
        total: result.total
      };
    } catch (error) {
      console.error('Error getting logs by user:', error);
      throw error;
    }
  }

  // Get logs by resource
  async getLogsByResource(resourceType: string, resourceId: number, page: number = 1, limit: number = 50): Promise<{
    logs: AuditLog[];
    total: number;
  }> {
    try {
      // Since we only have application_id in the table, we focus on that
      const result = await this.getAuditLogs(page, limit, { 
        application_id: resourceId 
      });
      return {
        logs: result.logs,
        total: result.total
      };
    } catch (error) {
      console.error('Error getting logs by resource:', error);
      throw error;
    }
  }

  // Get logs by action
  async getLogsByAction(action: string, page: number = 1, limit: number = 50): Promise<{
    logs: AuditLog[];
    total: number;
  }> {
    try {
      const result = await this.getAuditLogs(page, limit, { action });
      return {
        logs: result.logs,
        total: result.total
      };
    } catch (error) {
      console.error('Error getting logs by action:', error);
      throw error;
    }
  }

  // Get logs in date range
  async getLogsByDateRange(startDate: Date, endDate: Date, page: number = 1, limit: number = 50): Promise<{
    logs: AuditLog[];
    total: number;
  }> {
    try {
      const result = await this.getAuditLogs(page, limit, { 
        startDate, 
        endDate 
      });
      return {
        logs: result.logs,
        total: result.total
      };
    } catch (error) {
      console.error('Error getting logs by date range:', error);
      throw error;
    }
  }

  // Count logs by action
  async countByAction(): Promise<{ action: string; count: number }[]> {
    try {
      const sql = `
        SELECT action, COUNT(*) as count
        FROM audit_logs
        GROUP BY action
        ORDER BY count DESC
      `;
      
      const result = await query<{ action: string; count: number }>(sql);
      return result;
    } catch (error) {
      console.error('Error counting logs by action:', error);
      throw error;
    }
  }

  // Count logs by resource type
  async countByResourceType(): Promise<{ resource_type: string; count: number }[]> {
    try {
      const sql = `
        SELECT 
          CASE WHEN application_id IS NULL THEN 'System' ELSE 'Application' END as resource_type,
          COUNT(*) as count
        FROM audit_logs
        GROUP BY resource_type
        ORDER BY count DESC
      `;
      
      const result = await query<{ resource_type: string; count: number }>(sql);
      return result;
    } catch (error) {
      console.error('Error counting logs by resource type:', error);
      throw error;
    }
  }

  // Get recent logs (last N logs)
  async getRecentLogs(limit: number = 20): Promise<AuditLog[]> {
    try {
      const result = await this.getAuditLogs(1, limit);
      return result.logs;
    } catch (error) {
      console.error('Error getting recent logs:', error);
      throw error;
    }
  }

  // Delete old logs (older than specified days)
  async deleteOldLogs(daysToKeep: number = 90): Promise<number> {
    try {
      const sql = `
        DELETE FROM audit_logs
        WHERE timestamp < DATE_SUB(NOW(), INTERVAL ? DAY)
      `;
      
      const result = await execute(sql, [daysToKeep]);
      return result.affectedRows || 0;
    } catch (error) {
      console.error('Error deleting old logs:', error);
      throw error;
    }
  }

  // Get total log count
  async getTotalCount(): Promise<number> {
    try {
      const sql = 'SELECT COUNT(*) as total FROM audit_logs';
      const result = await query<{ total: number }>(sql);
      return result[0]?.total || 0;
    } catch (error) {
      console.error('Error getting total count:', error);
      throw error;
    }
  }
}
