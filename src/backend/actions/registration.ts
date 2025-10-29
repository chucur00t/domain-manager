
'use server';

import { revalidatePath } from 'next/cache';
import { logActivity } from '@/backend/services/audit.service';
import { createDomain, createHostingApplication } from '@/backend/services/firebase/services';
import type { Domain, HostingApplication, User } from '@/backend/models/types';

type ActionResponse = {
  success: boolean;
  message: string;
}

export async function registerSubdomain(formData: FormData): Promise<ActionResponse> {
  const currentUserRole = formData.get('currentUserRole') as User['role'];
  if (currentUserRole !== 'Super Admin') {
    return { success: false, message: 'Anda tidak memiliki izin untuk melakukan tindakan ini.' };
  }

  const hostname = formData.get('hostname') as string;
  const opd = formData.get('opd') as string;
  const status = formData.get('status') as Domain['status'];
  const expiryDate = formData.get('activationDate') as string;
  
  if (!hostname || !opd || !status || !expiryDate) {
    return { success: false, message: 'Data wajib tidak lengkap (Hostname, OPD, Status, Tgl Aktivasi).' };
  }

  try {
    const newDomain: Omit<Domain, 'id'> = {
      hostname,
      opd,
      status,
      expiryDate
    };
    
    await createDomain(newDomain);
    
    await logActivity({
      action: 'REGISTER_SUBDOMAIN',
      resourceType: 'domain',
      resourceId: hostname,
      description: `Mencatat subdomain baru secara manual: ${hostname}`,
      userId: 'system'
    });

    revalidatePath('/domains');
    revalidatePath('/super-admin/dashboard');
    revalidatePath('/audit-trail');
    
    return { 
      success: true, 
      message: `Subdomain ${hostname} berhasil dicatat.`,
    };
  } catch (error) {
    console.error('Error registering subdomain:', error);
    return { success: false, message: 'Terjadi kesalahan pada server saat mencatat subdomain.' };
  }
}

export async function registerHosting(formData: FormData): Promise<ActionResponse> {
  const currentUserRole = formData.get('currentUserRole') as User['role'];
  if (currentUserRole !== 'Super Admin') {
    return { success: false, message: 'Anda tidak memiliki izin untuk melakukan tindakan ini.' };
  }

  const applicationName = formData.get('applicationName') as string;
  const domainName = formData.get('domainName') as string;
  const opd = formData.get('opd') as string;
  const framework = formData.get('framework') as HostingApplication['framework'];
  const description = formData.get('description') as string;
  const status = formData.get('status') as HostingApplication['status'];
  const submittedDate = formData.get('submittedDate') as string;

  if (!applicationName || !domainName || !opd || !framework || !status || !submittedDate) {
    return { success: false, message: 'Data wajib tidak lengkap.' };
  }

  try {
    const newHosting: Omit<HostingApplication, 'id'> = {
      applicationName,
      domainName,
      opd,
      framework,
      description,
      applicantName: 'Dicatat oleh Admin', // Default value
      userId: 'system', // Since this is manual registration
      status,
      submittedDate
    };
    
    await createHostingApplication(newHosting);
    
    await logActivity({
      action: 'REGISTER_HOSTING',
      resourceType: 'hosting',
      resourceId: applicationName,
      description: `Mencatat hosting baru secara manual untuk ${applicationName}`,
      userId: 'system'
    });

    revalidatePath('/hosting');
    revalidatePath('/super-admin/dashboard');
    revalidatePath('/audit-trail');
    
    return { 
      success: true, 
      message: `Layanan hosting untuk ${applicationName} berhasil dicatat.`,
    };
  } catch (error) {
    console.error('Error registering hosting:', error);
    return { success: false, message: 'Terjadi kesalahan pada server saat mencatat hosting.' };
  }
}
