import { randomBytes, createHash } from 'crypto';
import { db } from '../database/config';
import { emailService } from './notifications/email.service';
import { auditService } from './audit.service';

interface ResetToken {
  userId: string;
  token: string;
  expiryDate: Date;
}

export class PasswordResetService {
  private static readonly TOKEN_EXPIRY_HOURS = 24;

  // Generate unique reset token
  private generateToken(): string {
    return randomBytes(32).toString('hex');
  }

  // Hash token for storage
  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  // Create reset token for user
  async createResetToken(email: string): Promise<string | null> {
    try {
      // Find user
      const [rows] = await db.query(
        'SELECT id, name, email FROM users WHERE email = ? AND status != "blocked"',
        [email]
      );
      
      const users = rows as any[];
      const user = users[0];

      if (!user) {
        return null;
      }

      // Generate token
      const token = this.generateToken();
      const hashedToken = this.hashToken(token);
      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + PasswordResetService.TOKEN_EXPIRY_HOURS);

      // Save token
      await db.query(
        `INSERT INTO password_reset_tokens (user_id, token, expiry_date) 
         VALUES (?, ?, ?)`,
        [user.id, hashedToken, expiryDate]
      );

      // Send email
      const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;
      await emailService.sendEmail({
        to: user.email,
        subject: 'Reset Password',
        html: `
          <h1>Reset Password</h1>
          <p>Halo ${user.name},</p>
          <p>Kami menerima permintaan untuk mereset password akun Anda.</p>
          <p>Klik link berikut untuk mereset password Anda:</p>
          <p><a href="${resetUrl}">Reset Password</a></p>
          <p>Link ini akan kadaluarsa dalam ${PasswordResetService.TOKEN_EXPIRY_HOURS} jam.</p>
          <p>Jika Anda tidak meminta reset password, abaikan email ini.</p>
        `
      });

      // Log action
      await auditService.logAction({
        action: 'PASSWORD_RESET_REQUESTED',
        resourceType: 'user',
        resourceId: user.id,
        description: 'Permintaan reset password dikirim',
        userId: user.id
      });

      return token;
    } catch (error) {
      console.error('Error creating reset token:', error);
      return null;
    }
  }

  // Validate reset token
  async validateToken(token: string): Promise<string | null> {
    try {
      const hashedToken = this.hashToken(token);
      const [rows] = await db.query(
        `SELECT user_id, expiry_date FROM password_reset_tokens 
         WHERE token = ? AND used = 0 AND expiry_date > NOW()`,
        [hashedToken]
      );
      
      const tokens = rows as any[];
      const resetToken = tokens[0];

      if (!resetToken) {
        return null;
      }

      return resetToken.user_id;
    } catch (error) {
      console.error('Error validating token:', error);
      return null;
    }
  }

  // Reset password using token
  async resetPassword(token: string, newPassword: string): Promise<boolean> {
    try {
      const userId = await this.validateToken(token);
      if (!userId) {
        return false;
      }

      const hashedPassword = await this.hashPassword(newPassword);
      
      // Update password
      await db.query(
        'UPDATE users SET password = ? WHERE id = ?',
        [hashedPassword, userId]
      );

      // Mark token as used
      const hashedToken = this.hashToken(token);
      await db.query(
        'UPDATE password_reset_tokens SET used = 1 WHERE token = ?',
        [hashedToken]
      );

      // Log action
      await auditService.logAction({
        action: 'PASSWORD_RESET_COMPLETED',
        resourceType: 'user',
        resourceId: userId,
        description: 'Password berhasil direset',
        userId: userId
      });

      return true;
    } catch (error) {
      console.error('Error resetting password:', error);
      return false;
    }
  }

  // Hash password
  private async hashPassword(password: string): Promise<string> {
    const bcrypt = await import('bcrypt');
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  // Clean up expired tokens
  async cleanupExpiredTokens(): Promise<void> {
    try {
      await db.query(
        'DELETE FROM password_reset_tokens WHERE expiry_date < NOW()'
      );
    } catch (error) {
      console.error('Error cleaning up tokens:', error);
    }
  }
}

export const passwordResetService = new PasswordResetService();