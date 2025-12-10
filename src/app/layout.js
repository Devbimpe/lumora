import Footer from './components/Footer';
import { Header } from './components/Header';
import './globals.css';
import './header.css';

export const metadata = {
  viewport: 'width=device-width, initial-scale=1, maximum-scale=5',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      </head>
      <body suppressHydrationWarning>
        <Header/>
        {children}
        <Footer />
      </body>
    </html>
  )
}
