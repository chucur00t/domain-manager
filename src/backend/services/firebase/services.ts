// Firebase service implementations using database services
import { 
  userService, 
  domainService, 
  applicationService 
} from '@/backend/database/services';
import { HostingService } from '@/backend/database/services/hosting.service';

import { getCurrentUserId } from '@/backend/utils/auth';
import { auditService } from '@/backend/services/audit.service';

import type { SubdomainApplication, ServiceDomain, User, AuditLog, HostingApplication } from '@/backend/models/types';
import type { CreateUserData, UpdateUserData, UserFilter } from '@/backend/database/services/user.service';
import type { CreateDomainData, UpdateDomainData, DomainFilter } from '@/backend/database/services/domain.service';
import type { CreateSubdomainApplicationData, UpdateApplicationData, ApplicationFilter } from '@/backend/database/services/application.service';

// Initialize hosting service
const hostingService = new HostingService();

// Application Services
export async function createApplication(data: SubdomainApplication): Promise<SubdomainApplication> {
  try {
    // This function is deprecated, use createSubdomainApplication instead
    return data;
  } catch (error) {
    throw new Error(`Failed to create application: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function getApplication(id: string): Promise<SubdomainApplication | null> {
  try {
    const app = await applicationService.getApplication(parseInt(id));
    if (!app) return null;
    
    // Ensure we return only SubdomainApplication type
    if ('purpose' in app && 'submissionDate' in app) {
      return app as SubdomainApplication;
    }
    return null;
  } catch (error) {
    throw new Error(`Failed to get application: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function updateApplication(id: string, data: Partial<SubdomainApplication>): Promise<void> {
  try {
    // Extract updatable fields for application service
    const updateData: UpdateApplicationData = {};
    
    if (data.status) updateData.status = data.status;
    if (data.rejectionReason) updateData.reason = data.rejectionReason;
    
    const userId = await getCurrentUserId();
    if (!userId) {
      throw new Error('User not authenticated');
    }
    
    await applicationService.updateApplication(parseInt(id), updateData, userId);
  } catch (error) {
    throw new Error(`Failed to update application: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function deleteApplication(id: string): Promise<void> {
  try {
    await applicationService.deleteApplication(parseInt(id));
  } catch (error) {
    throw new Error(`Failed to delete application: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function getApplications(): Promise<SubdomainApplication[]> {
  try {
    const result = await applicationService.getApplications(1, 1000); // Get all applications
    return result.applications as SubdomainApplication[];
  } catch (error) {
    throw new Error(`Failed to get applications: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Subdomain Applications
export async function createSubdomainApplication(application: Omit<SubdomainApplication, 'id'>): Promise<string> {
  try {
    const data: CreateSubdomainApplicationData = {
      userId: application.userId,
      domainName: application.domainName,
      purpose: application.purpose,
      opd: application.opd
    };
    
    return await applicationService.createSubdomainApplication(data);
  } catch (error) {
    throw new Error(`Failed to create subdomain application: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function getSubdomainApplication(id: string): Promise<SubdomainApplication | null> {
  try {
    const app = await applicationService.getApplication(parseInt(id));
    if (!app) return null;
    
    // Convert to SubdomainApplication format if needed
    if ('domainName' in app && app.domainName) {
      return app as SubdomainApplication;
    }
    return null;
  } catch (error) {
    throw new Error(`Failed to get subdomain application: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function updateSubdomainApplication(id: string, data: Partial<SubdomainApplication>): Promise<void> {
  try {
    const updateData: UpdateApplicationData = {};
    
    if (data.status) updateData.status = data.status;
    if (data.rejectionReason) updateData.reason = data.rejectionReason;
    
    const userId = await getCurrentUserId();
    if (!userId) {
      throw new Error('User not authenticated');
    }
    
    await applicationService.updateApplication(parseInt(id), updateData, userId);
  } catch (error) {
    throw new Error(`Failed to update subdomain application: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function deleteSubdomainApplication(id: string): Promise<void> {
  try {
    await applicationService.deleteApplication(parseInt(id));
  } catch (error) {
    throw new Error(`Failed to delete subdomain application: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function getSubdomainApplications(): Promise<SubdomainApplication[]> {
  try {
    const result = await applicationService.getApplications(1, 1000);
    return result.applications.filter(app => app.domainName !== '') as SubdomainApplication[];
  } catch (error) {
    throw new Error(`Failed to get subdomain applications: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Domain Services
export async function createDomain(data: Omit<ServiceDomain, 'id'>): Promise<string> {
  try {
    const domainData: CreateDomainData = {
      domain_name: data.hostname,
      status: data.status,
      expires_at: new Date(data.expiryDate)
    };
    
    return await domainService.createDomain(domainData);
  } catch (error) {
    throw new Error(`Failed to create domain: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function getDomain(id: string): Promise<ServiceDomain | null> {
  try {
    return await domainService.getDomain(parseInt(id));
  } catch (error) {
    throw new Error(`Failed to get domain: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function updateDomain(id: string, data: Partial<ServiceDomain>): Promise<void> {
  try {
    const updateData: UpdateDomainData = {};
    
    if (data.status) updateData.status = data.status;
    if (data.expiryDate) updateData.expires_at = new Date(data.expiryDate);
    
    await domainService.updateDomain(parseInt(id), updateData);
  } catch (error) {
    throw new Error(`Failed to update domain: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function deleteDomain(id: string): Promise<void> {
  try {
    await domainService.deleteDomain(parseInt(id));
  } catch (error) {
    throw new Error(`Failed to delete domain: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function getDomains(): Promise<ServiceDomain[]> {
  try {
    const result = await domainService.getDomains(1, 1000);
    return result.domains;
  } catch (error) {
    throw new Error(`Failed to get domains: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function createDomainFromApplication(data: Omit<ServiceDomain, 'id'>): Promise<string> {
  try {
    return await createDomain(data);
  } catch (error) {
    throw new Error(`Failed to create domain from application: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// User Services
export async function createUser(data: Omit<User, 'id'>): Promise<User> {
  try {
    const userData: CreateUserData = {
      username: data.name,
      email: data.email,
      role: data.role,
      is_active: data.status === 'active'
    };
    
    const userId = await userService.createUser(userData);
    const user = await userService.getUser(parseInt(userId));
    
    if (!user) {
      throw new Error('Failed to retrieve created user');
    }
    
    return user;
  } catch (error) {
    throw new Error(`Failed to create user: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function getUser(id: string): Promise<User | null> {
  try {
    return await userService.getUser(parseInt(id));
  } catch (error) {
    throw new Error(`Failed to get user: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function updateUser(id: string, data: Partial<User>): Promise<void> {
  try {
    const updateData: UpdateUserData = {};
    
    if (data.name) updateData.username = data.name;
    if (data.email) updateData.email = data.email;
    if (data.role) updateData.role = data.role;
    if (data.status) updateData.is_active = data.status === 'active';
    
    await userService.updateUser(parseInt(id), updateData);
  } catch (error) {
    throw new Error(`Failed to update user: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function deleteUser(id: string): Promise<void> {
  try {
    await userService.deleteUser(parseInt(id));
  } catch (error) {
    throw new Error(`Failed to delete user: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function getUsers(): Promise<User[]> {
  try {
    const result = await userService.getUsers(1, 1000);
    return result.users;
  } catch (error) {
    throw new Error(`Failed to get users: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function getUsersByOpd(opd: string): Promise<User[]> {
  try {
    const result = await userService.getUsers(1, 1000, { search: opd });
    return result.users;
  } catch (error) {
    throw new Error(`Failed to get users by OPD: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const result = await userService.getUsers(1, 1000, { search: email });
    return result.users.find(user => user.email === email) || null;
  } catch (error) {
    throw new Error(`Failed to get user by email: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function getUserById(id: string): Promise<User | null> {
  try {
    return await getUser(id);
  } catch (error) {
    throw new Error(`Failed to get user by ID: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function createUserData(data: Omit<User, 'id'>): Promise<string> {
  try {
    const user = await createUser(data);
    return user.id;
  } catch (error) {
    throw new Error(`Failed to create user data: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Audit Log Services
export async function createAuditLog(data: AuditLog): Promise<AuditLog> {
  try {
    return await auditService.createAuditLog({
      userId: data.userId,
      action: data.action,
      resourceType: data.resourceType,
      resourceId: data.resourceId,
      description: data.description
    });
  } catch (error) {
    throw new Error(`Failed to create audit log: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function getAuditLogs(): Promise<AuditLog[]> {
  try {
    return await auditService.getAuditLogs();
  } catch (error) {
    throw new Error(`Failed to get audit logs: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Hosting Application Services
export async function createHostingApplication(data: Omit<HostingApplication, 'id'>): Promise<string> {
  try {
    // For now, return a generated ID
    // Full implementation requires mapping HostingApplication type to database schema
    // which may need type adjustments
    const hostingId = `hosting-${Date.now()}`;
    console.log('Hosting application created:', hostingId, data);
    return hostingId;
  } catch (error) {
    throw new Error(`Failed to create hosting application: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function getHostingApplication(id: string): Promise<HostingApplication | null> {
  try {
    // Use the MySQL service implementation
    const { getHostingApplicationById } = await import('@/backend/services');
    const hosting = await getHostingApplicationById(id);
    return hosting;
  } catch (error) {
    console.error('Error fetching hosting application:', error);
    return null;
  }
}

export async function updateHostingApplication(id: string, data: Partial<HostingApplication>): Promise<void> {
  try {
    // Implementation pending: Type alignment needed
    console.log('Hosting application updated:', id, data);
  } catch (error) {
    throw new Error(`Failed to update hosting application: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function deleteHostingApplication(id: string): Promise<void> {
  try {
    // Implementation pending: Type alignment needed
    console.log('Hosting application deleted:', id);
  } catch (error) {
    throw new Error(`Failed to delete hosting application: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function getHostingApplications(): Promise<HostingApplication[]> {
  try {
    // Implementation pending: Type alignment needed
    return [];
  } catch (error) {
    throw new Error(`Failed to get hosting applications: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function createHostingApplicationData(application: Omit<HostingApplication, 'id'>): Promise<string> {
  try {
    return await createHostingApplication(application);
  } catch (error) {
    throw new Error(`Failed to create hosting application data: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Application approval/rejection
export async function approveApplication(id: string): Promise<void> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      throw new Error('User not authenticated');
    }
    
    await applicationService.updateApplication(parseInt(id), { status: 'approved' }, userId);
    
    // Create domain from approved application
    const application = await getApplication(id);
    if (application && application.domainName) {
      await createDomainFromApplication({
        hostname: application.domainName,
        status: 'active',
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        opd: application.opd
      });
    }
  } catch (error) {
    throw new Error(`Failed to approve application: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function rejectApplication(id: string): Promise<void> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      throw new Error('User not authenticated');
    }
    
    await applicationService.updateApplication(parseInt(id), { status: 'rejected' }, userId);
  } catch (error) {
    throw new Error(`Failed to reject application: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
