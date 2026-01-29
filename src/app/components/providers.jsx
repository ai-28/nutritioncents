'use client';

import { SessionProvider } from 'next-auth/react';
import { AuthProvider } from '@/lib/auth-context';
import { Toaster as Sonner } from 'sonner';

export function Providers({ children }) {
  return (
    <SessionProvider basePath="/api/auth">
      <AuthProvider>
        {children}
        <Sonner position="top-center" />
      </AuthProvider>
    </SessionProvider>
  );
}
