/**
 * Authentication utilities for getting current user context
 * 
 * NOTE: This is a simplified implementation for development.
 * For production, implement proper session management with:
 * - NextAuth.js or similar authentication library
 * - Secure session storage (Redis/MySQL)
 * - JWT tokens with proper validation
 * - CSRF protection
 */

import { cookies } from 'next/headers';
import type { User } from '@/backend/models/types';

/**
 * Get current authenticated user from session
 * 
 * TODO: Replace with proper session management
 * Current implementation uses query params which is NOT secure for production
 * 
 * @returns User object or null if not authenticated
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    // TODO: Implement proper session-based authentication
    // This is a placeholder that should be replaced with:
    // 1. Read session from secure cookie
    // 2. Validate session token
    // 3. Fetch user from database
    // 4. Return user object
    
    const cookieStore = await cookies();
    const userCookie = cookieStore.get('user');
    
    if (!userCookie) {
      return null;
    }
    
    // Parse user from cookie (TEMPORARY - not secure)
    const user = JSON.parse(userCookie.value) as User;
    return user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

/**
 * Get current user ID from session
 * 
 * @returns User ID as number or null if not authenticated
 */
export async function getCurrentUserId(): Promise<number | null> {
  const user = await getCurrentUser();
  if (!user || !user.id) {
    return null;
  }
  
  // Convert string ID to number if needed
  return typeof user.id === 'string' ? parseInt(user.id, 10) : user.id;
}

/**
 * Get current user role from session
 * 
 * @returns User role or null if not authenticated
 */
export async function getCurrentUserRole(): Promise<User['role'] | null> {
  const user = await getCurrentUser();
  return user?.role || null;
}

/**
 * Check if user is authenticated
 * 
 * @returns true if user is authenticated, false otherwise
 */
export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser();
  return user !== null;
}

/**
 * Check if user has specific role
 * 
 * @param allowedRoles - Array of roles to check against
 * @returns true if user has one of the allowed roles
 */
export async function hasRole(allowedRoles: User['role'][]): Promise<boolean> {
  const userRole = await getCurrentUserRole();
  if (!userRole) return false;
  
  return allowedRoles.includes(userRole);
}

/**
 * Require authentication - throws error if not authenticated
 * Use this in Server Actions that require authentication
 * 
 * @returns Current user object
 * @throws Error if user is not authenticated
 */
export async function requireAuth(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Authentication required');
  }
  return user;
}

/**
 * Require specific role - throws error if user doesn't have required role
 * 
 * @param allowedRoles - Array of roles that are allowed
 * @returns Current user object
 * @throws Error if user doesn't have required role
 */
export async function requireRole(allowedRoles: User['role'][]): Promise<User> {
  const user = await requireAuth();
  
  if (!allowedRoles.includes(user.role)) {
    throw new Error(`Access denied. Required role: ${allowedRoles.join(' or ')}`);
  }
  
  return user;
}
