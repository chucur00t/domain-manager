import { AuditLogRepository, type CreateAuditLogInput } from '@/backend/database/repositories/audit-log.repository';
import type { AuditLog, AuditLogInput } from '@/backend/models/types';

class AuditService {
  async createAuditLog(data: AuditLogInput): Promise<AuditLog> {
    try {
      // Map AuditLogInput to CreateAuditLogInput for repository
      const auditLogData: CreateAuditLogInput = {
        user_id: data.userId ? parseInt(data.userId) : undefined,
        application_id: data.resourceType === 'application' && data.resourceId ? parseInt(data.resourceId) : undefined,
        action: data.action,
        details: data.description || undefined
      };
      
      const auditLogId = await AuditLogRepository.create(auditLogData);
      
      // Fetch the created audit log to return
      const createdLog = await AuditLogRepository.findById(auditLogId);
      
      if (!createdLog) {
        throw new Error('Failed to retrieve created audit log');
      }
      
      // Map database record to AuditLog type
      return {
        id: createdLog.id.toString(),
        userId: createdLog.user_id?.toString() || 'system',
        action: createdLog.action,
        resourceType: data.resourceType,
        resourceId: data.resourceId,
        description: createdLog.details || '',
        timestamp: createdLog.timestamp.toISOString()
      };
    } catch (error) {
      console.error('Error creating audit log:', error);
      throw error;
    }
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
    try {
      const logs = await AuditLogRepository.findAll(1000);
      
      return logs.map(log => ({
        id: log.id.toString(),
        userId: log.user_id?.toString() || 'system',
        action: log.action,
        resourceType: log.application_id ? 'application' : 'system',
        resourceId: log.application_id?.toString() || 'system',
        description: log.details || '',
        timestamp: log.timestamp.toISOString()
      }));
    } catch (error) {
      console.error('Error getting audit logs:', error);
      return [];
    }
  }

  async getAuditLogsByUser(userId: string): Promise<AuditLog[]> {
    try {
      const logs = await AuditLogRepository.findByUser(parseInt(userId), 1000);
      
      return logs.map(log => ({
        id: log.id.toString(),
        userId: log.user_id?.toString() || 'system',
        action: log.action,
        resourceType: log.application_id ? 'application' : 'system',
        resourceId: log.application_id?.toString() || 'system',
        description: log.details || '',
        timestamp: log.timestamp.toISOString()
      }));
    } catch (error) {
      console.error('Error getting audit logs by user:', error);
      return [];
    }
  }

  async getAuditLogsByResource(resourceType: string, resourceId: string): Promise<AuditLog[]> {
    try {
      if (resourceType !== 'application') {
        return [];
      }
      
      const logs = await AuditLogRepository.findByApplication(parseInt(resourceId));
      
      return logs.map(log => ({
        id: log.id.toString(),
        userId: log.user_id?.toString() || 'system',
        action: log.action,
        resourceType: 'application',
        resourceId: log.application_id?.toString() || 'system',
        description: log.details || '',
        timestamp: log.timestamp.toISOString()
      }));
    } catch (error) {
      console.error('Error getting audit logs by resource:', error);
      return [];
    }
  }
}

export const auditService = new AuditService();

// Export helper function for backward compatibility
export const logActivity = auditService.logAction.bind(auditService);
