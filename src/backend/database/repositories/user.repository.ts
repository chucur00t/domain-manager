import { query, queryOne, execute } from '../helpers';
import type { User, UserRole } from '../../models/types';
import type { RowDataPacket, ResultSetHeader } from 'mysql2';

interface UserRow extends RowDataPacket {
  id: string;
  username: string;
  email: string;
  role: string;
  opd_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * User Repository - Handle semua database operations untuk users
 */
export class UserRepository {
  /**
   * Get all users
   */
  async findAll(): Promise<User[]> {
    const result = await query<UserRow>(
      `SELECT u.*, o.name as opd_name 
       FROM users u 
       LEFT JOIN opds o ON u.opd_id = o.id 
       WHERE u.is_active = true
       ORDER BY u.created_at DESC`
    );

    if (!result.success || !result.data) {
      return [];
    }

    return result.data.map(this.mapRowToUser);
  }

  /**
   * Find user by ID
   */
  async findById(id: string): Promise<User | null> {
    const result = await queryOne<UserRow>(
      `SELECT u.*, o.name as opd_name 
       FROM users u 
       LEFT JOIN opds o ON u.opd_id = o.id 
       WHERE u.id = ?`,
      [id]
    );

    if (!result.success || !result.data) {
      return null;
    }

    return this.mapRowToUser(result.data);
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    const result = await queryOne<UserRow>(
      `SELECT u.*, o.name as opd_name 
       FROM users u 
       LEFT JOIN opds o ON u.opd_id = o.id 
       WHERE u.email = ?`,
      [email]
    );

    if (!result.success || !result.data) {
      return null;
    }

    return this.mapRowToUser(result.data);
  }

  /**
   * Create new user
   */
  async create(userData: {
    username: string;
    email: string;
    role: string;
    opd_id?: string;
  }): Promise<string | null> {
    const result = await execute(
      `INSERT INTO users (id, username, email, role, opd_id, is_active) 
       VALUES (?, ?, ?, ?, ?, true)`,
      [
        `user-${Date.now()}`,
        userData.username,
        userData.email,
        userData.role,
        userData.opd_id || null,
      ]
    );

    if (!result.success || !result.data) {
      return null;
    }

    return `user-${Date.now()}`;
  }

  /**
   * Update user
   */
  async update(id: string, userData: Partial<User>): Promise<boolean> {
    const fields: string[] = [];
    const values: any[] = [];

    if (userData.name !== undefined) {
      fields.push('username = ?');
      values.push(userData.name);
    }
    if (userData.email !== undefined) {
      fields.push('email = ?');
      values.push(userData.email);
    }
    if (userData.role !== undefined) {
      fields.push('role = ?');
      values.push(userData.role);
    }
    if (userData.opd !== undefined) {
      fields.push('opd_id = ?');
      values.push(userData.opd || null);
    }

    if (fields.length === 0) {
      return false;
    }

    values.push(id);

    const result = await execute(
      `UPDATE users SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      values
    );

    return result.success && (result.data?.affectedRows ?? 0) > 0;
  }

  /**
   * Soft delete user (set is_active = false)
   */
  async delete(id: string): Promise<boolean> {
    const result = await execute(
      'UPDATE users SET is_active = false WHERE id = ?',
      [id]
    );

    return result.success && (result.data?.affectedRows ?? 0) > 0;
  }

  /**
   * Get users by role
   */
  async findByRole(role: string): Promise<User[]> {
    const result = await query<UserRow>(
      `SELECT u.*, o.name as opd_name 
       FROM users u 
       LEFT JOIN opds o ON u.opd_id = o.id 
       WHERE u.role = ? AND u.is_active = true
       ORDER BY u.created_at DESC`,
      [role]
    );

    if (!result.success || !result.data) {
      return [];
    }

    return result.data.map(this.mapRowToUser);
  }

  /**
   * Get users by OPD
   */
  async findByOpd(opdId: string): Promise<User[]> {
    const result = await query<UserRow>(
      `SELECT u.*, o.name as opd_name 
       FROM users u 
       LEFT JOIN opds o ON u.opd_id = o.id 
       WHERE u.opd_id = ? AND u.is_active = true
       ORDER BY u.created_at DESC`,
      [opdId]
    );

    if (!result.success || !result.data) {
      return [];
    }

    return result.data.map(this.mapRowToUser);
  }

  /**
   * Map database row to User type
   */
  private mapRowToUser(row: UserRow & { opd_name?: string }): User {
    // Map database role to UserRole type
    const roleMap: Record<string, UserRole> = {
      'super_admin': 'Super Admin',
      'admin_daerah': 'Admin Daerah',
      'administrator': 'Administrator',
      'operator': 'Operator',
      'auditor': 'Auditor',
      'kepala_bidang': 'Kepala Bidang',
      'pengelola_sistem': 'Pengelola Sistem'
    };

    return {
      id: row.id,
      name: row.username,
      email: row.email,
      role: roleMap[row.role] || 'Admin Daerah',
      status: row.is_active ? 'active' : 'inactive',
      opd: row.opd_name || '',
      nip: '',
      whatsapp: '',
    };
  }
}

// Export singleton instance
export const userRepository = new UserRepository();
