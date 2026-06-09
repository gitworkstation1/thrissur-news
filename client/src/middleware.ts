// client/src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Get the secure cookie
  const token = request.cookies.get('admin_token')?.value;

  // 1. If trying to access the dashboard WITHOUT a token, kick to login
  if (path.startsWith('/dashboard') && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 2. If trying to access the login page WITH a token, skip to dashboard
  if (path === '/login' && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

// Only run this middleware on the dashboard and login routes
export const config = {
  matcher: ['/dashboard/:path*', '/login'],
};