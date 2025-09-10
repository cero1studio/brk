"use client";
import type { ReactNode } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';

export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <div className="bg-background text-foreground min-h-screen">
        {children}
      </div>
    </AuthProvider>
  );
}
