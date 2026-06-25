import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './lib/auth';

const PROTECTED_PREFIXES = ['/dashboard', '/me', '/deposit', '/swap', '/smart', '/withdraw'];
const AUTH_ROUTES = ['/login', '/login/verify'];
const ADMIN_PREFIX = '/admin';
const ADMIN_LOGIN = '/admin/login';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Read session cookie
  const sessionCookie = request.cookies.get('session');
  const token = sessionCookie?.value;

  let session = null;
  if (token) {
    session = await verifyToken(token);
  }

  const adminToken = request.cookies.get('admin_session')?.value;
  const adminSession = adminToken ? await verifyToken(adminToken) : null;
  const isAdminSession = adminSession?.role === 'admin' && Boolean(adminSession.adminId);

  // Check if pathname starts with any protected prefix
  const isProtected = PROTECTED_PREFIXES.some(prefix => 
    pathname === prefix || pathname.startsWith(prefix + '/')
  );

  // Check if pathname is an auth route
  const isAuthRoute = AUTH_ROUTES.some(route => 
    pathname === route
  );

  if (isProtected && !session) {
    // Redirect to login if trying to access secure pages without active session
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  if ((pathname === ADMIN_PREFIX || pathname.startsWith(`${ADMIN_PREFIX}/`)) && pathname !== ADMIN_LOGIN && !isAdminSession) {
    const loginUrl = new URL(ADMIN_LOGIN, request.url);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname === ADMIN_LOGIN && isAdminSession) {
    const adminUrl = new URL('/admin', request.url);
    return NextResponse.redirect(adminUrl);
  }

  if (isAuthRoute && session) {
    // Redirect to dashboard if logged in and trying to access auth pages
    const dashboardUrl = new URL('/dashboard', request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

// Config to specify where proxy should run
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - assets (public assets)
     * - favicon.ico (favicon file)
     * - hero_banner.png, etc.
     */
    '/((?!api|_next/static|_next/image|assets|favicon.ico|hero_banner.png).*)',
  ],
};
