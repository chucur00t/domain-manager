
'use server';

import { revalidatePath } from 'next/cache';
import { logActivity } from '@/lib/audit';
import { createDomain, createHostingApplication } from '@/lib/firebase/services';
import type { Domain, HostingApplication, User } from '../types';

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
  const activationDate = formData.get('activationDate') as string;
  const recordType = formData.get('recordType') as string;
  const destination = formData.get('destination') as string;
  
  if (!hostname || !opd || !status || !activationDate) {
    return { success: false, message: 'Data wajib tidak lengkap (Hostname, OPD, Status, Tgl Aktivasi).' };
  }

  try {
    const newDomain: Omit<Domain, 'id'> = {
      hostname,
      opd,
      status,
      activationDate,
      parentDomain: 'kalbarprov.go.id',
      recordType: recordType || undefined,
      destination: destination || undefined,
    };
    
    await createDomain(newDomain);
    
    await logActivity('REGISTER_SUBDOMAIN', `Mencatat subdomain baru secara manual: ${hostname}`, currentUserRole);

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
      status,
      submittedDate,
      applicantName: 'Dicatat oleh Admin', // Default value
    };
    
    await createHostingApplication(newHosting);
    
    await logActivity('REGISTER_HOSTING', `Mencatat hosting baru secara manual untuk ${applicationName}`, currentUserRole);

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
