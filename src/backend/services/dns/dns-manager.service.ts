/**
 * DNS Manager Service
 * 
 * Service utama untuk mengelola DNS records
 * Menggunakan DNS provider (CloudFlare, Route53, dll)
 */

import { IDNSProvider, DNSRecord, DNSZone } from './dns-provider.interface';
import { CloudFlareProvider } from './cloudflare-provider';
import { auditService } from '@/backend/services/audit.service';
import { Domain } from '@/backend/models/types';

export interface DNSManagerConfig {
  provider: 'cloudflare' | 'route53' | 'manual';
  apiKey?: string;
  apiEmail?: string;
  accountId?: string;
  defaultTTL?: number;
  autoCreateRecords?: boolean;
}

export interface CreateDomainRecordsOptions {
  domain: Domain;
  targetIP: string;
  createWWW?: boolean;
  proxied?: boolean;
  userId: string;
}

export interface UpdateDomainRecordsOptions {
  domain: Domain;
  newIP?: string;
  newStatus?: 'active' | 'suspended';
  userId: string;
}

export class DNSManagerService {
  private provider: IDNSProvider | null = null;
  private config: DNSManagerConfig;
  private isConfigured = false;

  constructor(config?: DNSManagerConfig) {
    this.config = config || {
      provider: 'manual',
      autoCreateRecords: false,
      defaultTTL: 3600,
    };

    if (config && config.provider !== 'manual') {
      this.initializeProvider();
    }
  }

  /**
   * Initialize DNS provider berdasarkan config
   */
  private initializeProvider(): void {
    try {
      if (this.config.provider === 'cloudflare') {
        if (!this.config.apiKey || !this.config.apiEmail) {
          console.warn('CloudFlare API credentials not configured. DNS management will be manual.');
          return;
        }

        this.provider = new CloudFlareProvider({
          apiKey: this.config.apiKey,
          apiEmail: this.config.apiEmail,
          accountId: this.config.accountId,
        });

        this.isConfigured = true;
        console.log('CloudFlare DNS provider initialized successfully');
      } else if (this.config.provider === 'route53') {
        // TODO: Implement Route53 provider
        console.warn('Route53 provider not yet implemented');
      }
    } catch (error) {
      console.error('Error initializing DNS provider:', error);
      this.isConfigured = false;
    }
  }

  /**
   * Check apakah DNS provider sudah dikonfigurasi
   */
  isProviderConfigured(): boolean {
    return this.isConfigured && this.provider !== null;
  }

  /**
   * Test koneksi ke DNS provider
   */
  async testConnection(): Promise<boolean> {
    if (!this.provider) {
      return false;
    }

    try {
      return await this.provider.testConnection();
    } catch (error) {
      console.error('DNS provider connection test failed:', error);
      return false;
    }
  }

  /**
   * Mendapatkan parent domain zone
   * Contoh: untuk subdomain.example.go.id → zone example.go.id
   */
  private getParentDomain(hostname: string): string {
    const parts = hostname.split('.');
    if (parts.length <= 2) {
      return hostname;
    }
    // Ambil 2 bagian terakhir (example.go.id)
    return parts.slice(-2).join('.');
  }

  /**
   * Membuat DNS records untuk domain baru
   * Dipanggil otomatis saat domain disetujui
   */
  async createDomainRecords(options: CreateDomainRecordsOptions): Promise<{
    success: boolean;
    records?: DNSRecord[];
    error?: string;
  }> {
    // Jika provider tidak dikonfigurasi, return success (manual mode)
    if (!this.isProviderConfigured() || !this.provider) {
      await this.logDNSAction(
        'DNS_CREATE_MANUAL',
        options.domain.id,
        `DNS record untuk ${options.domain.hostname} perlu dibuat manual (provider tidak dikonfigurasi)`,
        options.userId
      );

      return {
        success: true,
        records: [],
      };
    }

    try {
      const parentDomain = this.getParentDomain(options.domain.hostname);
      
      // Dapatkan zone ID
      const zone = await this.provider.getZone(parentDomain);
      if (!zone) {
        throw new Error(`Zone tidak ditemukan untuk domain ${parentDomain}`);
      }

      const recordsToCreate: DNSRecord[] = [
        {
          type: 'A',
          name: options.domain.hostname,
          content: options.targetIP,
          ttl: this.config.defaultTTL || 3600,
          proxied: options.proxied || false,
        },
      ];

      // Tambahkan record untuk www jika diminta
      if (options.createWWW) {
        recordsToCreate.push({
          type: 'CNAME',
          name: `www.${options.domain.hostname}`,
          content: options.domain.hostname,
          ttl: this.config.defaultTTL || 3600,
          proxied: options.proxied || false,
        });
      }

      // Buat semua records
      const createdRecords: DNSRecord[] = [];
      const errors: string[] = [];

      for (const record of recordsToCreate) {
        const result = await this.provider.createRecord(zone.id, record);
        
        if (result.success && result.record) {
          createdRecords.push(result.record);
          
          await this.logDNSAction(
            'DNS_RECORD_CREATED',
            options.domain.id,
            `DNS ${record.type} record dibuat untuk ${record.name} → ${record.content}`,
            options.userId
          );
        } else {
          errors.push(result.error || 'Unknown error');
          
          await this.logDNSAction(
            'DNS_RECORD_CREATE_FAILED',
            options.domain.id,
            `Gagal membuat DNS ${record.type} record untuk ${record.name}: ${result.error}`,
            options.userId
          );
        }
      }

      if (errors.length > 0 && createdRecords.length === 0) {
        return {
          success: false,
          error: `Gagal membuat DNS records: ${errors.join(', ')}`,
        };
      }

      // Verifikasi propagasi (optional)
      if (createdRecords.length > 0) {
        await this.verifyDNSPropagation(options.domain.hostname, 'A');
      }

      return {
        success: true,
        records: createdRecords,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      await this.logDNSAction(
        'DNS_CREATE_ERROR',
        options.domain.id,
        `Error membuat DNS records untuk ${options.domain.hostname}: ${errorMessage}`,
        options.userId
      );

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Update DNS records untuk domain
   */
  async updateDomainRecords(options: UpdateDomainRecordsOptions): Promise<{
    success: boolean;
    error?: string;
  }> {
    if (!this.isProviderConfigured() || !this.provider) {
      await this.logDNSAction(
        'DNS_UPDATE_MANUAL',
        options.domain.id,
        `DNS record untuk ${options.domain.hostname} perlu diupdate manual`,
        options.userId
      );

      return { success: true };
    }

    try {
      const parentDomain = this.getParentDomain(options.domain.hostname);
      const zone = await this.provider.getZone(parentDomain);
      
      if (!zone) {
        throw new Error(`Zone tidak ditemukan untuk domain ${parentDomain}`);
      }

      // List existing records
      const listResult = await this.provider.listRecords(zone.id, {
        name: options.domain.hostname,
        type: 'A',
      });

      if (!listResult.success || !listResult.records || listResult.records.length === 0) {
        return {
          success: false,
          error: 'DNS record tidak ditemukan',
        };
      }

      const record = listResult.records[0];

      // Update record
      const updateData: Partial<DNSRecord> = {};
      
      if (options.newIP) {
        updateData.content = options.newIP;
      }

      // Jika domain disuspend, bisa redirect ke halaman suspend
      if (options.newStatus === 'suspended') {
        // TODO: Implementasi redirect ke halaman suspended
        // Bisa dengan mengubah IP ke server khusus yang menampilkan halaman suspended
      }

      if (Object.keys(updateData).length > 0) {
        const result = await this.provider.updateRecord(zone.id, record.id!, updateData);

        if (!result.success) {
          return {
            success: false,
            error: result.error,
          };
        }

        await this.logDNSAction(
          'DNS_RECORD_UPDATED',
          options.domain.id,
          `DNS record untuk ${options.domain.hostname} berhasil diupdate`,
          options.userId
        );
      }

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      await this.logDNSAction(
        'DNS_UPDATE_ERROR',
        options.domain.id,
        `Error update DNS records untuk ${options.domain.hostname}: ${errorMessage}`,
        options.userId
      );

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Hapus DNS records untuk domain
   */
  async deleteDomainRecords(domain: Domain, userId: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    if (!this.isProviderConfigured() || !this.provider) {
      await this.logDNSAction(
        'DNS_DELETE_MANUAL',
        domain.id,
        `DNS record untuk ${domain.hostname} perlu dihapus manual`,
        userId
      );

      return { success: true };
    }

    try {
      const parentDomain = this.getParentDomain(domain.hostname);
      const zone = await this.provider.getZone(parentDomain);
      
      if (!zone) {
        throw new Error(`Zone tidak ditemukan untuk domain ${parentDomain}`);
      }

      // List all records untuk domain ini
      const listResult = await this.provider.listRecords(zone.id, {
        name: domain.hostname,
      });

      if (!listResult.success || !listResult.records) {
        return {
          success: false,
          error: listResult.error || 'Failed to list DNS records',
        };
      }

      // Hapus semua records
      const errors: string[] = [];
      for (const record of listResult.records) {
        if (record.id) {
          const result = await this.provider.deleteRecord(zone.id, record.id);
          
          if (!result.success) {
            errors.push(result.error || 'Unknown error');
          } else {
            await this.logDNSAction(
              'DNS_RECORD_DELETED',
              domain.id,
              `DNS ${record.type} record dihapus untuk ${record.name}`,
              userId
            );
          }
        }
      }

      if (errors.length > 0) {
        return {
          success: false,
          error: `Beberapa records gagal dihapus: ${errors.join(', ')}`,
        };
      }

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      await this.logDNSAction(
        'DNS_DELETE_ERROR',
        domain.id,
        `Error menghapus DNS records untuk ${domain.hostname}: ${errorMessage}`,
        userId
      );

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * List DNS records untuk domain
   */
  async listDomainRecords(domain: Domain): Promise<{
    success: boolean;
    records?: DNSRecord[];
    error?: string;
  }> {
    if (!this.isProviderConfigured() || !this.provider) {
      return {
        success: false,
        error: 'DNS provider tidak dikonfigurasi',
      };
    }

    try {
      const parentDomain = this.getParentDomain(domain.hostname);
      const zone = await this.provider.getZone(parentDomain);
      
      if (!zone) {
        return {
          success: false,
          error: `Zone tidak ditemukan untuk domain ${parentDomain}`,
        };
      }

      const result = await this.provider.listRecords(zone.id, {
        name: domain.hostname,
      });

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Verifikasi DNS propagation
   */
  async verifyDNSPropagation(hostname: string, recordType: string): Promise<boolean> {
    if (!this.provider) {
      return false;
    }

    try {
      return await this.provider.verifyRecordPropagation(hostname, recordType);
    } catch (error) {
      console.error('Error verifying DNS propagation:', error);
      return false;
    }
  }

  /**
   * Log DNS action ke audit trail
   */
  private async logDNSAction(
    action: string,
    domainId: string,
    description: string,
    userId: string
  ): Promise<void> {
    try {
      await auditService.logAction({
        action,
        resourceType: 'domain',
        resourceId: domainId,
        description,
        userId,
      });
    } catch (error) {
      console.error('Error logging DNS action:', error);
    }
  }

  /**
   * Get DNS zones (untuk troubleshooting/admin)
   */
  async listZones(): Promise<DNSZone[]> {
    if (!this.provider) {
      return [];
    }

    try {
      return await this.provider.listZones();
    } catch (error) {
      console.error('Error listing DNS zones:', error);
      return [];
    }
  }
}

// Singleton instance dengan config dari environment variables
export const dnsManagerService = new DNSManagerService({
  provider: (process.env.DNS_PROVIDER as any) || 'manual',
  apiKey: process.env.CLOUDFLARE_API_KEY,
  apiEmail: process.env.CLOUDFLARE_API_EMAIL,
  accountId: process.env.CLOUDFLARE_ACCOUNT_ID,
  defaultTTL: parseInt(process.env.DNS_DEFAULT_TTL || '3600'),
  autoCreateRecords: process.env.DNS_AUTO_CREATE === 'true',
});
