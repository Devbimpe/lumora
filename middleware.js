import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export function middleware(request) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/admin')) {
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      console.log('No auth token found, redirecting to login');
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Check if user has Admin role
      if (decoded.role !== 'Admin') {
        console.log('User is not an admin:', decoded.username);
        // Redirect non-admin users to the home page
        return NextResponse.redirect(new URL('/', request.url));
      }

      // User is authenticated and is an admin, allow access
      console.log('Admin access granted:', decoded.username);
      return NextResponse.next();
    } catch (error) {
      console.error('Token verification failed:', error.message);
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*', 
  ],
};