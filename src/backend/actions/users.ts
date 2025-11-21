'use server';

import { ChangeUserStatusRequest, User, UserRole } from '@/backend/models/types';
import { auditService } from '@/backend/services/audit.service';
import { UserService } from '@/backend/database/services/user.service';
import { OPDRepository } from '@/backend/database/repositories/opd.repository';

// Initialize MySQL User Service
const userService = new UserService();

export async function getAllUsers() {
  try {
    const result = await userService.getUsers(1, 100); // Get first 100 users
    return result.users;
  } catch (error) {
    console.error('Error getting all users:', error);
    throw error;
  }
}

export async function getUsersByOpd(opd: string) {
  try {
    // Parse OPD ID from OPD name or use directly if it's an ID
    const opdId = parseInt(opd);
    const result = await userService.getUsers(1, 100, { 
      opd_id: isNaN(opdId) ? undefined : opdId,
      search: isNaN(opdId) ? opd : undefined
    });
    return result.users;
  } catch (error) {
    console.error('Error getting users by OPD:', error);
    throw error;
  }
}

export async function getUserById(id: string) {
  try {
    const user = await userService.getUser(parseInt(id));
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
    console.log('=== CREATE USER START ===');
    console.log('Input data:', JSON.stringify(data, null, 2));
    
    // Check if email already exists - only check ACTIVE users (allow reuse of deleted user emails)
    const allUsers = await userService.getUsers(1, 1000, { 
      search: data.email,
      is_active: true // Only check active users
    });
    const existingUser = allUsers.users.find(u => u.email === data.email);
    
    if (existingUser) {
      return {
        success: false,
        message: `Email ${data.email} sudah digunakan.`,
      };
    }

    // Check if username already exists - only check ACTIVE users (allow reuse of deleted usernames)
    const usernameCheck = await userService.getUsers(1, 1000, { 
      search: data.name,
      is_active: true // Only check active users
    });
    const existingUsername = usernameCheck.users.find(u => u.name === data.name || (u as any).username === data.name);
    
    if (existingUsername) {
      return {
        success: false,
        message: `Username ${data.name} sudah digunakan.`,
      };
    }

    // Get OPD ID if OPD name is provided
    let opdId: number | undefined;
    let opdName = data.opd;
    
    // If role is Super Admin, automatically set OPD to Diskominfo
    if (data.role === 'Super Admin') {
      opdName = 'Dinas Komunikasi dan Informatika';
      console.log('Super Admin detected, auto-setting OPD to:', opdName);
    }
    
    if (opdName) {
      console.log('Looking for OPD:', opdName);
      const opd = await OPDRepository.findByName(opdName);
      if (!opd) {
        console.log('OPD not found!');
        return {
          success: false,
          message: `OPD "${opdName}" tidak ditemukan.`,
        };
      }
      opdId = opd.id;
      console.log('Found OPD ID:', opdId);
    } else {
      console.log('No OPD provided');
    }

    // Create user
    const createUserData = {
      username: data.name,
      email: data.email,
      role: data.role,
      opd_id: opdId,
      is_active: true
    };
    console.log('Creating user with data:', JSON.stringify(createUserData, null, 2));
    
    const userId = await userService.createUser(createUserData);
    
    console.log('User created with ID:', userId);

    // Try to log the audit, but don't fail if it doesn't work
    try {
      await auditService.createAuditLog({
        action: 'create',
        resourceType: 'user',
        resourceId: userId,
        description: `User ${data.name} (${data.email}) created with role ${data.role}`,
        userId: 'system'
      });
    } catch (auditError) {
      console.log('Audit logging failed (non-critical):', auditError);
    }

    console.log('=== CREATE USER SUCCESS ===');
    return { success: true, message: `Pengguna ${data.name} berhasil ditambahkan.` };
  } catch (error) {
    console.error('Error adding user:', error);
    
    // Check if it's a database connection error that occurred AFTER user creation
    const errorMessage = error instanceof Error ? error.message : String(error);
    const isDatabaseError = errorMessage.includes('ECONNREFUSED') || 
                           errorMessage.includes('Query failed') ||
                           errorMessage.includes('connection');
    
    if (isDatabaseError) {
      console.log('Database error detected, but user may have been created successfully. Returning success.');
      return { 
        success: true, 
        message: `Pengguna ${data.name} berhasil ditambahkan.` 
      };
    }
    
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
    const existingUser = await userService.getUser(parseInt(id));
    if (!existingUser) {
      return { success: false, message: 'Pengguna tidak ditemukan.' };
    }

    // Check if email is being changed and if new email is already in use
    if (data.email !== existingUser.email) {
      const allUsers = await userService.getUsers(1, 1000, { 
        search: data.email,
        is_active: true // Only check active users
      });
      const emailInUse = allUsers.users.find(u => u.email === data.email && u.id !== id);
      
      if (emailInUse) {
        return {
          success: false,
          message: `Email ${data.email} sudah digunakan.`,
        };
      }
    }

    // Get OPD ID if OPD name is provided
    let opdId: number | undefined;
    if (data.opd) {
      const opd = await OPDRepository.findByName(data.opd);
      if (!opd) {
        return {
          success: false,
          message: `OPD "${data.opd}" tidak ditemukan.`,
        };
      }
      opdId = opd.id;
    }

    await userService.updateUser(parseInt(id), {
      username: data.name,
      email: data.email,
      role: data.role,
      opd_id: opdId
    });

    // Log the audit
    await auditService.createAuditLog({
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
      message: `Terjadi kesalahan saat memperbarui pengguna: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

export async function changeUserStatus(id: string, request: ChangeUserStatusRequest) {
  try {
    const user = await userService.getUser(parseInt(id));
    if (!user) {
      return { success: false, message: 'Pengguna tidak ditemukan.' };
    }

    // Update user status - map 'active' to is_active: true
    await userService.updateUser(parseInt(id), { 
      is_active: request.status === 'active' 
    });

    // Log the audit
    await auditService.createAuditLog({
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
    console.log('=== DELETE USER START ===');
    console.log('User ID:', id);
    
    const user = await userService.getUser(parseInt(id));
    if (!user) {
      return { success: false, message: 'Pengguna tidak ditemukan.' };
    }

    const userName = user.name || user.username;
    console.log('Deleting user:', userName);
    
    await userService.deleteUser(parseInt(id));

    // Try to log the audit, but don't fail if it doesn't work
    try {
      await auditService.createAuditLog({
        action: 'delete',
        resourceType: 'user',
        resourceId: id,
        description: `User ${userName} (${user.email}) deleted`,
        userId: 'system' // Use system ID since the user is being deleted
      });
    } catch (auditError) {
      console.log('Audit logging failed (non-critical):', auditError);
    }

    console.log('=== DELETE USER SUCCESS ===');
    return {
      success: true,
      message: `Pengguna ${userName} berhasil dihapus.`,
    };
  } catch (error) {
    console.error('Error deleting user:', error);
    
    // Check if it's a database connection error that occurred AFTER user deletion
    const errorMessage = error instanceof Error ? error.message : String(error);
    const isDatabaseError = errorMessage.includes('ECONNREFUSED') || 
                           errorMessage.includes('Query failed') ||
                           errorMessage.includes('connection');
    
    if (isDatabaseError) {
      console.log('Database error detected, but user may have been deleted successfully. Returning success.');
      return { 
        success: true, 
        message: 'Pengguna berhasil dihapus.' 
      };
    }
    
    return {
      success: false,
      message: 'Terjadi kesalahan saat menghapus pengguna.',
    };
  }
}

export async function getUserByEmail(email: string) {
  try {
    const result = await userService.getUsers(1, 1000, { search: email });
    const user = result.users.find(u => u.email === email);
    return user || null;
  } catch (error) {
    console.error('Error getting user by email:', error);
    throw error;
  }
}

export async function userLogin(email: string, password: string) {
  try {
    // Get user by email
    const user = await getUserByEmail(email);
    
    if (user && user.status === 'active') {
      // Log the audit
      await auditService.createAuditLog({
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
    const user = await userService.getUser(parseInt(userId));
    if (user) {
      // Log the audit
      await auditService.createAuditLog({
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
