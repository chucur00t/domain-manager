
'use server';

import { revalidatePath } from 'next/cache';
import { getUsers, addUser as addUserToDb, updateUser as updateUserInDb, deleteUser as deleteUserFromDb, updateUser as updateUserStatusInDb } from '@/lib/firebase/services';
import { logActivity } from '@/lib/audit';
import type { User } from '@/lib/types';

export async function addUser(formData: FormData): Promise<{ success: boolean; message: string }> {
  const currentUserId = formData.get('currentUserId') as string;
  
  const users = await getUsers();
  const currentUser = users.find(u => u.id === currentUserId);
  
  if (!currentUser) {
      return { success: false, message: 'Anda tidak memiliki izin untuk menambahkan pengguna.' };
  }

  const allowedRoles: User['role'][] = ['Super Admin', 'Administrator'];
  if (!allowedRoles.includes(currentUser.role)) {
      return { success: false, message: 'Anda tidak memiliki izin untuk menambahkan pengguna.' };
  }

  try {
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const role = formData.get('role') as User['role'];
    const opd = formData.get('opd') as string | null;

    if (currentUser.role === 'Administrator') {
        if (opd !== currentUser.opd) {
             return { success: false, message: 'Anda hanya dapat menambahkan pengguna ke OPD Anda sendiri.' };
        }
        if (role !== 'Operator') {
             return { success: false, message: 'Anda hanya dapat menambahkan pengguna dengan peran Operator.' };
        }
    }

    const newUser: Omit<User, 'id'> = {
      name,
      email,
      role,
      opd: role === 'Administrator' || role === 'Operator' ? opd || undefined : undefined,
      nip: `NIP${Math.floor(Math.random() * 1000000)}`,
      whatsapp: '081234567890',
      status: 'active',
    };
    
    const newUserId = await addUserToDb(newUser);

    await logActivity('ADD_USER', `Menambahkan pengguna baru: ${name} (${email}) dengan peran ${role} (ID: ${newUserId}).`, currentUser.role);

    revalidatePath('/users');
    revalidatePath('/super-admin/users');
    revalidatePath('/super-admin/dashboard');
    revalidatePath('/audit-trail');

    return { success: true, message: `Pengguna ${name} berhasil ditambahkan.` };
  } catch (error) {
    console.error('Error adding user:', error);
    return { success: false, message: 'Terjadi kesalahan saat menambahkan pengguna baru.' };
  }
}

export async function updateUser(userId: string, currentUserId: string, formData: FormData): Promise<{ success: boolean; message: string }> {
    const users = await getUsers();
    const currentUser = users.find(u => u.id === currentUserId);
    
    if (!currentUser) {
        return { success: false, message: 'Tidak dapat mengidentifikasi pengguna saat ini. Aksi dibatalkan.' };
    }
    
    const allowedRoles: User['role'][] = ['Super Admin', 'Administrator'];
    if (!allowedRoles.includes(currentUser.role)) {
      return { success: false, message: 'Anda tidak memiliki izin untuk memperbarui pengguna.' };
    }
    
    try {
        const userToUpdate = users.find(u => u.id === userId);

        if (!userToUpdate) {
            throw new Error('User not found');
        }

        if (currentUser.role === 'Administrator') {
            if (userToUpdate.opd !== currentUser.opd) {
                return { success: false, message: 'Anda hanya dapat memperbarui pengguna di OPD Anda sendiri.' };
            }
             if (userToUpdate.role !== 'Operator') {
                return { success: false, message: 'Anda hanya dapat memperbarui pengguna dengan peran Operator.' };
            }
        }

        const name = formData.get('name') as string;
        const email = formData.get('email') as string;
        const role = formData.get('role') as User['role'];
        const opd = formData.get('opd') as string | null;

        const updatedData: Partial<User> = {
            name,
            email,
            role,
            opd: role === 'Administrator' || role === 'Operator' ? opd || undefined : undefined,
        };
        
        await updateUserInDb(userId, updatedData);
        
        await logActivity('UPDATE_USER', `Memperbarui pengguna ${name} (ID: ${userId}).`, currentUser.role);

        revalidatePath('/users');
        revalidatePath('/super-admin/users');
        revalidatePath('/audit-trail');

        return { success: true, message: `Pengguna ${name} berhasil diperbarui.` };
    } catch (error) {
        console.error('Error updating user:', error);
        return { success: false, message: 'Terjadi kesalahan saat memperbarui pengguna.' };
    }
}

export async function deleteUser(userId: string, currentUserId: string): Promise<{ success: boolean; message: string }> {
    const users = await getUsers();
    const currentUser = users.find(u => u.id === currentUserId);

    if (!currentUser) {
        return { success: false, message: 'Tidak dapat mengidentifikasi pengguna saat ini. Aksi dibatalkan.' };
    }

    const allowedRoles: User['role'][] = ['Super Admin', 'Administrator'];
    if (!allowedRoles.includes(currentUser.role)) {
        return { success: false, message: 'Anda tidak memiliki izin untuk melakukan tindakan ini.' };
    }

    try {
        const userToDelete = users.find(u => u.id === userId);
        if (!userToDelete) {
            throw new Error('User not found');
        }

        if (currentUser.role === 'Administrator') {
            if (userToDelete.opd !== currentUser.opd) {
                 return { success: false, message: 'Anda hanya dapat menghapus pengguna dari OPD Anda sendiri.' };
            }
            if (userToDelete.role !== 'Operator') {
                 return { success: false, message: 'Anda hanya dapat menghapus pengguna dengan peran Operator.' };
            }
        }
        
        await deleteUserFromDb(userId);

        await logActivity('DELETE_USER', `Menghapus pengguna ${userToDelete.name} (ID: ${userId}).`, currentUser.role);
        
        revalidatePath('/users');
        revalidatePath('/super-admin/users');
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
        await logActivity('USER_LOGIN', `Pengguna masuk sebagai ${role}.`, role);
        revalidatePath('/audit-trail');
    } catch (error) {
        console.error('Error logging user login:', error);
    }
}

export async function userLogout(role: User['role']) {
    try {
        await logActivity('USER_LOGOUT', `Pengguna keluar dari sesi ${role}.`, role);
        revalidatePath('/audit-trail');
    } catch (error) {
        console.error('Error logging user logout:', error);
    }
}

export async function updateUserStatus(userId: string, currentUserId: string, status: User['status']): Promise<{ success: boolean; message: string }> {
    const users = await getUsers();
    const currentUser = users.find(u => u.id === currentUserId);

    if (!currentUser) {
        return { success: false, message: 'Tidak dapat mengidentifikasi pengguna saat ini. Aksi dibatalkan.' };
    }

    const allowedRoles: User['role'][] = ['Super Admin', 'Administrator'];
    if (!allowedRoles.includes(currentUser.role)) {
        return { success: false, message: 'Anda tidak memiliki izin untuk melakukan tindakan ini.' };
    }
    
    try {
        const userToUpdate = users.find(u => u.id === userId);
        if (!userToUpdate) {
            throw new Error('User not found');
        }
        
        if (currentUser.role === 'Administrator') {
            if (userToUpdate.opd !== currentUser.opd) {
                return { success: false, message: 'Anda hanya dapat mengubah status pengguna di OPD Anda sendiri.' };
            }
            if (userToUpdate.role !== 'Operator') {
                return { success: false, message: 'Anda hanya dapat mengubah status pengguna dengan peran Operator.' };
            }
        }
        
        await updateUserStatusInDb(userId, { status });
        const actionText = status === 'active' ? 'mengaktifkan' : 'menonaktifkan';
        await logActivity('UPDATE_USER_STATUS', `Berhasil ${actionText} pengguna ${userToUpdate.name} (ID: ${userId}).`, currentUser.role);
        
        revalidatePath('/users');
        revalidatePath('/super-admin/users');
        revalidatePath('/audit-trail');

        return { success: true, message: `Status pengguna ${userToUpdate.name} berhasil diperbarui.` };
    } catch (error) {
        console.error('Error updating user status:', error);
        return { success: false, message: 'Terjadi kesalahan saat memperbarui status pengguna.' };
    }
}
