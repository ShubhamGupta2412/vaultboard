/**
 * Logout Route Handler
 * 
 * Server-side route handler for logging out users.
 * Clears the Supabase session and redirects to login page.
 */

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * POST handler for logout
 * Clears the user session and redirects to login
 */
export async function POST() {
  try {
    const supabase = await createClient()

    // Sign out the user
    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error('Logout error:', error)
      return NextResponse.json(
        { error: 'Failed to sign out' },
        { status: 500 }
      )
    }

    // Redirect to login page
    return NextResponse.redirect(new URL('/auth/login', process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'))
  } catch (error) {
    console.error('Logout exception:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

/**
 * GET handler for logout (for direct URL access)
 * Clears the user session and redirects to login
 */
export async function GET() {
  try {
    const supabase = await createClient()

    // Sign out the user
    await supabase.auth.signOut()

    // Redirect to login page
    const redirectUrl = new URL('/auth/login', process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000')
    return NextResponse.redirect(redirectUrl)
  } catch (error) {
    console.error('Logout exception:', error)
    const redirectUrl = new URL('/auth/login', process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000')
    return NextResponse.redirect(redirectUrl)
  }
}
