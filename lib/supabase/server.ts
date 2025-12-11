/**
 * Supabase Client for Server Environment
 * 
 * This file initializes the Supabase client for use in server-side components,
 * API routes, and server actions. It uses cookies to persist the user session.
 */

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Creates a Supabase client for server environment
 * Uses cookies for session management
 * Handles both reading and writing cookies
 * 
 * @returns Supabase client instance
 */
export async function createClient() {
  // Get environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Validate environment variables
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase environment variables. Please check your .env.local file.'
    )
  }

  const cookieStore = await cookies()

  // Create and return the server client with cookie handlers
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      // Get a specific cookie by name
      getAll() {
        return cookieStore.getAll()
      },
      // Set a cookie
      setAll(cookiesToSet: { name: string; value: string; options: any }[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  })
}
