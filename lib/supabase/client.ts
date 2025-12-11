/**
 * Supabase Client for Browser Environment
 * 
 * This file initializes the Supabase client for use in client-side components.
 * It uses the browser's localStorage to persist the user session.
 */

import { createBrowserClient } from '@supabase/ssr'

/**
 * Creates a Supabase client for browser environment
 * Uses environment variables for configuration
 * Automatically handles session persistence via localStorage
 * 
 * @returns Supabase client instance
 */
export function createClient() {
  // Get environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Validate environment variables
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase environment variables. Please check your .env.local file.'
    )
  }

  // Create and return the browser client
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
