import { Domain, User } from '@/backend/models/types';
import { emailService } from './email.service';
import { MOCK_USERS } from '@/backend/utils/mock-data';

export class DomainExpiryService {
  private static NOTIFICATION_THRESHOLDS = [30, 14, 7, 3, 1]; // Days before expiry to send notifications

  async checkDomainExpiry(domain: Domain): Promise<void> {
    const daysUntilExpiry = Math.ceil(
      (new Date(domain.expiryDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24)
    );

    // If domain is already expired, mark it as expired
    if (daysUntilExpiry <= 0 && domain.status !== 'expired') {
      await this.markDomainAsExpired(domain);
      await this.notifyAdminsAboutExpiredDomain(domain);
      return;
    }

    // Check if we need to send notifications
    if (this.shouldSendNotification(daysUntilExpiry)) {
      await this.sendExpiryNotifications(domain, daysUntilExpiry);
    }
  }

  private shouldSendNotification(daysUntilExpiry: number): boolean {
    return DomainExpiryService.NOTIFICATION_THRESHOLDS.includes(daysUntilExpiry);
  }

  private async markDomainAsExpired(domain: Domain): Promise<void> {
    // TODO: Implement the actual update in the database
    domain.status = 'expired';
  }

  private async sendExpiryNotifications(domain: Domain, daysUntilExpiry: number): Promise<void> {
    // Get relevant users to notify (Super Admin and OPD Admin)
    const usersToNotify = MOCK_USERS.filter(user => 
      (user.role === 'Super Admin') || 
      (user.role === 'Admin Daerah' && user.opd === domain.opd)
    );

    // Send notifications to each user
    for (const user of usersToNotify) {
      await emailService.sendDomainExpiryNotification(domain, user);
    }
  }

  private async notifyAdminsAboutExpiredDomain(domain: Domain): Promise<void> {
    const adminUsers = MOCK_USERS.filter(user => user.role === 'Super Admin');
    
    for (const admin of adminUsers) {
      await emailService.sendEmail({
        to: admin.email,
        subject: `[URGENT] Domain ${domain.hostname} has expired`,
        html: `
          <h1>Domain Expiry Alert</h1>
          <p>The following domain has expired:</p>
          <ul>
            <li>Domain: ${domain.hostname}</li>
            <li>OPD: ${domain.opd}</li>
            <li>Expiry Date: ${new Date(domain.expiryDate).toLocaleDateString('id-ID')}</li>
          </ul>
          <p>Immediate action is required.</p>
        `
      });
    }
  }
}

export const domainExpiryService = new DomainExpiryService();