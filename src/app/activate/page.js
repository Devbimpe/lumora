'use client';
import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api, apiErrorMessage } from '@/app/_lib/api-client';

function ActivateContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [message, setMessage] = useState('Activating your account...');

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setMessage('Invalid activation link.');
      return;
    }
    api.get('/api/activate', { searchParams: { token } }).json()
      .then(() => {
        setMessage('Account activated! Redirecting...');
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      })
      .catch(async (err) => {
        const msg = await apiErrorMessage(err, 'Activation failed.');
        setMessage(msg);
      });
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-50 to-white px-4">
      <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 max-w-md w-full text-center">
        <h1 className="text-xl sm:text-2xl font-bold text-green-700 mb-4">Account Activation</h1>
        <p className="text-sm sm:text-base text-gray-700">{message}</p>
      </div>
    </div>
  );
}

export default function ActivatePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-50 to-white px-4">
        <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 max-w-md w-full text-center">
          <h1 className="text-xl sm:text-2xl font-bold text-green-700 mb-4">Account Activation</h1>
          <p className="text-sm sm:text-base text-gray-700">Loading...</p>
        </div>
      </div>
    }>
      <ActivateContent />
    </Suspense>
  );
}