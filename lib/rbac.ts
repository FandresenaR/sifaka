import { auth } from "@/lib/auth"
import type { UserRole } from "@prisma/client"

/**
 * Permissions system based on roles
 */
export enum Permission {
  // User management
  VIEW_USERS = "view_users",
  MANAGE_USERS = "manage_users",
  DELETE_USERS = "delete_users",
  
  // Content management
  VIEW_CONTENT = "view_content",
  CREATE_CONTENT = "create_content",
  EDIT_CONTENT = "edit_content",
  DELETE_CONTENT = "delete_content",
  PUBLISH_CONTENT = "publish_content",
  
  // Media management
  VIEW_MEDIA = "view_media",
  UPLOAD_MEDIA = "upload_media",
  DELETE_MEDIA = "delete_media",
  
  // Settings
  VIEW_SETTINGS = "view_settings",
  MANAGE_SETTINGS = "manage_settings",
  
  // AI
  USE_AI = "use_ai",
  MANAGE_AI_CONFIG = "manage_ai_config",
}

/**
 * Role permissions mapping
 */
const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  USER: [
    Permission.VIEW_CONTENT,
  ],
  ADMIN: [
    Permission.VIEW_USERS,
    Permission.VIEW_CONTENT,
    Permission.CREATE_CONTENT,
    Permission.EDIT_CONTENT,
    Permission.DELETE_CONTENT,
    Permission.PUBLISH_CONTENT,
    Permission.VIEW_MEDIA,
    Permission.UPLOAD_MEDIA,
    Permission.DELETE_MEDIA,
    Permission.VIEW_SETTINGS,
    Permission.USE_AI,
  ],
  SUPER_ADMIN: [
    // Super admin has all permissions
    ...Object.values(Permission),
  ],
}

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: UserRole | undefined, permission: Permission): boolean {
  if (!role) return false
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false
}

/**
 * Check if a role has any of the specified permissions
 */
export function hasAnyPermission(role: UserRole | undefined, permissions: Permission[]): boolean {
  if (!role) return false
  return permissions.some(permission => hasPermission(role, permission))
}

/**
 * Check if a role has all of the specified permissions
 */
export function hasAllPermissions(role: UserRole | undefined, permissions: Permission[]): boolean {
  if (!role) return false
  return permissions.every(permission => hasPermission(role, permission))
}

/**
 * Get current user from session
 * En mode BYPASS_AUTH, retourne un utilisateur mock SUPER_ADMIN
 */
export async function getCurrentUser() {
  // Mode développement : bypass avec utilisateur mock
  if (process.env.BYPASS_AUTH === 'true') {
    return {
      id: 'dev-user-123',
      email: 'dev@localhost',
      name: 'Dev User (Bypass)',
      role: 'SUPER_ADMIN' as UserRole,
      image: null,
    }
  }

  const session = await auth()
  return session?.user
}

/**
 * Require authentication - throw if not authenticated
 */
export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error("Authentication required")
  }
  return user
}

/**
 * Require specific permission - throw if user doesn't have it
 */
export async function requirePermission(permission: Permission) {
  const user = await requireAuth()
  if (!hasPermission(user.role, permission)) {
    throw new Error(`Permission denied: ${permission}`)
  }
  return user
}

/**
 * Require admin role
 */
export async function requireAdmin() {
  const user = await requireAuth()
  if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
    throw new Error("Admin access required")
  }
  return user
}

/**
 * Require super admin role
 */
export async function requireSuperAdmin() {
  const user = await requireAuth()
  if (user.role !== "SUPER_ADMIN") {
    throw new Error("Super admin access required")
  }
  return user
}

/**
 * Check if user is authenticated (boolean)
 */
export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser()
  return !!user
}

/**
 * Check if user is admin (boolean)
 */
export async function isAdmin(): Promise<boolean> {
  const user = await getCurrentUser()
  return user?.role === "ADMIN" || user?.role === "SUPER_ADMIN"
}

/**
 * Check if user is super admin (boolean)
 */
export async function isSuperAdmin(): Promise<boolean> {
  const user = await getCurrentUser()
  return user?.role === "SUPER_ADMIN"
}
