import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const publicRoutes = ['/login', '/_next', '/favicon.ico'];

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    publicRoutes.some((p) => pathname.startsWith(p)) ||
    pathname.match(/\.(png|jpg|jpeg|svg|css|js)$/)
  ) {
    const token = request.cookies.get('treasuryos_access_token')?.value;
    if (pathname === '/login' && token) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  const token = request.cookies.get('treasuryos_access_token')?.value;

  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
