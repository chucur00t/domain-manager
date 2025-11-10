/**
 * CloudFlare DNS Provider Implementation
 * 
 * Implementasi DNS provider menggunakan CloudFlare API
 * Docs: https://developers.cloudflare.com/api/
 */

import {
  IDNSProvider,
  DNSRecord,
  DNSZone,
  DNSProviderConfig,
  DNSRecordCreateResult,
  DNSRecordUpdateResult,
  DNSRecordDeleteResult,
  DNSRecordListResult,
} from './dns-provider.interface';
import dns from 'dns';
import { promisify } from 'util';

const resolve4 = promisify(dns.resolve4);
const resolveCname = promisify(dns.resolveCname);

interface CloudFlareResponse<T> {
  success: boolean;
  errors: Array<{ code: number; message: string }>;
  messages: string[];
  result: T;
}

export class CloudFlareProvider implements IDNSProvider {
  private apiKey: string;
  private apiEmail: string;
  private baseUrl = 'https://api.cloudflare.com/client/v4';

  constructor(config: DNSProviderConfig) {
    if (!config.apiKey) {
      throw new Error('CloudFlare API Key is required');
    }
    if (!config.apiEmail) {
      throw new Error('CloudFlare API Email is required');
    }

    this.apiKey = config.apiKey;
    this.apiEmail = config.apiEmail;
  }

  /**
   * Test koneksi ke CloudFlare API
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await this.makeRequest<{ id: string }>('/user');
      return response.success;
    } catch (error) {
      console.error('CloudFlare connection test failed:', error);
      return false;
    }
  }

  /**
   * List semua zones di CloudFlare account
   */
  async listZones(): Promise<DNSZone[]> {
    try {
      const response = await this.makeRequest<Array<{
        id: string;
        name: string;
        status: string;
        name_servers: string[];
      }>>('/zones');

      if (!response.success || !response.result) {
        return [];
      }

      return response.result.map(zone => ({
        id: zone.id,
        name: zone.name,
        status: zone.status as DNSZone['status'],
        nameServers: zone.name_servers,
      }));
    } catch (error) {
      console.error('Error listing CloudFlare zones:', error);
      return [];
    }
  }

  /**
   * Mendapatkan zone berdasarkan domain name
   */
  async getZone(domain: string): Promise<DNSZone | null> {
    try {
      const response = await this.makeRequest<Array<{
        id: string;
        name: string;
        status: string;
        name_servers: string[];
      }>>(`/zones?name=${domain}`);

      if (!response.success || !response.result || response.result.length === 0) {
        return null;
      }

      const zone = response.result[0];
      return {
        id: zone.id,
        name: zone.name,
        status: zone.status as DNSZone['status'],
        nameServers: zone.name_servers,
      };
    } catch (error) {
      console.error(`Error getting CloudFlare zone for ${domain}:`, error);
      return null;
    }
  }

  /**
   * Membuat DNS record baru
   */
  async createRecord(zoneId: string, record: DNSRecord): Promise<DNSRecordCreateResult> {
    try {
      const payload: any = {
        type: record.type,
        name: record.name,
        content: record.content,
        ttl: record.ttl || 1, // 1 = automatic
      };

      if (record.type === 'MX' && record.priority) {
        payload.priority = record.priority;
      }

      if (record.proxied !== undefined) {
        payload.proxied = record.proxied;
      }

      const response = await this.makeRequest<{
        id: string;
        type: string;
        name: string;
        content: string;
        ttl: number;
        priority?: number;
        proxied?: boolean;
      }>(`/zones/${zoneId}/dns_records`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (!response.success) {
        return {
          success: false,
          error: response.errors?.[0]?.message || 'Failed to create DNS record',
        };
      }

      return {
        success: true,
        record: {
          id: response.result.id,
          type: response.result.type as DNSRecord['type'],
          name: response.result.name,
          content: response.result.content,
          ttl: response.result.ttl,
          priority: response.result.priority,
          proxied: response.result.proxied,
        },
      };
    } catch (error) {
      console.error('Error creating DNS record:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Update DNS record
   */
  async updateRecord(
    zoneId: string,
    recordId: string,
    record: Partial<DNSRecord>
  ): Promise<DNSRecordUpdateResult> {
    try {
      const payload: any = {};
      
      if (record.type) payload.type = record.type;
      if (record.name) payload.name = record.name;
      if (record.content) payload.content = record.content;
      if (record.ttl) payload.ttl = record.ttl;
      if (record.priority) payload.priority = record.priority;
      if (record.proxied !== undefined) payload.proxied = record.proxied;

      const response = await this.makeRequest<{
        id: string;
        type: string;
        name: string;
        content: string;
        ttl: number;
        priority?: number;
        proxied?: boolean;
      }>(`/zones/${zoneId}/dns_records/${recordId}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });

      if (!response.success) {
        return {
          success: false,
          error: response.errors?.[0]?.message || 'Failed to update DNS record',
        };
      }

      return {
        success: true,
        record: {
          id: response.result.id,
          type: response.result.type as DNSRecord['type'],
          name: response.result.name,
          content: response.result.content,
          ttl: response.result.ttl,
          priority: response.result.priority,
          proxied: response.result.proxied,
        },
      };
    } catch (error) {
      console.error('Error updating DNS record:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Hapus DNS record
   */
  async deleteRecord(zoneId: string, recordId: string): Promise<DNSRecordDeleteResult> {
    try {
      const response = await this.makeRequest<{ id: string }>(
        `/zones/${zoneId}/dns_records/${recordId}`,
        { method: 'DELETE' }
      );

      if (!response.success) {
        return {
          success: false,
          error: response.errors?.[0]?.message || 'Failed to delete DNS record',
        };
      }

      return { success: true };
    } catch (error) {
      console.error('Error deleting DNS record:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * List DNS records dalam zone
   */
  async listRecords(
    zoneId: string,
    filters?: { type?: string; name?: string }
  ): Promise<DNSRecordListResult> {
    try {
      let url = `/zones/${zoneId}/dns_records?per_page=100`;
      
      if (filters?.type) {
        url += `&type=${filters.type}`;
      }
      if (filters?.name) {
        url += `&name=${filters.name}`;
      }

      const response = await this.makeRequest<Array<{
        id: string;
        type: string;
        name: string;
        content: string;
        ttl: number;
        priority?: number;
        proxied?: boolean;
      }>>(url);

      if (!response.success || !response.result) {
        return {
          success: false,
          error: response.errors?.[0]?.message || 'Failed to list DNS records',
        };
      }

      return {
        success: true,
        records: response.result.map(r => ({
          id: r.id,
          type: r.type as DNSRecord['type'],
          name: r.name,
          content: r.content,
          ttl: r.ttl,
          priority: r.priority,
          proxied: r.proxied,
        })),
      };
    } catch (error) {
      console.error('Error listing DNS records:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Verifikasi DNS record sudah propagasi
   */
  async verifyRecordPropagation(domain: string, recordType: string): Promise<boolean> {
    try {
      if (recordType === 'A') {
        const records = await resolve4(domain);
        return records.length > 0;
      } else if (recordType === 'CNAME') {
        const records = await resolveCname(domain);
        return records.length > 0;
      }
      
      // Untuk type lain, anggap sudah propagasi
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Helper untuk membuat HTTP request ke CloudFlare API
   */
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<CloudFlareResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const headers = {
      'X-Auth-Email': this.apiEmail,
      'X-Auth-Key': this.apiKey,
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok && response.status !== 400) {
      throw new Error(`CloudFlare API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }
}
