
'use server';

import { revalidatePath } from 'next/cache';
import { logActivity } from '@/backend/services/audit.service';
import type { User } from '@/backend/models/types';
import { 
  getDomainById,
  updateDomainStatus, 
  updateDomain as updateDomainInFirestore
} from '@/backend/services';

export async function activateDomain(domainId: string, currentUserRole: User['role']): Promise<{ success: boolean; message: string }> {
  if (currentUserRole !== 'Kepala Bidang') {
    return { success: false, message: 'Anda tidak memiliki izin untuk melakukan tindakan ini.' };
  }

  try {
    const domain = await getDomainById(domainId);
    if (!domain) {
      throw new Error('Domain not found');
    }
    
    await updateDomainStatus(domainId, 'active');
    
    logActivity('ACTIVATE_DOMAIN', `Mengaktifkan domain ${domain.hostname} (ID: ${domainId})`, currentUserRole);
    
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
  if (currentUserRole !== 'Kepala Bidang') {
    return { success: false, message: 'Anda tidak memiliki izin untuk melakukan tindakan ini.' };
  }

  try {
    const domain = await getDomainById(domainId);
    if (!domain) {
      throw new Error('Domain not found');
    }
    
    await updateDomainStatus(domainId, 'inactive');

    logActivity('DEACTIVATE_DOMAIN', `Menonaktifkan domain ${domain.hostname} (ID: ${domainId})`, currentUserRole);
    
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

export async function updateDomainInfo(
  domainId: string, 
  hostname: string,
  ttl: string,
  recordType: string,
  priority: string,
  destination: string,
  currentUserRole: User['role']
  ): Promise<{ success: boolean; message: string }> {
  
  if (currentUserRole !== 'Pengelola Sistem') {
    return { success: false, message: 'Anda tidak memiliki izin untuk melakukan tindakan ini.' };
  }
  
  try {
    const domainData = { hostname, ttl, recordType, priority, destination };
    await updateDomainInFirestore(domainId, domainData);

    logActivity('UPDATE_DOMAIN_INFO', `Memperbarui info teknis untuk domain ${hostname} (ID: ${domainId})`, currentUserRole);
    
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
