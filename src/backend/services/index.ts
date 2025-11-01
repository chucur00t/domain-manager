// Main services export - MIGRATED TO MySQL
import { UserService } from '@/backend/database/services/user.service';
import { ApplicationService } from '@/backend/database/services/application.service';
import { DomainService } from '@/backend/database/services/domain.service';
import { HostingService } from '@/backend/database/services/hosting.service';
import { AuditLogService } from '@/backend/database/services/audit-log.service';
import type { SubdomainApplication, ServiceDomain, User, AuditLog, HostingApplication } from '@/backend/models/types';

// Initialize service instances
const userService = new UserService();
const applicationService = new ApplicationService();
const domainService = new DomainService();
const hostingService = new HostingService();
const auditLogService = new AuditLogService();

// Re-export all services from firebase implementation
export * from './firebase/services';

// ===========================================
// APPLICATION SERVICES (MySQL Migration)
// ===========================================

export const getApplications = async () => {
  const result = await applicationService.getApplications(1, 100);
  return result.applications;
};

export const getApplicationById = async (id: string) => {
  return await applicationService.getApplication(parseInt(id));
};

export const createApplication = async (application: SubdomainApplication) => {
  // Map SubdomainApplication to CreateSubdomainApplicationData format
  const appData = {
    userId: application.userId || 'system',
    domainName: application.domainName,
    purpose: application.purpose || '',
    opd: application.opd,
    description: application.description || '',
    documents: application.documents?.map(doc => ({
      id: doc,
      name: doc,
      size: 0,
      type: 'application/pdf'
    }))
  };
  
  const id = await applicationService.createSubdomainApplication(appData);
  return id;
};

export const updateApplication = async (id: string, application: Partial<SubdomainApplication>) => {
  // Map partial update
  const updateData: any = {};
  if (application.status) updateData.status = application.status;
  if (application.rejectionReason) updateData.reason = application.rejectionReason;
  
  await applicationService.updateApplication(parseInt(id), updateData, 1);
};

export const deleteApplication = async (id: string) => {
  await applicationService.deleteApplication(parseInt(id));
};

export const updateApplicationStatus = async (
  id: string, 
  status: 'pending' | 'approved' | 'rejected' | 'pending_review' | 'pending_approval', 
  reason?: string
) => {
  await applicationService.updateApplication(parseInt(id), { status, reason }, 1); // updatedBy: system user
};

// ===========================================
// DOMAIN SERVICES (MySQL Migration)
// ===========================================

export const getDomains = async () => {
  const result = await domainService.getDomains(1, 100);
  return result.domains;
};

export const getDomainById = async (id: string) => {
  return await domainService.getDomain(parseInt(id));
};

export const updateDomain = async (id: string, domain: Partial<ServiceDomain>) => {
  // Map ServiceDomain to DomainService format
  const updateData: any = {};
  if (domain.status) updateData.status = domain.status;
  if (domain.expiryDate) updateData.expires_at = new Date(domain.expiryDate);
  
  await domainService.updateDomain(parseInt(id), updateData);
};

export const deleteDomain = async (id: string) => {
  await domainService.deleteDomain(parseInt(id));
};

export const updateDomainStatus = async (id: string, status: 'active' | 'inactive' | 'expired') => {
  await domainService.updateDomain(parseInt(id), { status });
};

export const createDomainFromApplication = async (application: SubdomainApplication): Promise<string> => {
  const domainData = {
    domain_name: application.domainName,
    status: 'active' as const,
    expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year from now
  };
  
  const domainId = await domainService.createDomain(domainData);
  return domainId.toString();
};

// ===========================================
// USER SERVICES (MySQL Migration)
// ===========================================

export const getUsers = async () => {
  const result = await userService.getUsers(1, 100);
  return result.users;
};

export const getUserById = async (id: string) => {
  return await userService.getUser(parseInt(id));
};

export const getUsersByOpd = async (opd: string) => {
  // OPD filter will be added to service
  const result = await userService.getUsers(1, 100, { search: opd });
  return result.users;
};

export const createUser = async (user: User) => {
  // Not implemented in service yet - will be added
  throw new Error('createUser not yet implemented in MySQL service');
};

export const updateUser = async (id: string, user: Partial<User>) => {
  // Not implemented in service yet - will be added
  throw new Error('updateUser not yet implemented in MySQL service');
};

export const deleteUser = async (id: string) => {
  await userService.deleteUser(parseInt(id));
};

// ===========================================
// AUDIT LOG & HOSTING SERVICES
// ===========================================

export const getAuditLogs = async () => {
  const result = await auditLogService.getAuditLogs(1, 100);
  return result.logs;
};

export const createAuditLog = async (log: AuditLog) => {
  const logData = {
    user_id: parseInt(log.userId),
    action: log.action,
    application_id: log.resourceId && log.resourceType === 'Application' ? parseInt(log.resourceId) : undefined,
    details: log.description || log.details
  };
  
  return await auditLogService.createAuditLog(logData);
};

export const getHostingApplications = async () => {
  const result = await hostingService.getHostings(1, 100);
  return result.hostings;
};

export const getHostingApplicationById = async (id: string) => {
  return await hostingService.getHosting(parseInt(id));
};

export const createHostingApplication = async (application: HostingApplication) => {
  // Map HostingApplication to CreateHostingData format
  const hostingData = {
    domain_id: parseInt(application.domainName) || undefined, // Assuming domainName contains domain ID
    storage_capacity: application.description.includes('Storage:') 
      ? application.description.split('Storage:')[1].split(',')[0].trim() 
      : '10GB',
    bandwidth: application.description.includes('Bandwidth:') 
      ? application.description.split('Bandwidth:')[1].split(',')[0].trim() 
      : '100GB',
    server_type: application.framework,
    status: application.status === 'approved' ? 'Active' as const : 'Deactivated' as const
  };
  
  return await hostingService.createHosting(hostingData);
};

export const updateHostingApplication = async (id: string, application: Partial<HostingApplication>) => {
  const updateData: any = {};
  
  if (application.framework) {
    updateData.server_type = application.framework;
  }
  
  if (application.status) {
    updateData.status = application.status === 'approved' ? 'Active' : 'Deactivated';
  }
  
  await hostingService.updateHosting(parseInt(id), updateData);
};
