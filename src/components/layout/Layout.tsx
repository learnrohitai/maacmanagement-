'use client';

import { useStore } from '@/store/useStore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loadBatches } = useStore();
  const router = useRouter();

  // Hydrate batches from MongoDB as soon as the user is authenticated so
  // batches created on Vercel persist across reloads and sessions.
  useEffect(() => {
    if (isAuthenticated) {
      void loadBatches();
    }
  }, [isAuthenticated, loadBatches]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/30 to-cyan-50/30">
      <Sidebar />
      <div className="lg:ml-[280px] transition-all duration-300">
        <Header />
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
