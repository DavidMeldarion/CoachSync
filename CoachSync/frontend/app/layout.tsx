import '../styles/globals.css';
import Navbar from '../components/Navbar';
import { UserProvider } from '../lib/userContext';
import { SyncProvider } from '../lib/syncContext';
import ClientLayout from './ClientLayout';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50">
        <ClientLayout>
          <SyncProvider>
            <UserProvider>
              <Navbar />
              {children}
            </UserProvider>
          </SyncProvider>
        </ClientLayout>
      </body>
    </html>
  );
}
