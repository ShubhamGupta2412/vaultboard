/**
 * Server-Side Authentication API Functions
 * 
 * This file contains server-only authentication functions that use the server Supabase client.
 * These functions should only be called from Server Components, Server Actions, or API Routes.
 */

import { createClient } from '@/lib/supabase/server'

/**
 * User role type definition
 */
export type UserRole = 'admin' | 'manager' | 'member' | 'viewer'

/**
 * User profile with role information
 */
export interface UserProfile {
  id: string
  email: string
  role: UserRole
  created_at: string
}

/**
 * Get the current authenticated user (server-side)
 * 
 * @returns User object or null if not authenticated
 */
export async function getCurrentUser() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error) {
      console.error('Error getting current user:', error)
      return null
    }

    return user
  } catch (error) {
    console.error('Get current user error:', error)
    return null
  }
}

/**
 * Get the role of a user by their user ID
 * 
 * @param userId - The user's unique ID
 * @returns UserRole or null if not found
 */
export async function getUserRole(userId: string): Promise<UserRole | null> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .single()

    if (error) {
      console.error('Error getting user role:', error)
      return null
    }

    return data?.role as UserRole || null
  } catch (error) {
    console.error('Get user role error:', error)
    return null
  }
}

/**
 * Get the complete user profile including role
 * 
 * @param userId - The user's unique ID
 * @returns UserProfile or null if not found
 */
export async function getUserProfile(
  userId: string
): Promise<UserProfile | null> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) {
      console.error('Error getting user profile:', error)
      return null
    }

    if (!data) {
      return null
    }

    return {
      id: data.user_id,
      email: data.email || '',
      role: data.role as UserRole,
      created_at: data.created_at || data.assigned_at || new Date().toISOString(),
    }
  } catch (error) {
    console.error('Get user profile error:', error)
    return null
  }
}

/**
 * Check if a user has a specific role
 * 
 * @param userId - The user's unique ID
 * @param requiredRole - The role to check for
 * @returns boolean indicating if user has the required role
 */
export async function hasRole(
  userId: string,
  requiredRole: UserRole
): Promise<boolean> {
  const userRole = await getUserRole(userId)
  return userRole === requiredRole
}

/**
 * Check if a user has admin privileges
 * 
 * @param userId - The user's unique ID
 * @returns boolean indicating if user is an admin
 */
export async function isAdmin(userId: string): Promise<boolean> {
  return hasRole(userId, 'admin')
}
