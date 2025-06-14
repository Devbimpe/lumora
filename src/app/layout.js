import './globals.css'
import './header.css'
import { Header } from './components/Header';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
    <body>
        <Header/>
        {children}
    </body>
    </html>
  );
}
