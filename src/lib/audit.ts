
import type { AuditLog, User } from './types';
import { createAuditLog, getUsers } from './firebase/services';

export async function logActivity(action: string, details: string, currentUserRole: User['role']) {
  const users = await getUsers();
  const currentUser = users.find(user => user.role === currentUserRole);
  
  if (!currentUser) {
    console.error("Could not log activity: User not found for role", currentUserRole);
    return;
  }

  const newLog: Omit<AuditLog, 'id'> = {
    user: currentUser.name,
    userRole: currentUser.role,
    action,
    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
    details,
  };

  try {
    await createAuditLog(newLog);
  } catch (error) {
      console.error("Failed to write audit log to database:", error);
  }
}
