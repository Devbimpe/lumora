'use client';
import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

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
    fetch(`/api/activate?token=${token}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setMessage(data.error);
        } else {
          setMessage('Account activated! Redirecting...');
          setTimeout(() => {
            router.push('/login');
          }, 2000);
        }
      });
  }, [router, searchParams]);

  return <p className="text-sm sm:text-base text-gray-700">{message}</p>;
}

export default function ActivatePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-50 to-white px-4">
      <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 max-w-md w-full text-center">
        <h1 className="text-xl sm:text-2xl font-bold text-green-700 mb-4">Account Activation</h1>
        <Suspense fallback={<p className="text-sm sm:text-base text-gray-700">Activating your account...</p>}>
          <ActivateContent />
        </Suspense>
      </div>
    </div>
  );
}