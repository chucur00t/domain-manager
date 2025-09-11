
'use server';

import { revalidatePath } from 'next/cache';
import { logActivity } from '@/lib/audit';
import { createHostingApplication, getHostingApplicationById, updateHostingApplicationStatus } from '@/lib/firebase/services';
import type { HostingApplication, User } from '../types';

type ActionResponse = {
  success: boolean;
  message: string;
}

export async function submitHostingApplication(formData: FormData): Promise<ActionResponse> {
  const applicationName = formData.get('applicationName') as string;
  const domainName = formData.get('domainName') as string;
  const applicantName = formData.get('applicantName') as string;
  const opd = formData.get('opd') as string;
  const framework = formData.get('framework') as HostingApplication['framework'];
  const description = formData.get('description') as string;
  const currentUserRole = formData.get('currentUserRole') as User['role'];

  if (!applicationName || !domainName || !applicantName || !opd || !framework || !description) {
    return { success: false, message: 'Data tidak lengkap.' };
  }

  try {
    const newApplication: Omit<HostingApplication, 'id'> = {
      applicationName,
      domainName,
      opd,
      status: 'pending_review',
      submittedDate: new Date().toISOString().split('T')[0],
      applicantName,
      description,
      framework,
    };
    
    const newAppId = await createHostingApplication(newApplication);
    
    await logActivity('SUBMIT_HOSTING_APP', `Mengajukan permohonan hosting untuk ${applicationName} (ID: ${newAppId})`, currentUserRole);

    revalidatePath('/hosting');
    revalidatePath('/dashboard');
    revalidatePath('/super-admin/dashboard');
    
    return { 
      success: true, 
      message: 'Permohonan hosting berhasil dikirim untuk ditinjau.',
    };
  } catch (error) {
    console.error('Error submitting hosting application:', error);
    return { success: false, message: 'Terjadi kesalahan pada server saat memproses permohonan.' };
  }
}

export async function forwardHostingForApproval(applicationId: string, currentUserRole: User['role']): Promise<{ success: boolean; message: string }> {
  const allowedRoles: User['role'][] = ['Super Admin'];
   if (!allowedRoles.includes(currentUserRole)) {
    return { success: false, message: 'Anda tidak memiliki izin untuk melakukan tindakan ini.' };
  }
  
  const application = await getHostingApplicationById(applicationId);
  if (!application) {
    return { success: false, message: 'Permohonan hosting tidak ditemukan.' };
  }
  
  await updateHostingApplicationStatus(applicationId, 'pending_approval');
  
  await logActivity('FORWARD_HOSTING_FOR_APPROVAL', `Meneruskan permohonan hosting ${applicationId} (${application.applicationName}) untuk persetujuan final.`, currentUserRole);

  revalidatePath('/hosting');
  revalidatePath(`/hosting/${applicationId}`);
  revalidatePath('/super-admin/dashboard');
  revalidatePath('/audit-trail');

  return { success: true, message: `Permohonan hosting ${applicationId} berhasil diteruskan untuk persetujuan final.` };
}


export async function approveHostingApplication(applicationId: string, currentUserRole: User['role']): Promise<{ success: boolean; message: string }> {
   if (currentUserRole !== 'Administrator') {
    return { success: false, message: 'Anda tidak memiliki izin untuk melakukan tindakan ini.' };
  }

  const application = await getHostingApplicationById(applicationId);
  if (!application) {
    return { success: false, message: 'Permohonan hosting tidak ditemukan.' };
  }
  
  await updateHostingApplicationStatus(applicationId, 'approved');
  
  await logActivity('APPROVE_HOSTING_APP', `Menyetujui permohonan hosting ${applicationId} untuk ${application.applicationName}`, currentUserRole);
  
  revalidatePath('/hosting');
  revalidatePath(`/hosting/${applicationId}`);
  revalidatePath('/super-admin/dashboard');
  revalidatePath('/audit-trail');

  return { success: true, message: `Permohonan hosting ${applicationId} berhasil disetujui.` };
}

export async function rejectHostingApplication(applicationId: string, reason: string, currentUserRole: User['role']): Promise<{ success: boolean; message: string }> {
   const allowedRoles: User['role'][] = ['Administrator', 'Super Admin'];
   if (!allowedRoles.includes(currentUserRole)) {
    return { success: false, message: 'Anda tidak memiliki izin untuk melakukan tindakan ini.' };
  }
  
  const application = await getHostingApplicationById(applicationId);
  if (!application) {
    return { success: false, message: 'Permohonan hosting tidak ditemukan.' };
  }

  await updateHostingApplicationStatus(applicationId, 'rejected', reason);
  
  await logActivity('REJECT_HOSTING_APP', `Menolak permohonan hosting ${applicationId} (${application.applicationName}). Alasan: ${reason}`, currentUserRole);

  revalidatePath('/hosting');
  revalidatePath(`/hosting/${applicationId}`);
  revalidatePath('/super-admin/dashboard');
  revalidatePath('/audit-trail');

  return { success: true, message: `Permohonan hosting ${applicationId} berhasil ditolak.` };
}
