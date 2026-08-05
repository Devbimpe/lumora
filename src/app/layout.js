import Footer from './components/Footer';
import { Header } from './components/Header';
import ClientProviders from './components/ClientProviders';
import './globals.css';
import './header.css';

export const metadata = {
  title: 'Lumora',
  description: 'Scenario-based learning platform',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ClientProviders>
          <Header />
          {children}
          <Footer />
        </ClientProviders>
      </body>
    </html>
  );
}