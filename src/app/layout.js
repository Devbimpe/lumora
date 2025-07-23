
import Footer from './components/Footer';
import { Header } from './components/Header';
import './globals.css';
import './header.css';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
    <body>
        <Header/>
        {children}
        <Footer />
      </body>
      
    </html>
  )
}
