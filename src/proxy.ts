import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyAuthToken } from './lib/auth';

const PROTECTED_ROUTES = ['/dashboard', '/orders', '/profile'];
const ADMIN_ROUTES = ['/admin'];

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const authHeader = request.headers.get('Authorization');
  const cookieToken = request.cookies.get('accessToken')?.value;
  const token = (authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null) || cookieToken;

  // Check for protected routes
  const isProtectedRoute = PROTECTED_ROUTES.some(route => pathname.startsWith(route));
  const isAdminRoute = ADMIN_ROUTES.some(route => pathname.startsWith(route));

  if (isProtectedRoute || isAdminRoute) {
    if (!token) {
      if (pathname.startsWith('/api')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      return NextResponse.redirect(new URL(`/login?redirect=${pathname}`, request.url));
    }

    const payload = await verifyAuthToken(token);
    if (!payload) {
      if (pathname.startsWith('/api')) {
        return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
      }
      return NextResponse.redirect(new URL(`/login?redirect=${pathname}`, request.url));
    }

    if (isAdminRoute && payload.role !== 'admin') {
      if (pathname.startsWith('/api')) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/orders/:path*',
    '/profile/:path*',
    '/admin/:path*',
    '/api/admin/:path*',
  ],
};
