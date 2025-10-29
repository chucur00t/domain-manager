import { MOCK_AUDIT_LOGS } from '@/backend/utils/mock-data';
import type { AuditLog, AuditLogInput } from '@/backend/models/types';

export async function createAuditLog(data: AuditLogInput): Promise<AuditLog> {
  // TODO: Implement Firebase logic
  const newAuditLog: AuditLog = {
    ...data,
    id: `audit-${Date.now()}`,
    timestamp: new Date().toISOString()
  };
  
  MOCK_AUDIT_LOGS.push(newAuditLog);
  return newAuditLog;
}

export async function logActivity(params: {
  action: string;
  resourceType: string;
  resourceId: string;
  description: string;
  userId: string;
  user?: string;
  userRole?: string;
}): Promise<void> {
  try {
    await createAuditLog({
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

export async function getAuditLogs(): Promise<AuditLog[]> {
  // TODO: Implement Firebase logic
  return MOCK_AUDIT_LOGS;
}

export async function getAuditLogsByUser(userId: string): Promise<AuditLog[]> {
  // TODO: Implement Firebase logic
  return MOCK_AUDIT_LOGS.filter(log => log.userId === userId);
}

export async function getAuditLogsByResource(resourceType: string, resourceId: string): Promise<AuditLog[]> {
  // TODO: Implement Firebase logic
  return MOCK_AUDIT_LOGS.filter(log => 
    log.resourceType === resourceType && log.resourceId === resourceId
  );
}
