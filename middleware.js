import { NextResponse } from 'next/server';
export async function middleware(request) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/admin')) {
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      console.log('No auth token found, redirecting to login');
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return NextResponse.next();
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
  ],
};