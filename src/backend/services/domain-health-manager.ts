import { Queue } from 'bullmq';
import { Redis } from 'ioredis';
import { db } from '../database/config';
import { domainHealthService } from './monitoring/domain-health.service';
import { auditService } from './audit.service';

// Inisialisasi Redis untuk queue
const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
});

// Queue untuk health check
const healthCheckQueue = new Queue('domain-health-check', {
  connection: redis,
  defaultJobOptions: {
    removeOnComplete: true,
    removeOnFail: 1000
  }
});

import { DomainHealth } from './monitoring/domain-health.service';
import { Domain } from '../models/types';

class DomainHealthManager {
  private static instance: DomainHealthManager;

  private constructor() {
    // Set up interval health checks
    this.setupIntervalChecks();
    // Set up error handling
    this.handleErrors();
  }

  public static getInstance(): DomainHealthManager {
    if (!DomainHealthManager.instance) {
      DomainHealthManager.instance = new DomainHealthManager();
    }
    return DomainHealthManager.instance;
  }

  // Menjadwalkan pemeriksaan kesehatan domain
  private setupIntervalChecks() {
    setInterval(async () => {
      const [rows] = await db.query<any[]>('SELECT id, hostname FROM domains WHERE status = "active"');
      
      for (const domain of rows) {
        await this.scheduleHealthCheck(domain.id);
      }
    }, 15 * 60 * 1000); // Check setiap 15 menit
  }

  // Menangani error pada queue
  private handleErrors() {
    healthCheckQueue.on('error', async (error) => {
      console.error('Health check queue error:', error);
      await auditService.logAction({
        action: 'HEALTH_CHECK_ERROR',
        resourceType: 'monitoring',
        resourceId: 'system',
        description: `Error pada health check queue: ${error.message}`,
        userId: 'system'
      });
    });
  }

  // Menjadwalkan pemeriksaan kesehatan domain
  public async scheduleHealthCheck(domainId: string): Promise<void> {
    await healthCheckQueue.add(`check-${domainId}`, { domainId }, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000
      }
    });
  }

  // Mendapatkan hasil pemeriksaan kesehatan domain terbaru
  public async getLatestHealthCheck(domainId: string) {
    const [[domain]] = await db.query<Domain[]>('SELECT * FROM domains WHERE id = ?', [domainId]);
    
    if (!domain) {
      throw new Error('Domain tidak ditemukan');
    }

    const health = await domainHealthService.checkDomainHealth(domain);
    await this.storeHealthCheckResult(domainId, health);
    return health;
  }

  // Menyimpan hasil pemeriksaan kesehatan
  private async storeHealthCheckResult(
    domainId: string, 
    health: DomainHealth
  ): Promise<void> {
    const result = await db.query(`
      INSERT INTO domain_health_history (
        domain_id, 
        check_date,
        is_up,
        response_time,
        ssl_valid,
        ssl_expiry_date,
        dns_valid
      ) VALUES (?, NOW(), ?, ?, ?, ?, ?)
    `, [
      domainId,
      health.isUp ? 1 : 0,
      health.responseTime,
      health.ssl.isValid ? 1 : 0,
      health.ssl.expiryDate ? new Date(health.ssl.expiryDate) : null,
      health.dns.hasValidRecords ? 1 : 0
    ]);

    // Log jika ada masalah
    if (!health.isUp || !health.ssl.isValid || !health.dns.hasValidRecords) {
      const issues: string[] = [];
      if (!health.isUp) issues.push('Domain tidak dapat diakses');
      if (!health.ssl.isValid) issues.push('SSL tidak valid');
      if (!health.dns.hasValidRecords) issues.push('Record DNS tidak valid');

      await auditService.logAction({
        action: 'HEALTH_CHECK_WARNING',
        resourceType: 'domain',
        resourceId: domainId,
        description: `Masalah terdeteksi: ${issues.join(', ')}`,
        userId: 'system'
      });
    }
  }
}

export const domainHealthManager = DomainHealthManager.getInstance();