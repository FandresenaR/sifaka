import { auth } from './auth';

export enum Permission {
  // Gestion des utilisateurs
  VIEW_USERS = 'VIEW_USERS',
  MANAGE_USERS = 'MANAGE_USERS',
  MANAGE_ROLES = 'MANAGE_ROLES',
  
  // Gestion du blog
  VIEW_POSTS = 'VIEW_POSTS',
  CREATE_POST = 'CREATE_POST',
  EDIT_POST = 'EDIT_POST',
  DELETE_POST = 'DELETE_POST',
  PUBLISH_POST = 'PUBLISH_POST',
  
  // Gestion des produits
  VIEW_PRODUCTS = 'VIEW_PRODUCTS',
  CREATE_PRODUCT = 'CREATE_PRODUCT',
  EDIT_PRODUCT = 'EDIT_PRODUCT',
  DELETE_PRODUCT = 'DELETE_PRODUCT',
  
  // Administration système
  SYSTEM_ADMIN = 'SYSTEM_ADMIN',
}

// Définition des permissions par rôle
const rolePermissions: Record<string, Permission[]> = {
  USER: [],
  
  EDITOR: [
    Permission.VIEW_POSTS,
    Permission.CREATE_POST,
    Permission.EDIT_POST,
  ],
  
  ADMIN: [
    Permission.VIEW_POSTS,
    Permission.CREATE_POST,
    Permission.EDIT_POST,
    Permission.DELETE_POST,
    Permission.PUBLISH_POST,
    Permission.VIEW_PRODUCTS,
    Permission.CREATE_PRODUCT,
    Permission.EDIT_PRODUCT,
    Permission.DELETE_PRODUCT,
  ],
  
  SUPER_ADMIN: [
    // Le super admin a toutes les permissions
    ...Object.values(Permission),
  ],
};

/**
 * Vérifie si un rôle a une permission spécifique
 */
export function hasPermission(role: string, permission: Permission): boolean {
  const permissions = rolePermissions[role] || [];
  return permissions.includes(permission);
}

/**
 * Vérifie si l'utilisateur actuellement connecté a une permission
 */
export async function checkPermission(permission: Permission): Promise<boolean> {
  const session = await auth();
  
  if (!session?.user?.role) {
    return false;
  }
  
  return hasPermission(session.user.role, permission);
}

/**
 * Vérifie si l'utilisateur est un super administrateur
 */
export async function isSuperAdmin(): Promise<boolean> {
  const session = await auth();
  return session?.user?.role === 'SUPER_ADMIN';
}

/**
 * Vérifie si l'utilisateur est au moins un admin (ADMIN ou SUPER_ADMIN)
 */
export async function isAdmin(): Promise<boolean> {
  const session = await auth();
  return session?.user?.role === 'ADMIN' || session?.user?.role === 'SUPER_ADMIN';
}

/**
 * Retourne l'utilisateur actuel avec sa session
 */
export async function getCurrentUser() {
  const session = await auth();
  return session?.user || null;
}

/**
 * Vérifie les permissions et lance une erreur si non autorisé
 */
export async function requirePermission(permission: Permission) {
  const hasAccess = await checkPermission(permission);
  
  if (!hasAccess) {
    throw new Error('Permission denied');
  }
}

/**
 * Vérifie si l'utilisateur est super admin et lance une erreur si non autorisé
 */
export async function requireSuperAdmin() {
  const isSuperAdm = await isSuperAdmin();
  
  if (!isSuperAdm) {
    throw new Error('Super admin access required');
  }
}
