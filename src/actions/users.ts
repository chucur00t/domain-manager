
'use server';

import { revalidatePath } from 'next/cache';
import { getUsers, addUser as addUserToDb, updateUser as updateUserInDb, deleteUser as deleteUserFromDb, getUsersByOpd } from '@/lib/firebase/services';
import { logActivity } from '@/lib/audit';
import type { User } from '../types';

export async function addUser(formData: FormData): Promise<{ success: boolean; message: string }> {
  const currentUserRole = formData.get('currentUserRole') as User['role'];
  
  const users = await getUsers();
  const currentUser = users.find(u => u.role === currentUserRole);

  const allowedRoles: User['role'][] = ['Pengelola Sistem', 'Admin Perangkat Daerah'];
  if (!currentUserRole || !allowedRoles.includes(currentUserRole)) {
      return { success: false, message: 'Anda tidak memiliki izin untuk menambahkan pengguna.' };
  }

  try {
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const role = formData.get('role') as User['role'];
    const opd = formData.get('opd') as string | null;

    if (currentUserRole === 'Admin Perangkat Daerah' && opd !== currentUser?.opd) {
        return { success: false, message: 'Anda hanya dapat menambahkan pengguna ke OPD Anda sendiri.' };
    }

    const newUser: Omit<User, 'id'> = {
      name,
      email,
      role,
      opd: role === 'Admin Perangkat Daerah' ? opd || undefined : undefined,
      nip: `NIP${Math.floor(Math.random() * 1000000)}`,
      whatsapp: '081234567890'
    };
    
    const newUserId = await addUserToDb(newUser);

    logActivity('ADD_USER', `Menambahkan pengguna baru: ${name} (${email}) dengan peran ${role} (ID: ${newUserId}).`, currentUserRole);

    revalidatePath('/users');
    revalidatePath('/super-admin/dashboard');
    revalidatePath('/audit-trail');

    return { success: true, message: `Pengguna ${name} berhasil ditambahkan.` };
  } catch (error) {
    console.error('Error adding user:', error);
    return { success: false, message: 'Terjadi kesalahan saat menambahkan pengguna baru.' };
  }
}

export async function updateUser(userId: string, formData: FormData): Promise<{ success: boolean; message: string }> {
    const currentUserRole = formData.get('currentUserRole') as User['role'];
    const users = await getUsers();
    const currentUser = users.find(u => u.role === currentUserRole);
    
    const allowedRoles: User['role'][] = ['Pengelola Sistem', 'Admin Perangkat Daerah'];
    if (!currentUserRole || !allowedRoles.includes(currentUserRole)) {
      return { success: false, message: 'Anda tidak memiliki izin untuk memperbarui pengguna.' };
    }
    
    try {
        const name = formData.get('name') as string;
        const email = formData.get('email') as string;
        const role = formData.get('role') as User['role'];
        const opd = formData.get('opd') as string | null;

        const userToUpdate = users.find(u => u.id === userId);
        if (!userToUpdate) {
            throw new Error('User not found');
        }

        if (currentUserRole === 'Admin Perangkat Daerah' && userToUpdate.opd !== currentUser?.opd) {
             return { success: false, message: 'Anda hanya dapat memperbarui pengguna di OPD Anda sendiri.' };
        }

        const updatedData: Partial<User> = {
            name,
            email,
            role,
            opd: role === 'Admin Perangkat Daerah' ? opd || undefined : undefined,
        };
        
        await updateUserInDb(userId, updatedData);
        
        logActivity('UPDATE_USER', `Memperbarui pengguna ${name} (ID: ${userId}).`, currentUserRole);

        revalidatePath('/users');
        revalidatePath('/audit-trail');

        return { success: true, message: `Pengguna ${name} berhasil diperbarui.` };
    } catch (error) {
        console.error('Error updating user:', error);
        return { success: false, message: 'Terjadi kesalahan saat memperbarui pengguna.' };
    }
}

export async function deleteUser(userId: string, currentUserRole: User['role']): Promise<{ success: boolean; message: string }> {
    const users = await getUsers();
    const currentUser = users.find(u => u.role === currentUserRole);
    
    const allowedRoles: User['role'][] = ['Pengelola Sistem', 'Admin Perangkat Daerah'];
    if (!currentUserRole || !allowedRoles.includes(currentUserRole)) {
        return { success: false, message: 'Anda tidak memiliki izin untuk melakukan tindakan ini.' };
    }

    try {
        const userToDelete = users.find(u => u.id === userId);
        if (!userToDelete) {
            throw new Error('User not found');
        }

        if (currentUserRole === 'Admin Perangkat Daerah' && userToDelete.opd !== currentUser?.opd) {
             return { success: false, message: 'Anda hanya dapat menghapus pengguna dari OPD Anda sendiri.' };
        }
        
        await deleteUserFromDb(userId);

        logActivity('DELETE_USER', `Menghapus pengguna ${userToDelete.name} (ID: ${userId}).`, currentUserRole);
        
        revalidatePath('/users');
        revalidatePath('/super-admin/dashboard');
        revalidatePath('/audit-trail');

        return { success: true, message: `Pengguna berhasil dihapus.` };
    } catch (error) {
        console.error('Error deleting user:', error);
        return { success: false, message: 'Terjadi kesalahan saat menghapus pengguna.' };
    }
}


export async function userLogin(role: User['role']) {
    try {
        logActivity('USER_LOGIN', `Pengguna masuk sebagai ${role}.`, role);
        revalidatePath('/audit-trail');
    } catch (error) {
        console.error('Error logging user login:', error);
    }
}

export async function userLogout(role: User['role']) {
    try {
        logActivity('USER_LOGOUT', `Pengguna keluar dari sesi ${role}.`, role);
    } catch (error) {
        console.error('Error logging user logout:', error);
    }
}
