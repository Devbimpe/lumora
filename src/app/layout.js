import { AuthProvider } from './components/AuthProvider';
import Footer from './components/Footer';
import { Header } from './components/Header';
import './globals.css';
import './header.css';

/** @type {import('next').Viewport} */
export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head></head>
      <body suppressHydrationWarning>
        <AuthProvider>
          <Header />
          {children}
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
