/**
 * Authentication and Authorization Types
 */

export type UserRole = 'admin' | 'manager' | 'cashier' | 'staff';

export interface Permission {
  resource: string;
  action: string;
}

export interface Role {
  id: string;
  name: UserRole;
  description: string | null;
  permissions: Permission[];
}

export interface User {
  id: string;
  name: string | null;
  email: string;
  emailVerified: Date | null;
  image: string | null;
  roleId: string;
  role: Role;
  isActive: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface SessionUser {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: UserRole;
  permissions: Permission[];
}

// Permission definitions
export const PERMISSIONS = {
  // Products
  PRODUCTS_VIEW: 'products:view',
  PRODUCTS_CREATE: 'products:create',
  PRODUCTS_EDIT: 'products:edit',
  PRODUCTS_DELETE: 'products:delete',
  
  // Sales
  SALES_VIEW: 'sales:view',
  SALES_CREATE: 'sales:create',
  SALES_DELETE: 'sales:delete',
  SALES_REPORT: 'sales:report',
  
  // Inventory
  INVENTORY_VIEW: 'inventory:view',
  INVENTORY_MANAGE: 'inventory:manage',
  INVENTORY_DELETE: 'inventory:delete',
  
  // Analytics
  ANALYTICS_VIEW: 'analytics:view',
  ANALYTICS_EXPORT: 'analytics:export',
  
  // Users
  USERS_VIEW: 'users:view',
  USERS_CREATE: 'users:create',
  USERS_EDIT: 'users:edit',
  USERS_DELETE: 'users:delete',
  USERS_ASSIGN_ROLES: 'users:assign_roles',
  
  // Settings
  SETTINGS_VIEW: 'settings:view',
  SETTINGS_EDIT: 'settings:edit',
  SETTINGS_IMPORT_EXPORT: 'settings:import_export',
  
  // POS
  POS_VIEW: 'pos:view',
  POS_PROCESS: 'pos:process',
  POS_REFUND: 'pos:refund',
} as const;

export type PermissionKey = keyof typeof PERMISSIONS;

// Role permissions configuration
export const ROLE_PERMISSIONS: Record<UserRole, PermissionKey[]> = {
  admin: Object.keys(PERMISSIONS) as PermissionKey[],
  
  manager: [
    'PRODUCTS_VIEW',
    'PRODUCTS_CREATE',
    'PRODUCTS_EDIT',
    'SALES_VIEW',
    'SALES_CREATE',
    'SALES_REPORT',
    'INVENTORY_VIEW',
    'INVENTORY_MANAGE',
    'ANALYTICS_VIEW',
    'ANALYTICS_EXPORT',
    'USERS_VIEW',
    'SETTINGS_VIEW',
    'SETTINGS_EDIT',
    'POS_VIEW',
    'POS_PROCESS',
  ],
  
  cashier: [
    'PRODUCTS_VIEW',
    'SALES_VIEW',
    'SALES_CREATE',
    'INVENTORY_VIEW',
    'ANALYTICS_VIEW',
    'POS_VIEW',
    'POS_PROCESS',
  ],
  
  staff: [
    'PRODUCTS_VIEW',
    'INVENTORY_VIEW',
    'POS_VIEW',
  ],
};

export function hasPermission(userPermissions: Permission[], requiredPermission: string): boolean {
  return userPermissions.some(p => 
    `${p.resource}:${p.action}` === requiredPermission
  );
}

export function hasAnyPermission(userPermissions: Permission[], requiredPermissions: string[]): boolean {
  return requiredPermissions.some(requiredPermission => 
    hasPermission(userPermissions, requiredPermission)
  );
}

export function hasAllPermissions(userPermissions: Permission[], requiredPermissions: string[]): boolean {
  return requiredPermissions.every(requiredPermission => 
    hasPermission(userPermissions, requiredPermission)
  );
}