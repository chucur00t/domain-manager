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
  is_active?: boolean | null; // null = no filter, undefined = default (true only)
  opd_id?: number;
  search?: string;
}

// Helper function to normalize role format
// Database may store: 'AdminDaerah', 'SuperAdmin' (no space)
// Application uses: 'Admin Daerah', 'Super Admin' (with space)
function normalizeRoleForDB(role: UserRole): string {
  const roleMap: Record<string, string> = {
    'Super Admin': 'SuperAdmin',
    'Admin Daerah': 'AdminDaerah',
    'SuperAdmin': 'SuperAdmin',
    'AdminDaerah': 'AdminDaerah'
  };
  return roleMap[role] || role;
}

function normalizeRoleFromDB(role: string): UserRole {
  const roleMap: Record<string, UserRole> = {
    'SuperAdmin': 'Super Admin',
    'AdminDaerah': 'Admin Daerah',
    'Super Admin': 'Super Admin',
    'Admin Daerah': 'Admin Daerah'
  };
  return roleMap[role] || (role as UserRole);
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

      // Handle is_active filter:
      // - null: no filter (show all users)
      // - true/false: filter by that value
      // - undefined: default to active users only
      if (filters.is_active === null) {
        // No filter, show all users including inactive
      } else if (filters.is_active !== undefined) {
        conditions.push('u.is_active = ?');
        params.push(filters.is_active);
      } else {
        // Default: only show active users (exclude soft-deleted)
        conditions.push('u.is_active = TRUE');
      }

      if (filters.role) {
        conditions.push('u.role = ?');
        params.push(filters.role);
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
      
      console.log('First user from DB:', users.length > 0 ? JSON.stringify(users[0], null, 2) : 'No users');

      // Convert to application format - sesuai dengan interface User
      const formattedUsers: User[] = users.map(user => ({
        id: user.id.toString(),
        name: user.username,
        email: user.email,
        role: normalizeRoleFromDB(user.role), // Convert 'SuperAdmin' -> 'Super Admin'
        status: (user.is_active ? 'active' : 'inactive') as UserStatus,
        opd: user.opd_name,
        nip: `NIP${user.id.toString().padStart(6, '0')}`, // Generate placeholder NIP
        whatsapp: '08xxxxxxxxxx' // Generate placeholder WhatsApp
      }));
      
      console.log('First formatted user:', formattedUsers.length > 0 ? JSON.stringify(formattedUsers[0], null, 2) : 'No users');

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
        role: normalizeRoleFromDB(user.role), // Convert 'SuperAdmin' -> 'Super Admin'
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
        normalizeRoleForDB(data.role), // Convert 'Super Admin' -> 'SuperAdmin'
        data.opd_id || null,
        data.is_active !== undefined ? data.is_active : true
      ];
      
      console.log('SQL:', insertSql.trim());
      console.log('Params:', JSON.stringify(params, null, 2));

      const result = await execute(insertSql, params);
      
      console.log('Insert result:', result);
      
      if (!result.insertId) {
        throw new Error('Failed to create user: No ID returned');
      }

      return result.insertId.toString();
    } catch (error) {
      // Check for duplicate entry errors
      if (error instanceof Error && error.message.includes('Duplicate entry')) {
        if (error.message.includes('username')) {
          throw new Error('Username sudah digunakan');
        } else if (error.message.includes('email')) {
          throw new Error('Email sudah digunakan');
        }
        throw new Error('Data sudah ada di database');
      }
      
      console.error('CreateUser error:', error);
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
        params.push(normalizeRoleForDB(data.role)); // Convert 'Super Admin' -> 'SuperAdmin'
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
      // Append timestamp to username and email to free them up for reuse
      const timestamp = Date.now();
      const updateSql = `
        UPDATE users 
        SET 
          is_active = FALSE,
          username = CONCAT(username, '_deleted_', ?),
          email = CONCAT(email, '_deleted_', ?),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;

      const result = await execute(updateSql, [timestamp, timestamp, id]);
      
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
