/**
 * Logout Route Handler
 * 
 * Server-side route handler for logging out users.
 * Clears the Supabase session and redirects to login page.
 */

import { createClient } from '@/lib/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'

function redirectToLogin(request: NextRequest) {
  return NextResponse.redirect(new URL('/auth/login', request.url))
}

/**
 * POST handler for logout
 * Clears the user session and redirects to login
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Sign out the user
    try {
      const { error } = await supabase.auth.signOut()
      if (error) console.error('Logout error:', error)
    } catch (err) {
      console.error('Logout signOut exception:', err)
      // Proceed to redirect even if signOut fails to avoid 500 on user logout
    }

    // Redirect to login page
    return redirectToLogin(request)
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
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Sign out the user
    await supabase.auth.signOut()

    // Redirect to login page
    return redirectToLogin(request)
  } catch (error) {
    console.error('Logout exception:', error)
    return redirectToLogin(request)
  }
}
