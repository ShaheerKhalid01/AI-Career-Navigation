import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Paths that don't require authentication
const publicPaths = [
  '/',
  '/login',
  '/signup',
  '/forgot-password',
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/forgot-password',
  '/api/auth/reset-password',
  '/api/health',
  '/api/jobs',
  '/api/roles',
  '/api/community',
];

// API routes that require authentication
const protectedApiPaths = [
  '/api/profile',
  '/api/resume',
  '/api/roadmap',
  '/api/interview',
  '/api/jobs/save',
  '/api/stats',
  '/api/contact',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const start = Date.now();

  // Log request
  console.log(`[${new Date().toISOString()}] ${request.method} ${pathname}`);

  // Check if path is public
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path));
  
  // Check if path is protected API
  const isProtectedApi = protectedApiPaths.some(path => pathname.startsWith(path));

  // Allow public paths
  if (isPublicPath) {
    const response = NextResponse.next();
    response.headers.set('X-Response-Time', `${Date.now() - start}ms`);
    return response;
  }

  // For protected API routes, check for auth token
  if (isProtectedApi) {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
      console.log(`[${new Date().toISOString()}] Unauthorized access attempt to ${pathname}`);
      return NextResponse.json(
        { error: 'Unauthorized - No token provided' },
        { status: 401 }
      );
    }

    try {
      // Verify token (basic validation, full verification happens in route handlers)
      const parts = token.split('.');
      if (parts.length !== 3) {
        console.log(`[${new Date().toISOString()}] Invalid token format for ${pathname}`);
        return NextResponse.json(
          { error: 'Unauthorized - Invalid token format' },
          { status: 401 }
        );
      }
    } catch {
      console.log(`[${new Date().toISOString()}] Token validation failed for ${pathname}`);
      return NextResponse.json(
        { error: 'Unauthorized - Token validation failed' },
        { status: 401 }
      );
    }
  }

  // For protected pages, redirect to login if not authenticated
  if (!isPublicPath && pathname.startsWith('/dashboard') || 
      pathname.startsWith('/profile') || 
      pathname.startsWith('/history') ||
      pathname.startsWith('/scores')) {
    const token = request.cookies.get('auth_token')?.value;
    
    if (!token) {
      console.log(`[${new Date().toISOString()}] Unauthenticated user redirected from ${pathname}`);
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  const response = NextResponse.next();
  response.headers.set('X-Response-Time', `${Date.now() - start}ms`);
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};
