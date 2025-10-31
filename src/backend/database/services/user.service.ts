import { query, execute, buildPagination } from '../utils';
import type { DatabaseRow } from '../types';
import type { User, UserRole, UserStatus } from '@/backend/models/types';

export interface UserRow extends DatabaseRow {
  id: number;
  username: string;
  email: string;
  role: string;
  opd_id?: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
  opd_name?: string;
}

export interface CreateUserData {
  username: string;
  email: string;
  role: UserRole;
  opd_id?: number;
  is_active?: boolean;
  password?: string;
}

export interface UpdateUserData {
  username?: string;
  email?: string;
  role?: UserRole;
  opd_id?: number;
  is_active?: boolean;
}

export interface UserFilter {
  role?: UserRole;
  is_active?: boolean;
  opd_id?: number;
  search?: string;
}

export class UserService {
  // Get all users with pagination and filtering
  async getUsers(page: number = 1, limit: number = 10, filters: UserFilter = {}): Promise<{
    users: User[];
    total: number;
    page: number;
    limit: number;
  }> {
    try {
      // Build where clause
      const conditions = [];
      const params: any[] = [];

      if (filters.role) {
        conditions.push('u.role = ?');
        params.push(filters.role);
      }

      if (filters.is_active !== undefined) {
        conditions.push('u.is_active = ?');
        params.push(filters.is_active);
      }

      if (filters.opd_id) {
        conditions.push('u.opd_id = ?');
        params.push(filters.opd_id);
      }

      if (filters.search) {
        conditions.push('(u.username LIKE ? OR u.email LIKE ? OR u.role LIKE ?)');
        params.push(`%${filters.search}%`, `%${filters.search}%`, `%${filters.search}%`);
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

      // Get total count
      const countSql = `
        SELECT COUNT(*) as total
        FROM users u
        ${whereClause}
      `;
      const countResult = await query<{ total: number }>(countSql, params);
      const total = countResult[0]?.total || 0;

      // Get users with pagination
      const { offset, limit: paginationLimit } = buildPagination(page, limit);
      
      const usersSql = `
        SELECT u.id, u.username, u.email, u.role, u.opd_id, u.is_active, u.created_at, u.updated_at,
               o.name as opd_name
        FROM users u
        LEFT JOIN opds o ON u.opd_id = o.id
        ${whereClause}
        ORDER BY u.created_at DESC
        LIMIT ? OFFSET ?
      `;

      const users = await query<UserRow>(usersSql, [...params, paginationLimit, offset]);

      // Convert to application format - sesuai dengan interface User
      const formattedUsers: User[] = users.map(user => ({
        id: user.id.toString(),
        name: user.username,
        email: user.email,
        role: user.role as UserRole,
        status: (user.is_active ? 'active' : 'inactive') as UserStatus,
        opd: user.opd_name,
        nip: `NIP${user.id.toString().padStart(6, '0')}`, // Generate placeholder NIP
        whatsapp: '08xxxxxxxxxx' // Generate placeholder WhatsApp
      }));

      return {
        users: formattedUsers,
        total,
        page,
        limit: paginationLimit
      };
    } catch (error) {
      throw new Error(`Failed to fetch users: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get user by ID
  async getUser(id: number): Promise<User | null> {
    try {
      const usersSql = `
        SELECT u.id, u.username, u.email, u.role, u.opd_id, u.is_active, u.created_at, u.updated_at,
               o.name as opd_name
        FROM users u
        LEFT JOIN opds o ON u.opd_id = o.id
        WHERE u.id = ?
      `;

      const users = await query<UserRow>(usersSql, [id]);
      
      if (users.length === 0) {
        return null;
      }

      const user = users[0];
      return {
        id: user.id.toString(),
        name: user.username,
        email: user.email,
        role: user.role as UserRole,
        status: (user.is_active ? 'active' : 'inactive') as UserStatus,
        opd: user.opd_name,
        nip: `NIP${user.id.toString().padStart(6, '0')}`,
        whatsapp: '08xxxxxxxxxx'
      };
    } catch (error) {
      throw new Error(`Failed to fetch user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Create new user
  async createUser(data: CreateUserData): Promise<string> {
    try {
      const insertSql = `
        INSERT INTO users (username, email, role, opd_id, is_active)
        VALUES (?, ?, ?, ?, ?)
      `;

      const params = [
        data.username,
        data.email,
        data.role,
        data.opd_id || null,
        data.is_active !== undefined ? data.is_active : true
      ];

      const result = await execute(insertSql, params);
      
      if (!result.insertId) {
        throw new Error('Failed to create user: No ID returned');
      }

      return result.insertId.toString();
    } catch (error) {
      throw new Error(`Failed to create user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Update user
  async updateUser(id: number, data: UpdateUserData): Promise<void> {
    try {
      const updates = [];
      const params: any[] = [];

      if (data.username !== undefined) {
        updates.push('username = ?');
        params.push(data.username);
      }

      if (data.email !== undefined) {
        updates.push('email = ?');
        params.push(data.email);
      }

      if (data.role !== undefined) {
        updates.push('role = ?');
        params.push(data.role);
      }

      if (data.opd_id !== undefined) {
        updates.push('opd_id = ?');
        params.push(data.opd_id);
      }

      if (data.is_active !== undefined) {
        updates.push('is_active = ?');
        params.push(data.is_active);
      }

      if (updates.length === 0) {
        throw new Error('No fields to update');
      }

      const updateSql = `
        UPDATE users 
        SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;

      params.push(id);

      const result = await execute(updateSql, params);
      
      if (result.affectedRows === 0) {
        throw new Error('User not found or no changes made');
      }
    } catch (error) {
      throw new Error(`Failed to update user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Delete user (soft delete by setting is_active to false)
  async deleteUser(id: number): Promise<void> {
    try {
      const updateSql = `
        UPDATE users 
        SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;

      const result = await execute(updateSql, [id]);
      
      if (result.affectedRows === 0) {
        throw new Error('User not found');
      }
    } catch (error) {
      throw new Error(`Failed to delete user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get users by role
  async getUsersByRole(role: UserRole): Promise<User[]> {
    try {
      const usersSql = `
        SELECT u.id, u.username, u.email, u.role, u.opd_id, u.is_active, u.created_at, u.updated_at,
               o.name as opd_name
        FROM users u
        LEFT JOIN opds o ON u.opd_id = o.id
        WHERE u.role = ? AND u.is_active = TRUE
        ORDER BY u.username
      `;

      const users = await query<UserRow>(usersSql, [role]);

      return users.map(user => ({
        id: user.id.toString(),
        name: user.username,
        email: user.email,
        role: user.role as UserRole,
        status: (user.is_active ? 'active' : 'inactive') as UserStatus,
        opd: user.opd_name,
        nip: `NIP${user.id.toString().padStart(6, '0')}`,
        whatsapp: '08xxxxxxxxxx'
      }));
    } catch (error) {
      throw new Error(`Failed to fetch users by role: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// Export singleton instance
export const userService = new UserService();
