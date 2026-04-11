import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  ACCESS_TOKEN_COOKIE,
  REAUTH_SEARCH_PARAM,
  buildLoginUrl,
} from "./lib/auth";

const PUBLIC_EXACT_PATHS = new Set(["/login", "/favicon.ico"]);
const PUBLIC_PATH_PREFIXES = ["/_next"];

function isPublicPath(pathname: string) {
  return (
    PUBLIC_EXACT_PATHS.has(pathname) ||
    PUBLIC_PATH_PREFIXES.some((pathPrefix) =>
      pathname.startsWith(pathPrefix),
    ) ||
    /\.(png|jpg|jpeg|svg|css|js)$/.test(pathname)
  );
}

export default function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const token = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;

  if (isPublicPath(pathname)) {
    if (pathname === "/login") {
      if (request.nextUrl.searchParams.get(REAUTH_SEARCH_PARAM) === "1") {
        const response = NextResponse.next();
        response.cookies.delete(ACCESS_TOKEN_COOKIE);
        return response;
      }
    }

    return NextResponse.next();
  }

  if (!token) {
    const loginUrl = new URL(
      buildLoginUrl({ callbackUrl: `${pathname}${search}` }),
      request.url,
    );
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
