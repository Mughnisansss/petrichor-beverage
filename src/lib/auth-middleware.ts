/**
 * Authentication and Authorization Middleware
 * Protects routes and checks permissions
 */

import { getServerSession } from 'next-auth';
import { authOptions } from './auth-options';
import { redirect } from 'next/navigation';
import { PERMISSIONS, hasPermission, type PermissionKey } from './auth-types';

export async function requireAuth() {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    redirect('/auth/login');
  }
  
  return session;
}

export async function requirePermission(permission: PermissionKey) {
  const session = await requireAuth();
  
  const userPermissions = await getUserPermissions(session.user.id);
  const requiredPermission = PERMISSIONS[permission];
  
  if (!hasPermission(userPermissions, requiredPermission)) {
    redirect('/auth/unauthorized');
  }
  
  return session;
}

export async function requireRole(role: string) {
  const session = await requireAuth();
  
  if (session.user.role !== role) {
    redirect('/auth/unauthorized');
  }
  
  return session;
}

export async function requireAnyRole(roles: string[]) {
  const session = await requireAuth();
  
  if (!roles.includes(session.user.role)) {
    redirect('/auth/unauthorized');
  }
  
  return session;
}

export async function getUserPermissions(userId: string) {
  const prisma = (await import('./prisma')).default;
  
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { role: true },
  });
  
  if (!user) {
    return [];
  }
  
  return user.role.permissions as any[];
}

export async function canUserPerformAction(userId: string, permission: PermissionKey): Promise<boolean> {
  try {
    const userPermissions = await getUserPermissions(userId);
    const requiredPermission = PERMISSIONS[permission];
    
    return hasPermission(userPermissions, requiredPermission);
  } catch (error) {
    console.error('Error checking user permissions:', error);
    return false;
  }
}

// Optional authentication - doesn't redirect if not authenticated
export async function optionalAuth() {
  const session = await getServerSession(authOptions);
  return session;
}