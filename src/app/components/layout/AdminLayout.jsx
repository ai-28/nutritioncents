'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Users, 
  LogOut,
  Shield,
  Menu
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useAuth } from '@/lib/auth-context';
import { useEffect, useState } from 'react';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
  { icon: Users, label: 'Clients', path: '/admin/clients' },
  { icon: Shield, label: 'Admins', path: '/admin/admins' },
];

export function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    // Redirect if not admin
    if (user && user.role !== 'admin') {
      router.push('/client/dashboard');
    }
  }, [user, router]);

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  // Don't render if not admin
  if (user && user.role !== 'admin') {
    return null;
  }

  const SidebarContent = () => (
    <>
      <div className="mb-4 flex justify-center">
        <Image
          src="/assets/logo2.png"
          alt="NutritionCents Logo"
          width={200}
          height={60}
          className="object-contain"
        />
      </div>

      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              href={item.path}
              onClick={() => setMenuOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                isActive 
                  ? "bg-gray-800 text-white" 
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <Button
        variant="ghost"
        onClick={handleSignOut}
        className="justify-start gap-3 text-gray-400 hover:text-white hover:bg-gray-800"
      >
        <LogOut className="h-5 w-5" />
        Sign Out
      </Button>
    </>
  );

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile Menu Button */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-[#0f172a] border-b border-border px-4 py-3 flex items-center justify-between">
        <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="text-white hover:bg-gray-800">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent 
            side="left" 
            className="w-[280px] [&>button]:text-white [&>button]:hover:bg-gray-800" 
            style={{ backgroundColor: '#0f172a' }}
          >
            <SheetHeader>
              <SheetTitle className="text-white">Admin Menu</SheetTitle>
            </SheetHeader>
            <div className="mt-6 flex flex-col h-[calc(100vh-80px)]">
              <SidebarContent />
            </div>
          </SheetContent>
        </Sheet>
        <div className="text-white font-semibold">Admin</div>
        <div className="w-10" /> {/* Spacer for centering */}
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 border-r border-border p-4 flex-col fixed left-0 top-0 bottom-0" style={{ backgroundColor: '#0f172a' }}>
        <SidebarContent />
      </aside>

      {/* Main content */}
      <main className="flex-1 md:ml-64 pt-16 md:pt-0 p-4 md:p-6 overflow-auto">
        {children}
      </main>
    </div>
  );
}
