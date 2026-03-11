import { NextResponse } from 'next/server';
export async function middleware(request) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/admin')) {
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      console.log('No auth token found, redirecting to login');
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      const authResponse = await fetch(new URL('/api/check-auth', request.url), {
        method: 'GET',
        headers: {
          cookie: request.headers.get('cookie') || `auth-token=${token}`,
        },
        cache: 'no-store',
      });

      // If delegated route is unavailable in this environment,
      // allow request and let server-side admin layout perform auth.
      if (authResponse.status === 404) {
        return NextResponse.next();
      }

      if (!authResponse.ok) {
        return NextResponse.redirect(new URL('/login', request.url));
      }

      const authData = await authResponse.json();

      if (!authData?.authenticated) {
        return NextResponse.redirect(new URL('/login', request.url));
      }

      if (authData?.user?.role !== 'Admin') {
        return NextResponse.redirect(new URL('/', request.url));
      }

      return NextResponse.next();
    } catch (error) {
      console.error('Middleware delegated auth check failed:', error.message);
      return NextResponse.next();
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*', 
  ],
};