import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Paths that don't require an authenticated user
const PUBLIC_PATHS = [
  '/signin',
  '/signup',
  '/api',
  '/_next',
  '/static',
  '/favicon.ico',
  '/manifest.json',
];

function isPublicPath(pathname: string) {
  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'))) return true;
  return false;
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow Next internals, API routes, static files and explicit public pages
  if (isPublicPath(pathname)) return NextResponse.next();

  // Try common Supabase cookie names
  const token =
    req.cookies.get('sb-access-token')?.value ??
    req.cookies.get('sb:token')?.value ??
    req.cookies.get('supabase-auth-token')?.value ??
    null;

  if (!token) {
    // Not authenticated — redirect to sign-in page, preserve original path
    const signInUrl = req.nextUrl.clone();
    signInUrl.pathname = '/signin';
    signInUrl.search = `from=${encodeURIComponent(pathname)}`;
    return NextResponse.redirect(signInUrl);
  }

  // Token present — allow the request. Deeper validation should happen in server routes.
  return NextResponse.next();
}

export const config = {
  // Run middleware for all paths (we early-return for public paths)
  matcher: '/:path*',
};
