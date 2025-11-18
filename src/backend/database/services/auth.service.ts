import { query } from "@/backend/database/utils";
import type {
  User,
  RegistrationData,
  LoginData,
  LoginResponse,
  SuperAdminSession,
} from "@/backend/models/types";
import bcrypt from "bcryptjs";

class AuthService {
  /**
   * Register new Admin Daerah user
   */
  async register(
    data: RegistrationData
  ): Promise<{ success: boolean; message: string; userId?: number }> {
    try {
      // Check if username already exists
      const existingUser = await query<User>(
        "SELECT id FROM users WHERE username = ? OR email = ?",
        [data.username, data.email]
      );

      if (existingUser.length > 0) {
        return {
          success: false,
          message: "Username atau email sudah terdaftar",
        };
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(data.password, salt);

      // Insert new user
      const result = await query(
        `INSERT INTO users (username, email, password_hash, full_name, role, opd_id, opd_address, contact, is_active)
         VALUES (?, ?, ?, ?, 'Admin Daerah', ?, ?, ?, TRUE)`,
        [
          data.username,
          data.email,
          passwordHash,
          data.full_name,
          data.opd_id,
          data.opd_address,
          data.contact,
        ]
      );

      return {
        success: true,
        message: "Registrasi berhasil! Silakan login dengan akun Anda.",
        userId: (result as any).insertId,
      };
    } catch (error) {
      console.error("Error during registration:", error);
      return {
        success: false,
        message: "Terjadi kesalahan saat registrasi. Silakan coba lagi.",
      };
    }
  }

  /**
   * Login user (Admin Daerah or Super Admin)
   */
  async login(
    data: LoginData,
    ipAddress?: string,
    userAgent?: string
  ): Promise<LoginResponse> {
    try {
      // Get user by username
      const users = await query<User>(
        `SELECT u.*, o.name as opd
         FROM users u
         LEFT JOIN opds o ON u.opd_id = o.id
         WHERE u.username = ? AND u.is_active = TRUE`,
        [data.username]
      );

      if (users.length === 0) {
        return { success: false, message: "Username atau password salah" };
      }

      const user = users[0];

      // Verify password
      const isPasswordValid = await bcrypt.compare(
        data.password,
        user.password_hash
      );
      if (!isPasswordValid) {
        return { success: false, message: "Username atau password salah" };
      }

      // For Super Admin, nama petugas is required
      if (user.role === "Super Admin" && !data.officer_name) {
        return {
          success: false,
          message: "Nama petugas wajib diisi untuk Super Admin",
        };
      }

      // Create session for Super Admin
      let sessionId: number | undefined;
      if (user.role === "Super Admin" && data.officer_name) {
        const sessionResult = await query(
          `INSERT INTO super_admin_sessions (user_id, officer_name, ip_address, user_agent)
           VALUES (?, ?, ?, ?)`,
          [user.id, data.officer_name, ipAddress || null, userAgent || null]
        );
        sessionId = (sessionResult as any).insertId;
      }

      return {
        success: true,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          full_name: user.full_name,
          role: user.role,
          opd_id: user.opd_id,
          opd: user.opd,
        },
        session_id: sessionId,
      };
    } catch (error) {
      console.error("Error during login:", error);
      return {
        success: false,
        message: "Terjadi kesalahan saat login. Silakan coba lagi.",
      };
    }
  }

  /**
   * Logout Super Admin (update session logout_at)
   */
  async logoutSuperAdmin(sessionId: number): Promise<void> {
    try {
      await query(
        "UPDATE super_admin_sessions SET logout_at = CURRENT_TIMESTAMP WHERE id = ?",
        [sessionId]
      );
    } catch (error) {
      console.error("Error during logout:", error);
    }
  }

  /**
   * Get Super Admin sessions (for tracking who logged in)
   */
  async getSuperAdminSessions(
    limit: number = 50
  ): Promise<SuperAdminSession[]> {
    try {
      const sessions = await query<SuperAdminSession>(
        `SELECT s.*, u.username, u.full_name
         FROM super_admin_sessions s
         LEFT JOIN users u ON s.user_id = u.id
         ORDER BY s.login_at DESC
         LIMIT ?`,
        [limit]
      );
      return sessions;
    } catch (error) {
      console.error("Error fetching sessions:", error);
      return [];
    }
  }

  /**
   * Check if user exists by username or email
   */
  async userExists(username: string, email: string): Promise<boolean> {
    try {
      const users = await query<User>(
        "SELECT id FROM users WHERE username = ? OR email = ?",
        [username, email]
      );
      return users.length > 0;
    } catch (error) {
      console.error("Error checking user existence:", error);
      return false;
    }
  }

  /**
   * Create default Super Admin account if not exists
   */
  async createDefaultSuperAdmin(): Promise<void> {
    try {
      // Check if Super Admin already exists
      const existingAdmin = await query<User>(
        "SELECT id FROM users WHERE username = 'superadmin'"
      );

      if (existingAdmin.length > 0) {
        console.log("Super Admin account already exists");
        return;
      }

      // Check if Diskominfo OPD exists
      let diskomInfoId: number;
      const existingOPD = await query<any>(
        "SELECT id FROM opds WHERE name = 'Diskominfo Provinsi Kalimantan Barat'"
      );

      if (existingOPD.length > 0) {
        diskomInfoId = existingOPD[0].id;
      } else {
        // Create Diskominfo OPD
        const opdResult = await query(
          `INSERT INTO opds (name, address, contact_person, phone_number)
           VALUES (?, ?, ?, ?)`,
          [
            "Diskominfo Provinsi Kalimantan Barat",
            "Kompleks Kantor Gubernur Kalimantan Barat",
            "Super Admin",
            "0564123145",
          ]
        );
        diskomInfoId = (opdResult as any).insertId;
      }

      // Hash default password
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash("Superadmin123", salt);

      // Create Super Admin user
      await query(
        `INSERT INTO users (username, email, password_hash, full_name, role, opd_id, opd_address, contact, is_active)
         VALUES (?, ?, ?, ?, 'Super Admin', ?, ?, ?, TRUE)`,
        [
          "superadmin",
          "superadmin@kalbarprov.go.id",
          passwordHash,
          "Super Admin",
          diskomInfoId,
          "Kompleks Kantor Gubernor Kalimantan Barat",
          "0564123145",
        ]
      );

      console.log("Default Super Admin account created successfully");
    } catch (error) {
      console.error("Error creating default Super Admin:", error);
    }
  }
}

export const authService = new AuthService();
