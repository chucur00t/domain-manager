import { query, execute, buildPagination } from '../utils';
import type { DatabaseRow } from '../types';
import type { ServiceDomain, DomainStatus } from '@/backend/models/types';

export interface DomainRow {
  id: number;
  application_id?: number;
  domain_name: string;
  status: string;
  activated_at: Date;
  expires_at: Date;
  opd_name?: string;
  application_type?: string;
}

export interface CreateDomainData {
  application_id?: number;
  domain_name: string;
  status: DomainStatus;
  expires_at: Date;
}

export interface UpdateDomainData {
  status?: DomainStatus;
  expires_at?: Date;
}

export interface DomainFilter {
  status?: DomainStatus;
  search?: string;
  expiring_within_days?: number;
}

export class DomainService {
  // Get all domains with pagination and filtering
  async getDomains(page: number = 1, limit: number = 10, filters: DomainFilter = {}): Promise<{
    domains: ServiceDomain[];
    total: number;
    page: number;
    limit: number;
  }> {
    try {
      // Build where clause
      const conditions = [];
      const params: any[] = [];

      if (filters.status) {
        conditions.push('d.status = ?');
        params.push(filters.status);
      }

      if (filters.search) {
        conditions.push('d.domain_name LIKE ?');
        params.push(`%${filters.search}%`);
      }

      if (filters.expiring_within_days) {
        conditions.push('d.expires_at <= DATE_ADD(NOW(), INTERVAL ? DAY)');
        params.push(filters.expiring_within_days);
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

      // Get total count
      const countSql = `
        SELECT COUNT(*) as total
        FROM domains d
        ${whereClause}
      `;
      const countResult = await query<{ total: number }>(countSql, params);
      const total = countResult[0]?.total || 0;

      // Get domains with pagination
      const { offset, limit: paginationLimit } = buildPagination(page, limit);
      
      const domainsSql = `
        SELECT d.id, d.application_id, d.domain_name, d.status, d.activated_at, d.expires_at,
               o.name as opd_name,
               a.application_type
        FROM domains d
        LEFT JOIN applications a ON d.application_id = a.id
        LEFT JOIN opds o ON a.opd_id = o.id
        ${whereClause}
        ORDER BY d.expires_at ASC
        LIMIT ? OFFSET ?
      `;

      const domains = await query<DomainRow>(domainsSql, [...params, paginationLimit, offset]);

      // Convert to application format
      const formattedDomains: ServiceDomain[] = domains.map(domain => ({
        id: domain.id.toString(),
        hostname: domain.domain_name,
        status: domain.status as DomainStatus,
        expiryDate: domain.expires_at.toISOString().split('T')[0], // Format as YYYY-MM-DD
        opd: domain.opd_name || 'Unknown',
        activationDate: domain.activated_at.toISOString().split('T')[0]
      }));

      return {
        domains: formattedDomains,
        total,
        page,
        limit: paginationLimit
      };
    } catch (error) {
      throw new Error(`Failed to fetch domains: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get domain by ID
  async getDomain(id: number): Promise<ServiceDomain | null> {
    try {
      const domainsSql = `
        SELECT d.id, d.application_id, d.domain_name, d.status, d.activated_at, d.expires_at,
               o.name as opd_name
        FROM domains d
        LEFT JOIN applications a ON d.application_id = a.id
        LEFT JOIN opds o ON a.opd_id = o.id
        WHERE d.id = ?
      `;

      const domains = await query<DomainRow>(domainsSql, [id]);
      
      if (domains.length === 0) {
        return null;
      }

      const domain = domains[0];
      return {
        id: domain.id.toString(),
        hostname: domain.domain_name,
        status: domain.status as DomainStatus,
        expiryDate: domain.expires_at.toISOString().split('T')[0],
        opd: domain.opd_name || 'Unknown',
        activationDate: domain.activated_at.toISOString().split('T')[0]
      };
    } catch (error) {
      throw new Error(`Failed to fetch domain: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Create new domain
  async createDomain(data: CreateDomainData): Promise<string> {
    try {
      const insertSql = `
        INSERT INTO domains (application_id, domain_name, status, expires_at)
        VALUES (?, ?, ?, ?)
      `;

      const params = [
        data.application_id || null,
        data.domain_name,
        data.status,
        data.expires_at
      ];

      const result = await execute(insertSql, params);
      
      if (!result.insertId) {
        throw new Error('Failed to create domain: No ID returned');
      }

      return result.insertId.toString();
    } catch (error) {
      throw new Error(`Failed to create domain: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Update domain
  async updateDomain(id: number, data: UpdateDomainData): Promise<void> {
    try {
      const updates = [];
      const params: any[] = [];

      if (data.status !== undefined) {
        updates.push('status = ?');
        params.push(data.status);
      }

      if (data.expires_at !== undefined) {
        updates.push('expires_at = ?');
        params.push(data.expires_at);
      }

      if (updates.length === 0) {
        throw new Error('No fields to update');
      }

      const updateSql = `
        UPDATE domains 
        SET ${updates.join(', ')}
        WHERE id = ?
      `;

      params.push(id);

      const result = await execute(updateSql, params);
      
      if (result.affectedRows === 0) {
        throw new Error('Domain not found or no changes made');
      }
    } catch (error) {
      throw new Error(`Failed to update domain: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Delete domain
  async deleteDomain(id: number): Promise<void> {
    try {
      const deleteSql = `
        DELETE FROM domains WHERE id = ?
      `;

      const result = await execute(deleteSql, [id]);
      
      if (result.affectedRows === 0) {
        throw new Error('Domain not found');
      }
    } catch (error) {
      throw new Error(`Failed to delete domain: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get domains expiring soon
  async getExpiringDomains(days: number = 30): Promise<ServiceDomain[]> {
    try {
      const expiringSql = `
        SELECT d.id, d.domain_name, d.status, d.activated_at, d.expires_at,
               o.name as opd_name
        FROM domains d
        LEFT JOIN applications a ON d.application_id = a.id
        LEFT JOIN opds o ON a.opd_id = o.id
        WHERE d.expires_at <= DATE_ADD(NOW(), INTERVAL ? DAY)
          AND d.status = 'active'
        ORDER BY d.expires_at ASC
      `;

      const domains = await query<DomainRow>(expiringSql, [days]);

      return domains.map(domain => ({
        id: domain.id.toString(),
        hostname: domain.domain_name,
        status: domain.status as DomainStatus,
        expiryDate: domain.expires_at.toISOString().split('T')[0],
        opd: domain.opd_name || 'Unknown',
        activationDate: domain.activated_at.toISOString().split('T')[0]
      }));
    } catch (error) {
      throw new Error(`Failed to fetch expiring domains: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get domains by status
  async getDomainsByStatus(status: DomainStatus): Promise<ServiceDomain[]> {
    try {
      const domainsSql = `
        SELECT d.id, d.domain_name, d.status, d.activated_at, d.expires_at,
               o.name as opd_name
        FROM domains d
        LEFT JOIN applications a ON d.application_id = a.id
        LEFT JOIN opds o ON a.opd_id = o.id
        WHERE d.status = ?
        ORDER BY d.created_at DESC
      `;

      const domains = await query<DomainRow>(domainsSql, [status]);

      return domains.map(domain => ({
        id: domain.id.toString(),
        hostname: domain.domain_name,
        status: domain.status as DomainStatus,
        expiryDate: domain.expires_at.toISOString().split('T')[0],
        opd: domain.opd_name || 'Unknown',
        activationDate: domain.activated_at.toISOString().split('T')[0]
      }));
    } catch (error) {
      throw new Error(`Failed to fetch domains by status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Check if domain name already exists
  async checkDomainExists(domainName: string, excludeId?: number): Promise<boolean> {
    try {
      let sql = `
        SELECT COUNT(*) as count FROM domains WHERE domain_name = ?
      `;
      const params = [domainName];

      if (excludeId) {
        sql += ' AND id != ?';
        params.push(excludeId);
      }

      const result = await query<{ count: number }>(sql, params);
      return result[0]?.count > 0;
    } catch (error) {
      throw new Error(`Failed to check domain existence: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// Export singleton instance
export const domainService = new DomainService();
