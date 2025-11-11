/**
 * DNS Provider Interface
 * 
 * Interface untuk DNS provider yang berbeda (CloudFlare, Route53, dll)
 * Implementasi spesifik ada di masing-masing provider
 */

export interface DNSRecord {
  id?: string;
  type: 'A' | 'AAAA' | 'CNAME' | 'MX' | 'TXT' | 'NS';
  name: string;
  content: string;
  ttl?: number;
  priority?: number;
  proxied?: boolean;
}

export interface DNSZone {
  id: string;
  name: string;
  status: 'active' | 'pending' | 'initializing' | 'moved' | 'deleted';
  nameServers?: string[];
}

export interface DNSProviderConfig {
  apiKey: string;
  apiEmail?: string;
  accountId?: string;
}

export interface DNSRecordCreateResult {
  success: boolean;
  record?: DNSRecord;
  error?: string;
}

export interface DNSRecordUpdateResult {
  success: boolean;
  record?: DNSRecord;
  error?: string;
}

export interface DNSRecordDeleteResult {
  success: boolean;
  error?: string;
}

export interface DNSRecordListResult {
  success: boolean;
  records?: DNSRecord[];
  error?: string;
}

/**
 * Interface utama untuk DNS Provider
 */
export interface IDNSProvider {
  /**
   * Mengecek koneksi ke DNS provider
   */
  testConnection(): Promise<boolean>;

  /**
   * Mendapatkan semua zones
   */
  listZones(): Promise<DNSZone[]>;

  /**
   * Mendapatkan zone berdasarkan domain
   */
  getZone(domain: string): Promise<DNSZone | null>;

  /**
   * Membuat DNS record baru
   */
  createRecord(zoneId: string, record: DNSRecord): Promise<DNSRecordCreateResult>;

  /**
   * Update DNS record
   */
  updateRecord(zoneId: string, recordId: string, record: Partial<DNSRecord>): Promise<DNSRecordUpdateResult>;

  /**
   * Hapus DNS record
   */
  deleteRecord(zoneId: string, recordId: string): Promise<DNSRecordDeleteResult>;

  /**
   * List semua DNS records dalam zone
   */
  listRecords(zoneId: string, filters?: { type?: string; name?: string }): Promise<DNSRecordListResult>;

  /**
   * Verifikasi DNS record sudah propagasi
   */
  verifyRecordPropagation(domain: string, recordType: string): Promise<boolean>;
}
