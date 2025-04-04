"use client"

import './global.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Chatbutton from '@/components/ChatButton';
import { usePathname } from 'next/navigation';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAuthPage = pathname === '/login';
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen">
        {!isAuthPage && <Navbar />}
        <main className="flex-1">
          {children}
        </main>
        {!isAuthPage && <Chatbutton />}
        {!isAuthPage && <Footer />}
      </body>
    </html>
  );
}