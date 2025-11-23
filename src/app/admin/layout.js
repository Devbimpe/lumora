import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import jwt from 'jsonwebtoken';
import Sidebar from '../components/admin-sidebar';

export default async function AdminLayout({ children }) {
  // Serverside auth check
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;

  // No token then redirect to login
  if (!token) {
    console.log('Layout: No auth token, redirecting to login');
    redirect('/login');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (decoded.role !== 'Admin') {
      console.log('Layout: User is not admin:', decoded.username);
      redirect('/');
    }

    console.log('Layout: Admin access granted:', decoded.username);
    
  } catch (error) {
    console.error('Layout: Token verification failed:', error.message);
    redirect('/login');
  }

  // User is authenticated admin 
  return (
    <div className="flex bg-gray-200 min-h-screen">
      <Sidebar />
      <div className="w-4/5 m-4 flex flex-col items-center p-4">
        {children}
      </div>
    </div>
  );
}