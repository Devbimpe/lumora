import { Header } from './components/Header';
import Footer from './Footer';
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
