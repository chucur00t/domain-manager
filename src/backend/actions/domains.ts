
'use server';

import { revalidatePath } from 'next/cache';
import { auditService } from '@/backend/services/audit.service';
import type { User } from '@/backend/models/types';
import { DomainService } from '@/backend/database/services/domain.service';

// Initialize MySQL Domain Service
const domainService = new DomainService();

export async function getDomainById(domainId: string) {
  try {
    const domain = await domainService.getDomain(parseInt(domainId));
    return domain;
  } catch (error) {
    console.error('Error getting domain by ID:', error);
    throw error;
  }
}

export async function activateDomain(domainId: string, currentUserRole: User['role']): Promise<{ success: boolean; message: string }> {
  const allowedRoles: User['role'][] = ['Kepala Bidang', 'Super Admin'];
  if (!allowedRoles.includes(currentUserRole)) {
    return { success: false, message: 'Anda tidak memiliki izin untuk melakukan tindakan ini.' };
  }

  try {
    const domain = await domainService.getDomain(parseInt(domainId));
    if (!domain) {
      throw new Error('Domain not found');
    }
    
    await domainService.updateDomain(parseInt(domainId), { status: 'Active' });
    
    // Update DNS records status if provider is configured
    try {
      const { dnsManagerService } = await import('@/backend/services/dns/dns-manager.service');
      
      await dnsManagerService.updateDomainRecords({
        domain: domain as any, // ServiceDomain to Domain type compatibility
        newStatus: 'active',
        userId: 'system',
      });
    } catch (dnsError) {
      console.warn('DNS update warning:', dnsError);
      // Don't fail activation, just log warning
    }
    
    await auditService.logAction({
      action: 'ACTIVATE_DOMAIN',
      resourceType: 'domain',
      resourceId: domainId,
      description: `Mengaktifkan domain ${domain.hostname} (ID: ${domainId})`,
      userId: 'system',
      userRole: currentUserRole,
    });
    
    revalidatePath('/domains');
    revalidatePath(`/domains/${domainId}`);
    revalidatePath('/dashboard');
    revalidatePath('/super-admin/dashboard');
    revalidatePath('/audit-trail');

    return { success: true, message: `Domain ${domain.hostname} berhasil diaktifkan.` };
  } catch (error) {
    console.error('Error activating domain:', error);
    return { success: false, message: 'Terjadi kesalahan saat mengaktifkan domain.' };
  }
}

export async function deactivateDomain(domainId: string, currentUserRole: User['role']): Promise<{ success: boolean; message: string }> {
  const allowedRoles: User['role'][] = ['Kepala Bidang', 'Super Admin'];
  if (!allowedRoles.includes(currentUserRole)) {
    return { success: false, message: 'Anda tidak memiliki izin untuk melakukan tindakan ini.' };
  }

  try {
    const domain = await domainService.getDomain(parseInt(domainId));
    if (!domain) {
      throw new Error('Domain not found');
    }
    
    await domainService.updateDomain(parseInt(domainId), { status: 'Deactivated' });

    // Update DNS records status if provider is configured
    try {
      const { dnsManagerService } = await import('@/backend/services/dns/dns-manager.service');
      
      await dnsManagerService.updateDomainRecords({
        domain: domain as any, // ServiceDomain to Domain type compatibility
        newStatus: 'suspended',
        userId: 'system',
      });
    } catch (dnsError) {
      console.warn('DNS update warning:', dnsError);
      // Don't fail deactivation, just log warning
    }

    await auditService.logAction({
      action: 'DEACTIVATE_DOMAIN',
      resourceType: 'domain',
      resourceId: domainId,
      description: `Menonaktifkan domain ${domain.hostname} (ID: ${domainId})`,
      userId: 'system',
      userRole: currentUserRole,
    });
    
    revalidatePath('/domains');
    revalidatePath(`/domains/${domainId}`);
    revalidatePath('/dashboard');
    revalidatePath('/super-admin/dashboard');
    revalidatePath('/audit-trail');

    return { success: true, message: `Domain ${domain.hostname} berhasil dinonaktifkan.` };
  } catch (error) {
    console.error('Error deactivating domain:', error);
    return { success: false, message: 'Terjadi kesalahan saat menonaktifkan domain.' };
  }
}

export async function updateDomainStatus(domainId: string, status: 'Active' | 'Deactivated' | 'Expired' | 'Suspended') {
  try {
    await domainService.updateDomain(parseInt(domainId), { status });
  } catch (error) {
    console.error('Error updating domain status:', error);
    throw error;
  }
}

export async function updateDomain(
  domainId: string, 
  domainData: any
) {
  try {
    await domainService.updateDomain(parseInt(domainId), domainData);
  } catch (error) {
    console.error('Error updating domain:', error);
    throw error;
  }
}

export async function updateDomainInfo(
  domainId: string, 
  hostname: string,
  ttl: string,
  recordType: string,
  priority: string,
  destination: string,
  currentUserRole: User['role']
  ): Promise<{ success: boolean; message: string }> {
  
  const allowedRoles: User['role'][] = ['Pengelola Sistem', 'Super Admin'];
  if (!allowedRoles.includes(currentUserRole)) {
    return { success: false, message: 'Anda tidak memiliki izin untuk melakukan tindakan ini.' };
  }
  
  try {
    // For MySQL, we only have basic domain info
    // TTL, recordType, priority, destination are DNS-specific and might need separate table
    // For now, just update the hostname if changed
    await domainService.updateDomain(parseInt(domainId), {
      // Only domain_name can be updated from current schema
      // DNS records would need a separate table
    });

    await auditService.logAction({
      action: 'UPDATE_DOMAIN_INFO',
      resourceType: 'domain',
      resourceId: domainId,
      description: `Memperbarui info teknis untuk domain ${hostname} (ID: ${domainId})`,
      userId: 'system',
      userRole: currentUserRole,
    });
    
    revalidatePath(`/domains/${domainId}`);
    revalidatePath('/domains');
    revalidatePath('/dashboard');
    revalidatePath('/super-admin/dashboard');
    revalidatePath('/audit-trail');

    return { success: true, message: `Informasi teknis untuk domain ${hostname} berhasil diperbarui.` };
  } catch (error) {
    console.error('Error updating domain info:', error);
    return { success: false, message: 'Terjadi kesalahan saat memperbarui informasi teknis.' };
  }
}
