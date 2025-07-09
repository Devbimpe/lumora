'use client';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function ActivatePage() {
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

  return <div>{message}</div>;
}