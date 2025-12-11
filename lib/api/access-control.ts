/**
 * Access Control API Functions
 * 
 * Role-based permission checking for knowledge entries
 */

import { createClient } from '@/lib/supabase/client'
import { getUserRole } from './auth-server'

/**
 * Permission types
 */
export type Permission = 'read' | 'read_write'

/**
 * User roles
 */
export type UserRole = 'admin' | 'manager' | 'member' | 'viewer'

/**
 * Entry classification levels
 */
export type Classification = 'public' | 'internal' | 'confidential' | 'restricted'

/**
 * Access control entry interface
 */
export interface AccessControl {
  id: string
  entry_id: string
  allowed_role: UserRole
  permission: Permission
}

/**
 * Permission matrix: defines what each role can do by default
 */
const PERMISSION_MATRIX: Record<UserRole, { canCreate: boolean; canEdit: boolean; canDelete: boolean; canViewSensitive: boolean }> = {
  admin: { canCreate: true, canEdit: true, canDelete: true, canViewSensitive: true },
  manager: { canCreate: true, canEdit: true, canDelete: false, canViewSensitive: true },
  member: { canCreate: true, canEdit: false, canDelete: false, canViewSensitive: false },
  viewer: { canCreate: false, canEdit: false, canDelete: false, canViewSensitive: false },
}

/**
 * Classification access matrix: what classifications each role can access
 */
const CLASSIFICATION_ACCESS: Record<UserRole, Classification[]> = {
  admin: ['public', 'internal', 'confidential', 'restricted'],
  manager: ['public', 'internal', 'confidential'],
  member: ['public', 'internal'],
  viewer: ['public', 'internal'],
}

/**
 * Check if user has access to an entry based on role and classification
 * 
 * @param entryId - Entry ID
 * @param userId - User ID
 * @param action - Action to check (view, edit, delete)
 * @returns Boolean indicating if user has access
 */
export async function checkEntryAccess(
  entryId: string,
  userId: string,
  action: 'view' | 'edit' | 'delete'
): Promise<boolean> {
  try {
    const supabase = createClient()

    // Get user role
    const userRole = await getUserRole(userId)
    if (!userRole) return false

    // Get entry details
    const { data: entry, error } = await supabase
      .from('knowledge_entries')
      .select('user_id, classification, is_sensitive')
      .eq('id', entryId)
      .single()

    if (error || !entry) return false

    // Check if user is the creator (always has access to own entries)
    if (entry.user_id === userId) {
      if (action === 'delete') {
        // Only admin and creator can delete
        return userRole === 'admin' || entry.user_id === userId
      }
      return true
    }

    // Check classification access
    const allowedClassifications = CLASSIFICATION_ACCESS[userRole as UserRole]
    if (!allowedClassifications.includes(entry.classification as Classification)) {
      return false
    }

    // Check action permissions
    const permissions = PERMISSION_MATRIX[userRole as UserRole]
    
    if (action === 'view') {
      // Viewers can't see sensitive content
      if (entry.is_sensitive && !permissions.canViewSensitive) {
        return false
      }
      return true
    }
    
    if (action === 'edit') {
      return permissions.canEdit || entry.user_id === userId
    }
    
    if (action === 'delete') {
      return permissions.canDelete || (entry.user_id === userId && userRole !== 'viewer')
    }

    return false
  } catch (error) {
    console.error('Error checking entry access:', error)
    return false
  }
}

/**
 * Check if user can view an entry
 * 
 * @param entryId - Entry ID
 * @param userId - User ID
 * @returns Boolean indicating if user can view
 */
export async function canViewEntry(entryId: string, userId: string): Promise<boolean> {
  return checkEntryAccess(entryId, userId, 'view')
}

/**
 * Check if user can edit an entry
 * 
 * @param entryId - Entry ID
 * @param userId - User ID
 * @returns Boolean indicating if user can edit
 */
export async function canEditEntry(entryId: string, userId: string): Promise<boolean> {
  return checkEntryAccess(entryId, userId, 'edit')
}

/**
 * Check if user can delete an entry
 * 
 * @param entryId - Entry ID
 * @param userId - User ID
 * @returns Boolean indicating if user can delete
 */
export async function canDeleteEntry(entryId: string, userId: string): Promise<boolean> {
  return checkEntryAccess(entryId, userId, 'delete')
}

/**
 * Get all entries accessible to a user based on their role
 * 
 * @param userId - User ID
 * @param role - User role
 * @returns Array of entry IDs accessible to the user
 */
export async function getAccessibleEntries(userId: string, role: UserRole): Promise<string[]> {
  try {
    const supabase = createClient()

    // Get allowed classifications for this role
    const allowedClassifications = CLASSIFICATION_ACCESS[role]
    const permissions = PERMISSION_MATRIX[role]

    // Build query based on role permissions
    let query = supabase
      .from('knowledge_entries')
      .select('id, classification, is_sensitive, user_id')
      .in('classification', allowedClassifications)

    // If user can't view sensitive content, filter it out
    if (!permissions.canViewSensitive) {
      query = query.eq('is_sensitive', false)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error getting accessible entries:', error)
      return []
    }

    return data?.map(entry => entry.id) || []
  } catch (error) {
    console.error('Error in getAccessibleEntries:', error)
    return []
  }
}

/**
 * Get user's permission level for a specific entry
 * 
 * @param userId - User ID
 * @param entryId - Entry ID
 * @returns Permission level ('none', 'read', 'read_write')
 */
export async function getUserPermission(
  userId: string,
  entryId: string
): Promise<'none' | 'read' | 'read_write'> {
  try {
    const canView = await canViewEntry(entryId, userId)
    if (!canView) return 'none'

    const canEdit = await canEditEntry(entryId, userId)
    return canEdit ? 'read_write' : 'read'
  } catch (error) {
    console.error('Error getting user permission:', error)
    return 'none'
  }
}

/**
 * Get mock encryption status based on classification
 * 
 * @param classification - Entry classification level
 * @returns Encryption status object
 */
export function getMockEncryptionStatus(classification: Classification): {
  icon: string
  status: string
  color: string
} {
  switch (classification) {
    case 'restricted':
      return { icon: '🔒🔒', status: 'Ultra-Secure', color: 'red' }
    case 'confidential':
      return { icon: '🔒', status: 'Encrypted', color: 'orange' }
    case 'internal':
      return { icon: '🔓', status: 'Internal', color: 'yellow' }
    case 'public':
      return { icon: '🔓', status: 'Public', color: 'green' }
    default:
      return { icon: '🔓', status: 'Unencrypted', color: 'green' }
  }
}

/**
 * Mask sensitive content based on classification
 * Only shows partial content for confidential/restricted entries
 * 
 * @param content - Content to mask
 * @param classification - Entry classification
 * @returns Masked or original content
 */
export function maskSensitiveContent(content: string, classification: Classification): string {
  if (!['confidential', 'restricted'].includes(classification)) {
    return content
  }

  if (content.length <= 8) {
    return '****'
  }

  // Show first 4 and last 4 characters
  const firstPart = content.substring(0, 4)
  const lastPart = content.substring(content.length - 4)
  return `${firstPart}....${lastPart}`
}
