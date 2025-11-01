import { query, execute, buildPagination } from '../utils';
import type { DatabaseRow } from '../types';
import type { HostingApplication, ApplicationStatus } from '@/backend/models/types';

export interface HostingRow extends DatabaseRow {
  id: number;
  application_id?: number;
  domain_id?: number;
  storage_capacity?: string;
  bandwidth?: string;
  server_type?: string;
  status: string;
  activated_at: Date;
  // Related data from JOINs
  application_type?: string;
  opd_name?: string;
  submitter_name?: string;
  domain_name?: string;
}

export interface CreateHostingData {
  application_id?: number;
  domain_id?: number;
  storage_capacity?: string;
  bandwidth?: string;
  server_type?: string;
  status?: 'Active' | 'Deactivated';
}

export interface UpdateHostingData {
  storage_capacity?: string;
  bandwidth?: string;
  server_type?: string;
  status?: 'Active' | 'Deactivated';
}

export interface HostingFilter {
  status?: 'Active' | 'Deactivated';
  domain_id?: number;
  search?: string;
}

export class HostingService {
  // Get all hostings with pagination and filtering
  async getHostings(page: number = 1, limit: number = 10, filters: HostingFilter = {}): Promise<{
    hostings: HostingApplication[];
    total: number;
    page: number;
    limit: number;
  }> {
    try {
      // Build where clause
      const conditions = [];
      const params: any[] = [];

      if (filters.status) {
        conditions.push('h.status = ?');
        params.push(filters.status);
      }

      if (filters.domain_id) {
        conditions.push('h.domain_id = ?');
        params.push(filters.domain_id);
      }

      if (filters.search) {
        conditions.push('(d.domain_name LIKE ? OR h.server_type LIKE ?)');
        params.push(`%${filters.search}%`, `%${filters.search}%`);
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

      // Get total count
      const countSql = `
        SELECT COUNT(*) as total
        FROM hostings h
        ${whereClause}
      `;
      const countResult = await query<{ total: number }>(countSql, params);
      const total = countResult[0]?.total || 0;

      // Get hostings with pagination
      const { offset, limit: paginationLimit } = buildPagination(page, limit);
      
      const hostingsSql = `
        SELECT h.id, h.application_id, h.domain_id, h.storage_capacity, h.bandwidth,
               h.server_type, h.status, h.activated_at,
               a.application_type, a.status as application_status,
               o.name as opd_name,
               u.username as submitter_name,
               d.domain_name
        FROM hostings h
        LEFT JOIN applications a ON h.application_id = a.id
        LEFT JOIN domains d ON h.domain_id = d.id
        LEFT JOIN opds o ON a.opd_id = o.id
        LEFT JOIN users u ON a.submitter_id = u.id
        ${whereClause}
        ORDER BY h.activated_at DESC
        LIMIT ? OFFSET ?
      `;

      const hostings = await query<HostingRow>(hostingsSql, [...params, paginationLimit, offset]);

      // Convert to application format
      const formattedHostings: HostingApplication[] = hostings.map(hosting => ({
        id: hosting.id.toString(),
        userId: hosting.application_id?.toString() || '',
        applicationName: hosting.domain_name || 'Unknown',
        description: `Storage: ${hosting.storage_capacity || 'N/A'}, Bandwidth: ${hosting.bandwidth || 'N/A'}, Server: ${hosting.server_type || 'N/A'}`,
        framework: hosting.server_type || 'Unknown',
        domainName: hosting.domain_name || '',
        opd: hosting.opd_name || 'Unknown',
        applicantName: hosting.submitter_name || 'Unknown',
        status: hosting.status === 'Active' ? 'approved' : 'pending',
        submittedDate: hosting.activated_at.toISOString().split('T')[0]
      }));

      return {
        hostings: formattedHostings,
        total,
        page,
        limit
      };
    } catch (error) {
      console.error('Error getting hostings:', error);
      throw error;
    }
  }

  // Get single hosting by ID
  async getHosting(id: number): Promise<HostingApplication | null> {
    try {
      const sql = `
        SELECT h.id, h.application_id, h.domain_id, h.storage_capacity, h.bandwidth,
               h.server_type, h.status, h.activated_at,
               a.application_type,
               o.name as opd_name,
               u.username as submitter_name,
               d.domain_name
        FROM hostings h
        LEFT JOIN applications a ON h.application_id = a.id
        LEFT JOIN domains d ON h.domain_id = d.id
        LEFT JOIN opds o ON a.opd_id = o.id
        LEFT JOIN users u ON a.submitter_id = u.id
        WHERE h.id = ?
      `;

      const result = await query<HostingRow>(sql, [id]);
      
      if (result.length === 0) {
        return null;
      }

      const hosting = result[0];
      
      return {
        id: hosting.id.toString(),
        userId: hosting.application_id?.toString() || '',
        applicationName: hosting.domain_name || 'Unknown',
        description: `Storage: ${hosting.storage_capacity || 'N/A'}, Bandwidth: ${hosting.bandwidth || 'N/A'}, Server: ${hosting.server_type || 'N/A'}`,
        framework: hosting.server_type || 'Unknown',
        domainName: hosting.domain_name || '',
        opd: hosting.opd_name || 'Unknown',
        applicantName: hosting.submitter_name || 'Unknown',
        status: hosting.status === 'Active' ? 'approved' : 'pending',
        submittedDate: hosting.activated_at.toISOString().split('T')[0]
      };
    } catch (error) {
      console.error('Error getting hosting:', error);
      throw error;
    }
  }

  // Create new hosting
  async createHosting(data: CreateHostingData): Promise<string> {
    try {
      const sql = `
        INSERT INTO hostings (
          application_id, domain_id, storage_capacity, bandwidth, 
          server_type, status, activated_at
        ) VALUES (?, ?, ?, ?, ?, ?, NOW())
      `;

      const result = await execute(sql, [
        data.application_id || null,
        data.domain_id || null,
        data.storage_capacity || null,
        data.bandwidth || null,
        data.server_type || null,
        data.status || 'Active'
      ]);

      return result.insertId?.toString() || '0';
    } catch (error) {
      console.error('Error creating hosting:', error);
      throw error;
    }
  }

  // Update hosting
  async updateHosting(id: number, data: UpdateHostingData): Promise<void> {
    try {
      const updates: string[] = [];
      const params: any[] = [];

      if (data.storage_capacity !== undefined) {
        updates.push('storage_capacity = ?');
        params.push(data.storage_capacity);
      }

      if (data.bandwidth !== undefined) {
        updates.push('bandwidth = ?');
        params.push(data.bandwidth);
      }

      if (data.server_type !== undefined) {
        updates.push('server_type = ?');
        params.push(data.server_type);
      }

      if (data.status !== undefined) {
        updates.push('status = ?');
        params.push(data.status);
      }

      if (updates.length === 0) {
        return;
      }

      params.push(id);

      const sql = `
        UPDATE hostings 
        SET ${updates.join(', ')}
        WHERE id = ?
      `;

      await execute(sql, params);
    } catch (error) {
      console.error('Error updating hosting:', error);
      throw error;
    }
  }

  // Delete hosting
  async deleteHosting(id: number): Promise<void> {
    try {
      const sql = 'DELETE FROM hostings WHERE id = ?';
      await execute(sql, [id]);
    } catch (error) {
      console.error('Error deleting hosting:', error);
      throw error;
    }
  }

  // Activate hosting
  async activateHosting(id: number): Promise<void> {
    try {
      const sql = `
        UPDATE hostings 
        SET status = 'Active', activated_at = NOW()
        WHERE id = ?
      `;
      await execute(sql, [id]);
    } catch (error) {
      console.error('Error activating hosting:', error);
      throw error;
    }
  }

  // Deactivate hosting
  async deactivateHosting(id: number): Promise<void> {
    try {
      const sql = `
        UPDATE hostings 
        SET status = 'Deactivated'
        WHERE id = ?
      `;
      await execute(sql, [id]);
    } catch (error) {
      console.error('Error deactivating hosting:', error);
      throw error;
    }
  }

  // Get hostings by domain
  async getHostingsByDomain(domainId: number): Promise<HostingApplication[]> {
    try {
      const result = await this.getHostings(1, 100, { domain_id: domainId });
      return result.hostings;
    } catch (error) {
      console.error('Error getting hostings by domain:', error);
      throw error;
    }
  }

  // Get hostings by status
  async getHostingsByStatus(status: 'Active' | 'Deactivated'): Promise<HostingApplication[]> {
    try {
      const result = await this.getHostings(1, 100, { status });
      return result.hostings;
    } catch (error) {
      console.error('Error getting hostings by status:', error);
      throw error;
    }
  }

  // Count hostings
  async countHostings(filters: HostingFilter = {}): Promise<number> {
    try {
      const conditions = [];
      const params: any[] = [];

      if (filters.status) {
        conditions.push('status = ?');
        params.push(filters.status);
      }

      if (filters.domain_id) {
        conditions.push('domain_id = ?');
        params.push(filters.domain_id);
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

      const sql = `SELECT COUNT(*) as total FROM hostings ${whereClause}`;
      const result = await query<{ total: number }>(sql, params);
      
      return result[0]?.total || 0;
    } catch (error) {
      console.error('Error counting hostings:', error);
      throw error;
    }
  }
}
