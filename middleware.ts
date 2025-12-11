/**
 * Middleware for Route Protection
 * 
 * This middleware handles authentication checks for protected routes.
 * It redirects unauthenticated users to the login page and allows
 * public routes to be accessed without authentication.
 */

import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Define public routes that don't require authentication
 */
const publicRoutes = [
  '/auth/login',
  '/auth/signup',
  '/auth/callback',
]

/**
 * Define protected routes that require authentication
 */
const protectedRoutes = [
  '/dashboard',
  '/entries',
  '/api',
]

/**
 * Check if a path matches any of the given route patterns
 */
function matchesRoute(path: string, routes: string[]): boolean {
  return routes.some(route => {
    if (route.endsWith('/*')) {
      return path.startsWith(route.slice(0, -2))
    }
    return path === route || path.startsWith(route + '/')
  })
}

/**
 * Middleware function to handle authentication
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Create a response object that we can modify
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Create Supabase client with cookie handling
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options: any }[]) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Get the current user session
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Check if the current path is a public route
  const isPublicRoute = matchesRoute(pathname, publicRoutes)
  
  // Check if the current path is a protected route
  const isProtectedRoute = matchesRoute(pathname, protectedRoutes)

  // Allow public routes without authentication
  if (isPublicRoute) {
    // If user is already logged in and trying to access login/signup, redirect to dashboard
    if (user && (pathname === '/auth/login' || pathname === '/auth/signup')) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    return response
  }

  // For protected routes, check authentication
  if (isProtectedRoute) {
    if (!user) {
      // User is not authenticated, redirect to login
      const redirectUrl = new URL('/auth/login', request.url)
      // Add the original URL as a redirect parameter
      redirectUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(redirectUrl)
    }
    
    // User is authenticated, allow access
    return response
  }

  // For the root path, redirect based on authentication status
  if (pathname === '/') {
    if (user) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    } else {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }
  }

  // For all other routes, allow access
  return response
}

/**
 * Configure which routes this middleware should run on
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
