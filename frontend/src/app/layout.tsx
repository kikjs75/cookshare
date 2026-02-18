import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { Navbar } from '@/components/layout/Navbar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CookShare - 레시피 공유 서비스',
  description: '맛있는 레시피를 공유하고 발견하세요',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        <AuthProvider>
          <Navbar />
          <main className="container mx-auto min-h-[calc(100vh-4rem)] px-4 py-8">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
