import Footer from './components/Footer';
import { Header } from './components/Header';
import './globals.css';
import './header.css';

export const metadata = {}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
      </head>
      <body suppressHydrationWarning>
        <Header/>
        {children}
        <Footer />
      </body>
    </html>
  )
}
