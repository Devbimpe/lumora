'use client';
import dynamic from 'next/dynamic';
import Footer from './components/Footer';
import { Header } from './components/Header';
import './globals.css';
import './header.css';

const AuthProvider = dynamic(
  () => import('./components/AuthProvider').then((m) => m.AuthProvider),
  { ssr: false },
);

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>Lumora</head>
      <body>
        <AuthProvider>
          <Header />
          {children}
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
