import Footer from './Footer'
import './globals.css'
import './header.css'
import { Header } from './components/Header';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
<<<<<<< HEAD
      <body>{children}
        <Footer />
      </body>
      
    </html>
  )
=======
    <body>
        <Header />
        {children}
    </body>
    </html>
  );
>>>>>>> cdbe4ff17828808fa314322cf324f8b536888966
}
