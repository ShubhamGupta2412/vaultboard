/**
 * Authentication API Functions
 * 
 * This file contains all authentication-related functions for the VaultBoard platform.
 * It handles user signup, signin, signout, and role management with Supabase.
 */

import { createClient as createBrowserClient } from '@/lib/supabase/client'

/**
 * User role type definition
 */
export type UserRole = 'admin' | 'manager' | 'member' | 'viewer'

/**
 * Authentication response type
 */
export interface AuthResponse {
  success: boolean
  message: string
  userId?: string
  error?: string
}

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
 * Sign up a new user with email, password, role, and full name
 * 
 * @param email - User's email address
 * @param password - User's password (min 8 characters)
 * @param role - User's role (admin, manager, member, viewer)
 * @param fullName - User's full name (optional)
 * @returns AuthResponse with success status and message
 */
export async function signUp(
  email: string,
  password: string,
  role: UserRole = 'member',
  fullName?: string
): Promise<AuthResponse> {
  try {
    const supabase = createBrowserClient()

    // Validate inputs
    if (!email || !password) {
      return {
        success: false,
        message: 'Email and password are required',
        error: 'MISSING_FIELDS',
      }
    }

    if (password.length < 8) {
      return {
        success: false,
        message: 'Password must be at least 8 characters long',
        error: 'WEAK_PASSWORD',
      }
    }

    // Create user account with Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role, // Store role in user metadata
        },
      },
    })

    if (error) {
      return {
        success: false,
        message: error.message,
        error: error.name,
      }
    }

    if (!data.user) {
      return {
        success: false,
        message: 'Failed to create user account',
        error: 'NO_USER_DATA',
      }
    }

    // Insert user role into user_roles table
    const { data: insertedData, error: roleError } = await supabase
      .from('user_roles')
      .insert({
        user_id: data.user.id,
        email: email,
        full_name: fullName || null,
        role: role,
        created_at: new Date().toISOString(),
      })
      .select()

    if (roleError) {
      // Note: User is still created in auth, but role assignment failed
      // Log to window for debugging (client-side only)
      if (typeof window !== 'undefined') {
        // eslint-disable-next-line no-console
        console.error('Role insert error:', roleError, 'Attempted role:', role)
      }
      return {
        success: false,
        message: `Account created but role assignment failed: ${roleError.message}. Please contact support.`,
        userId: data.user.id,
        error: 'ROLE_INSERT_FAILED',
      }
    }

    // Log successful role insertion for debugging
    if (typeof window !== 'undefined' && insertedData) {
      // eslint-disable-next-line no-console
      console.log('Role inserted successfully:', insertedData)
    }

    return {
      success: true,
      message: 'Account created successfully! Please check your email to verify your account.',
      userId: data.user.id,
    }
  } catch (error) {
    return {
      success: false,
      message: 'An unexpected error occurred during signup',
      error: 'UNKNOWN_ERROR',
    }
  }
}

/**
 * Sign in an existing user with email and password
 * 
 * @param email - User's email address
 * @param password - User's password
 * @returns AuthResponse with success status and message
 */
export async function signIn(
  email: string,
  password: string
): Promise<AuthResponse> {
  try {
    const supabase = createBrowserClient()

    // Validate inputs
    if (!email || !password) {
      return {
        success: false,
        message: 'Email and password are required',
        error: 'MISSING_FIELDS',
      }
    }

    // Sign in with Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return {
        success: false,
        message: error.message,
        error: error.name,
      }
    }

    if (!data.user) {
      return {
        success: false,
        message: 'Authentication failed',
        error: 'NO_USER_DATA',
      }
    }

    return {
      success: true,
      message: 'Signed in successfully',
      userId: data.user.id,
    }
  } catch (error) {
    return {
      success: false,
      message: 'An unexpected error occurred during signin',
      error: 'UNKNOWN_ERROR',
    }
  }
}

/**
 * Sign out the current user
 * 
 * @returns AuthResponse with success status and message
 */
export async function signOut(): Promise<AuthResponse> {
  try {
    const supabase = createBrowserClient()

    const { error } = await supabase.auth.signOut()

    if (error) {
      return {
        success: false,
        message: error.message,
        error: error.name,
      }
    }

    return {
      success: true,
      message: 'Signed out successfully',
    }
  } catch (error) {
    return {
      success: false,
      message: 'An unexpected error occurred during signout',
      error: 'UNKNOWN_ERROR',
    }
  }
}

// Note: Server-side functions (getCurrentUser, getUserRole, getUserProfile, etc.)
// have been moved to lib/api/auth-server.ts
// Import from there when using in Server Components or Server Actions
