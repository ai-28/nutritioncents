'use client';

import { MobileNav } from './MobileNav';
import { UserHeader } from './UserHeader';

export function UserLayout({ children }) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <UserHeader />
      <main className="flex-1 pb-20 pt-16 overflow-auto">
        {children}
      </main>
      <MobileNav />
    </div>
  );
}
