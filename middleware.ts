import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Authentication temporarily disabled for development
// Paths that require authentication
// const protectedPaths = ['/people', '/projects', '/assignments', '/notes']

export function middleware(request: NextRequest) {
  // Authentication disabled - allow all requests
  return NextResponse.next()
  
  /* COMMENTED OUT FOR DEVELOPMENT
  const { pathname } = request.nextUrl

  // Check if current path is protected
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path))

  if (isProtectedPath) {
    // Check for auth cookie
    const authCookie = request.cookies.get('admin-auth')

    if (!authCookie || authCookie.value !== 'authenticated') {
      // Redirect to login with return URL
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('returnUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
  */
}

// Configure which routes use this middleware
export const config = {
  matcher: [
    '/people/:path*',
    '/projects/:path*',
    '/assignments/:path*',
    '/notes/:path*',
  ],
}
