import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const publicRoutes = ['/login', '/_next', '/favicon.ico'];

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Ignore public static Next.js paths
  if (
    publicRoutes.some((p) => pathname.startsWith(p)) ||
    pathname.match(/\.(png|jpg|jpeg|svg|css|js)$/)
  ) {
    // If user is trying to hit login but already has token, redirect to dashboard.
    const token = request.cookies.get('treasuryos_access_token')?.value;
    if (pathname === '/login' && token) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  // All other routes require auth
  const token = request.cookies.get('treasuryos_access_token')?.value;

  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// Config to specify which paths this middleware runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
