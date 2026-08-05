'use client';
import dynamic from 'next/dynamic';

const AuthProvider = dynamic(
  () => import('./AuthProvider').then((m) => m.AuthProvider),
  { ssr: false },
);

export default function ClientProviders({ children }) {
  return <AuthProvider>{children}</AuthProvider>;
}