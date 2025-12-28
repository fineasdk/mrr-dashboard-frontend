import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // List of paths that should be handled by the main app (client-side routing)
  const appRoutes = [
    '/dashboard',
    '/customers',
    '/analytics',
    '/settings',
    '/integrations',
    '/integrations/shopify'
  ];
  
  // If the request is for one of our app routes, rewrite to the root page
  // This allows the main app to handle the routing while maintaining the URL
  if (appRoutes.includes(pathname) || pathname.startsWith('/integrations/')) {
    return NextResponse.rewrite(new URL('/', request.url));
  }
  
  // For all other routes, continue normally
  return NextResponse.next();
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - login, register, profile (auth routes that have their own pages)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|login|register|profile).*)',
  ],
};

















