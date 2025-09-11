
'use server';

import { revalidatePath } from 'next/cache';
import { logActivity } from '@/lib/audit';
import type { SubdomainApplication, User } from '@/lib/types';
import { 
  createApplication, 
  updateApplicationStatus, 
  getApplicationById, 
  createDomainFromApplication 
} from '@/lib/firebase/services';

type ActionResponse = {
  success: boolean;
  message: string;
}

export async function submitApplication(applicationData: Omit<SubdomainApplication, 'id' | 'status' | 'submittedDate' | 'documents'>, currentUserRole: User['role']): Promise<ActionResponse> {
  const { domainName, applicantName, opd, description } = applicationData;

  if (!domainName || !applicantName || !description || !opd) {
    return { success: false, message: 'Data tidak lengkap.' };
  }

  try {
    const newApplication: Omit<SubdomainApplication, 'id'> = {
      ...applicationData,
      status: 'pending_review' as const,
      submittedDate: new Date().toISOString().split('T')[0],
      documents: ['surat_permohonan.pdf'], // Placeholder
    };
    
    const newAppId = await createApplication(newApplication);
    
    logActivity('SUBMIT_APPLICATION', `Mengajukan permohonan untuk ${domainName} (ID: ${newAppId})`, currentUserRole);

    revalidatePath('/applications');
    revalidatePath('/dashboard');
    revalidatePath('/super-admin/dashboard');
    
    return { 
      success: true, 
      message: 'Permohonan berhasil dikirim untuk ditinjau.',
    };
  } catch (error) {
    console.error('Error submitting application:', error);
    return { success: false, message: 'Terjadi kesalahan pada server saat memproses permohonan.' };
  }
}

export async function forwardForApproval(applicationId: string, currentUserRole: User['role']): Promise<{ success: boolean; message: string }> {
  const allowedRoles: User['role'][] = ['Super Admin', 'Pengelola Sistem'];
  if (!allowedRoles.includes(currentUserRole)) {
    return { success: false, message: 'Anda tidak memiliki izin untuk melakukan tindakan ini.' };
  }

  try {
    const application = await getApplicationById(applicationId);
    if (!application) {
      throw new Error('Application not found');
    }
    
    await updateApplicationStatus(applicationId, 'pending_approval');
    
    logActivity('FORWARD_FOR_APPROVAL', `Meneruskan permohonan ${applicationId} (${application.domainName}) untuk persetujuan final.`, currentUserRole);
    
    revalidatePath('/applications');
    revalidatePath(`/applications/${applicationId}`);
    revalidatePath('/super-admin/dashboard');
    revalidatePath('/audit-trail');

    return { success: true, message: `Permohonan ${applicationId} berhasil diteruskan untuk persetujuan final.` };
  } catch (error) {
    console.error('Error forwarding application:', error);
    return { success: false, message: 'Terjadi kesalahan saat meneruskan permohonan.' };
  }
}


export async function approveApplication(applicationId: string, currentUserRole: User['role']): Promise<{ success: boolean; message: string }> {
  const allowedRoles: User['role'][] = ['Administrator', 'Kepala Bidang'];
  if (!allowedRoles.includes(currentUserRole)) {
    return { success: false, message: 'Anda tidak memiliki izin untuk melakukan tindakan ini.' };
  }

  try {
    const application = await getApplicationById(applicationId);
    if (!application) {
      throw new Error('Application not found');
    }
    
    await updateApplicationStatus(applicationId, 'approved');
    await createDomainFromApplication(application);
    
    logActivity('APPROVE_APPLICATION', `Menyetujui permohonan ${applicationId} untuk ${application.domainName}`, currentUserRole);
    
    revalidatePath('/applications');
    revalidatePath(`/applications/${applicationId}`);
    revalidatePath('/domains');
    revalidatePath('/dashboard');
    revalidatePath('/super-admin/dashboard');
    revalidatePath('/audit-trail');

    return { success: true, message: `Permohonan ${applicationId} berhasil disetujui.` };
  } catch (error) {
    console.error('Error approving application:', error);
    return { success: false, message: 'Terjadi kesalahan saat menyetujui permohonan.' };
  }
}

export async function rejectApplication(applicationId: string, reason: string, currentUserRole: User['role']): Promise<{ success: boolean; message: string }> {
  const allowedRoles: User['role'][] = ['Administrator', 'Kepala Bidang', 'Super Admin', 'Pengelola Sistem'];
  if (!allowedRoles.includes(currentUserRole)) {
    return { success: false, message: 'Anda tidak memiliki izin untuk melakukan tindakan ini.' };
  }

  try {
    const application = await getApplicationById(applicationId);
    if (!application) {
        throw new Error('Application not found');
    }

    await updateApplicationStatus(applicationId, 'rejected', reason);
    
    logActivity('REJECT_APPLICATION', `Menolak permohonan ${applicationId} (${application.domainName}). Alasan: ${reason}`, currentUserRole);
    
    revalidatePath('/applications');
    revalidatePath(`/applications/${applicationId}`);
    revalidatePath('/dashboard');
    revalidatePath('/super-admin/dashboard');
    revalidatePath('/audit-trail');

    return { success: true, message: `Permohonan ${applicationId} berhasil ditolak.` };
  } catch (error) {
    console.error('Error rejecting application:', error);
    return { success: false, message: 'Terjadi kesalahan saat menolak permohonan.' };
  }
}
