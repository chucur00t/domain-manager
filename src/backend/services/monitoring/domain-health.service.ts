import { Domain, DatabaseRow, DomainHealth } from '@/backend/models/types';
import { auditService } from '@/backend/services/audit.service';
import { emailService } from '@/backend/services/notifications/email.service';
import { RowDataPacket } from 'mysql2';
import dns from 'dns';
import https from 'https';
import { promisify } from 'util';

const resolveTxt = promisify(dns.resolveTxt);
const resolve4 = promisify(dns.resolve4);
const resolve6 = promisify(dns.resolve6);

export class DomainHealthService {
  private healthCache: Map<string, DomainHealth> = new Map();

  async checkDomainHealth(domain: Domain): Promise<DomainHealth> {
    try {
      // Check if we have a recent result in cache (less than 5 minutes old)
      const cachedResult = this.healthCache.get(domain.hostname);
      if (cachedResult && this.isResultRecent(cachedResult.lastChecked)) {
        return cachedResult;
      }

      const [uptimeResult, dnsResult, sslResult] = await Promise.all([
        this.checkUptime(domain.hostname),
        this.checkDNS(domain.hostname),
        this.checkSSL(domain.hostname)
      ]);

      const health: DomainHealth = {
        id: domain.id,
        hostname: domain.hostname,
        isUp: uptimeResult.isUp,
        responseTime: uptimeResult.responseTime,
        lastChecked: new Date().toISOString(),
        ssl: sslResult,
        dns: dnsResult
      };

      // Cache the result
      this.healthCache.set(domain.hostname, health);

      // Log any issues
      if (!health.isUp || !health.ssl.isValid || !health.dns.hasValidRecords) {
        await this.logHealthIssues(domain, health);
      }

      return health;
    } catch (error) {
      console.error(`Error checking health for domain ${domain.hostname}:`, error);
      throw error;
    }
  }

  private async checkUptime(hostname: string): Promise<{ isUp: boolean; responseTime: number }> {
    const startTime = Date.now();
    try {
      const response = await new Promise((resolve, reject) => {
        const req = https.get(`https://${hostname}`, resolve);
        req.on('error', reject);
        req.end();
      });
      
      const responseTime = Date.now() - startTime;
      return { isUp: true, responseTime };
    } catch (error) {
      return { isUp: false, responseTime: -1 };
    }
  }

  private async checkSSL(hostname: string): Promise<DomainHealth['ssl']> {
    try {
      const response = await new Promise<any>((resolve, reject) => {
        const req = https.get(`https://${hostname}`, resolve);
        req.on('error', reject);
        req.end();
      });

      const cert = response.socket as any;
      if (!cert?.getPeerCertificate) {
        return { isValid: false };
      }

      const certificate = cert.getPeerCertificate();
      const expires_at = new Date(certificate.valid_to).toISOString();
      const isValid = Date.now() < new Date(certificate.valid_to).getTime();

      return {
        isValid,
        expiryDate: expires_at,
        issuer: certificate.issuer.CN,
      };
    } catch (error) {
      return { isValid: false };
    }
  }

  private async checkDNS(hostname: string): Promise<DomainHealth['dns']> {
    try {
      const [aRecords, aaaaRecords, txtRecords] = await Promise.all([
        resolve4(hostname).catch(() => [] as string[]),
        resolve6(hostname).catch(() => [] as string[]),
        resolveTxt(hostname).catch(() => [] as string[][]),
      ]);

      const hasValidRecords = aRecords.length > 0 || aaaaRecords.length > 0;

      return {
        hasValidRecords,
        aRecords,
        aaaaRecords,
        txtRecords,
      };
    } catch (error) {
      return { hasValidRecords: false };
    }
  }

  private isResultRecent(lastChecked: string): boolean {
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    return new Date(lastChecked).getTime() > fiveMinutesAgo;
  }

  private async logHealthIssues(domain: Domain, health: DomainHealth): Promise<void> {
    const issues: string[] = [];

    if (!health.isUp) {
      issues.push('Domain tidak dapat diakses');
    }
    if (!health.ssl.isValid) {
      issues.push('Sertifikat SSL tidak valid');
    }
    if (!health.dns.hasValidRecords) {
      issues.push('Record DNS tidak valid');
    }

    if (issues.length > 0) {
      const description = `Masalah terdeteksi pada domain ${domain.hostname}: ${issues.join(', ')}`;
      
      await auditService.logAction({
        action: 'HEALTH_CHECK_FAILED',
        resourceType: 'domain',
        resourceId: domain.id,
        description,
        userId: 'system'
      });

      // Send notification email to admins
      // TODO: Get admin emails from user service
      const adminEmail = 'admin@example.com';
      await emailService.sendEmail({
        to: adminEmail,
        subject: `[ALERT] Masalah Terdeteksi pada ${domain.hostname}`,
        html: `
          <h1>Alert: Masalah Domain Terdeteksi</h1>
          <p>Sistem monitoring telah mendeteksi masalah pada domain berikut:</p>
          <ul>
            <li><strong>Domain:</strong> ${domain.hostname}</li>
            <li><strong>OPD:</strong> ${domain.opd}</li>
            <li><strong>Masalah:</strong></li>
            <ul>
              ${issues.map(issue => `<li>${issue}</li>`).join('')}
            </ul>
          </ul>
          <p>Mohon segera periksa dan tindak lanjuti permasalahan ini.</p>
        `
      });
    }
  }
}

export const domainHealthService = new DomainHealthService();