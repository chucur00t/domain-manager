import { ChangeUserStatusRequest, User, UserRole } from '@/backend/models/types';
import { createAuditLog } from '@/backend/services/audit.service';
import * as FirebaseService from '@/backend/services/firebase/services';

export async function getAllUsers() {
  try {
    const users = await FirebaseService.getUsers();
    return users;
  } catch (error) {
    console.error('Error getting all users:', error);
    throw error;
  }
}

export async function getUsersByOpd(opd: string) {
  try {
    const users = await FirebaseService.getUsersByOpd(opd);
    return users;
  } catch (error) {
    console.error('Error getting users by OPD:', error);
    throw error;
  }
}

export async function getUserById(id: string) {
  try {
    const user = await FirebaseService.getUserById(id);
    return user;
  } catch (error) {
    console.error('Error getting user by ID:', error);
    throw error;
  }
}

export async function createUser(data: {
  name: string;
  email: string;
  role: UserRole;
  opd?: string;
}) {
  try {
    const existingUser = await FirebaseService.getUserByEmail(data.email);
    if (existingUser) {
      return {
        success: false,
        message: `Email ${data.email} sudah digunakan.`,
      };
    }

    const newUser: Omit<User, 'id'> = {
      name: data.name,
      email: data.email,
      role: data.role,
      status: 'active',
      opd: data.role === 'Admin Perangkat Daerah' ? data.opd || undefined : undefined,
      nip: `NIP${Math.floor(Math.random() * 1000000)}`,
      whatsapp: '081234567890'
    };

    await FirebaseService.createUser(newUser);

    // Log the audit
    // For creating a new user, we'll use a system userId since the user doesn't exist yet
    await createAuditLog({
      action: 'create',
      resourceType: 'user',
      resourceId: data.email,
      description: `User ${data.name} (${data.email}) created with role ${data.role}`,
      userId: 'system'
    });

    return { success: true, message: `Pengguna ${data.name} berhasil ditambahkan.` };
  } catch (error) {
    console.error('Error adding user:', error);
    return {
      success: false,
      message: 'Terjadi kesalahan saat menambahkan pengguna.',
    };
  }
}

export async function updateUser(
  id: string, 
  data: {
    name: string;
    email: string;
    role: UserRole;
    opd?: string;
  }
) {
  try {
    const existingUser = await FirebaseService.getUserById(id);
    if (!existingUser) {
      return { success: false, message: 'Pengguna tidak ditemukan.' };
    }

    // Check if email is being changed and if new email is already in use
    if (data.email !== existingUser.email) {
      const emailInUse = await FirebaseService.getUserByEmail(data.email);
      if (emailInUse) {
        return {
          success: false,
          message: `Email ${data.email} sudah digunakan.`,
        };
      }
    }

    const updatedData: Partial<User> = {
      name: data.name,
      email: data.email,
      role: data.role,
      opd: data.role === 'Admin Perangkat Daerah' ? data.opd || undefined : undefined,
    };

    await FirebaseService.updateUser(id, updatedData);

    // Log the audit
    await createAuditLog({
      action: 'update',
      resourceType: 'user',
      resourceId: id,
      description: `User ${data.name} (${data.email}) updated`,
      userId: id
    });

    return { success: true, message: `Pengguna ${data.name} berhasil diperbarui.` };
  } catch (error) {
    console.error('Error updating user:', error);
    return {
      success: false,
      message: 'Terjadi kesalahan saat memperbarui pengguna.',
    };
  }
}

export async function changeUserStatus(id: string, request: ChangeUserStatusRequest) {
  try {
    const user = await FirebaseService.getUserById(id);
    if (!user) {
      return { success: false, message: 'Pengguna tidak ditemukan.' };
    }

    // Update user status
    await FirebaseService.updateUser(id, { status: request.status });

    // Log the audit
    await createAuditLog({
      action: 'update',
      resourceType: 'user',
      resourceId: id,
      description: `User ${user.name} status changed to ${request.status}`,
      userId: id
    });

    return {
      success: true,
      message: `Status pengguna ${user.name} berhasil diubah menjadi ${request.status}.`,
    };
  } catch (error) {
    console.error('Error changing user status:', error);
    return {
      success: false,
      message: 'Terjadi kesalahan saat mengubah status pengguna.',
    };
  }
}

export async function deleteUser(id: string) {
  try {
    const user = await FirebaseService.getUserById(id);
    if (!user) {
      return { success: false, message: 'Pengguna tidak ditemukan.' };
    }

    await FirebaseService.deleteUser(id);

    // Log the audit
    await createAuditLog({
      action: 'delete',
      resourceType: 'user',
      resourceId: id,
      description: `User ${user.name} (${user.email}) deleted`,
      userId: 'system' // Use system ID since the user is being deleted
    });

    return {
      success: true,
      message: `Pengguna ${user.name} berhasil dihapus.`,
    };
  } catch (error) {
    console.error('Error deleting user:', error);
    return {
      success: false,
      message: 'Terjadi kesalahan saat menghapus pengguna.',
    };
  }
}

export async function getUserByEmail(email: string) {
  try {
    const user = await FirebaseService.getUserByEmail(email);
    return user;
  } catch (error) {
    console.error('Error getting user by email:', error);
    throw error;
  }
}

export async function userLogin(email: string, password: string) {
  try {
    // Mock login - in a real app this would authenticate with Firebase Auth
    const user = await FirebaseService.getUserByEmail(email);
    if (user && user.status === 'active') {
      // Log the audit
      await createAuditLog({
        action: 'login',
        resourceType: 'user',
        resourceId: user.id,
        description: `User ${user.name} logged in`,
        userId: user.id
      });
      return { success: true, user };
    }
    return { success: false, message: 'Invalid credentials or inactive user.' };
  } catch (error) {
    console.error('Error during login:', error);
    return { success: false, message: 'Login failed.' };
  }
}

export async function userLogout(userId: string) {
  try {
    const user = await FirebaseService.getUserById(userId);
    if (user) {
      // Log the audit
      await createAuditLog({
        action: 'logout',
        resourceType: 'user',
        resourceId: userId,
        description: `User ${user.name} logged out`,
        userId: userId
      });
    }
    return { success: true };
  } catch (error) {
    console.error('Error during logout:', error);
    return { success: false, message: 'Logout failed.' };
  }
}

// Add missing functions that are referenced but not exported
export const addUser = createUser;

export async function updateUserStatus(id: string, status: 'active' | 'inactive') {
  return changeUserStatus(id, { status });
}
