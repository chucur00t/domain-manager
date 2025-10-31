import nodemailer from 'nodemailer';
import type { Domain, User } from '@/backend/models/types';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    // TODO: Move these configs to environment variables
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      await this.transporter.sendMail({
        from: process.env.EMAIL_USER,
        ...options,
      });
      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      return false;
    }
  }

  async sendDomainExpiryNotification(domain: Domain, user: User): Promise<boolean> {
    const daysUntilExpiry = Math.ceil(
      (new Date(domain.expiryDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24)
    );

    const html = `
      <h1>Pemberitahuan Kedaluwarsa Domain</h1>
      <p>Domain <strong>${domain.hostname}</strong> akan kedaluwarsa dalam ${daysUntilExpiry} hari.</p>
      <p>Detail domain:</p>
      <ul>
        <li>OPD: ${domain.opd}</li>
        <li>Tanggal Kedaluwarsa: ${new Date(domain.expiryDate).toLocaleDateString('id-ID')}</li>
        <li>Status: ${domain.status}</li>
      </ul>
      <p>Mohon segera lakukan perpanjangan domain untuk menghindari gangguan layanan.</p>
      <p>Terima kasih.</p>
    `;

    return this.sendEmail({
      to: user.email,
      subject: `[PENTING] Domain ${domain.hostname} akan kedaluwarsa dalam ${daysUntilExpiry} hari`,
      html,
    });
  }
}

export const emailService = new EmailService();