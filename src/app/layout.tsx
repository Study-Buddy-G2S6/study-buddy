// src/app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar'; // ← Fixed: was Navbar → now Navbar
import Providers from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Study Buddy – UH Mānoa',
  description: 'ICS Study Session Hub',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <Navbar /> {/* ← Only here — once */}
          <main>{children}</main>
          <Footer /> {/* ← Only here — once */}
        </Providers>
      </body>
    </html>
  );
}
