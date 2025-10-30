import { MOCK_AUDIT_LOGS } from '@/backend/utils/mock-data';
import type { AuditLog, AuditLogInput } from '@/backend/models/types';

class AuditService {
  async createAuditLog(data: AuditLogInput): Promise<AuditLog> {
    // TODO: Implement Firebase logic
    const newAuditLog: AuditLog = {
      ...data,
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString()
    };
    
    MOCK_AUDIT_LOGS.push(newAuditLog);
    return newAuditLog;
  }

  async logAction(params: {
    action: string;
    resourceType: string;
    resourceId: string;
    description: string;
    userId: string;
    user?: string;
    userRole?: string;
  }): Promise<void> {
    try {
      await this.createAuditLog({
        userId: params.userId,
        action: params.action,
        resourceType: params.resourceType,
        resourceId: params.resourceId,
        description: params.description
      });
    } catch (error) {
      console.error('Error logging activity:', error);
      throw error;
    }
  }

  async getAuditLogs(): Promise<AuditLog[]> {
    return MOCK_AUDIT_LOGS;
  }

  async getAuditLogsByUser(userId: string): Promise<AuditLog[]> {
    return MOCK_AUDIT_LOGS.filter(log => log.userId === userId);
  }

  async getAuditLogsByResource(resourceType: string, resourceId: string): Promise<AuditLog[]> {
    return MOCK_AUDIT_LOGS.filter(log => 
      log.resourceType === resourceType && log.resourceId === resourceId
    );
  }
}

export const auditService = new AuditService();
