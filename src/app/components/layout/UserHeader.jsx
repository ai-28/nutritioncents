'use client';

import { Menu, Home, Mail, History, User, LogOut } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useAuth } from '@/lib/auth-context';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const menuItems = [
  { icon: Home, label: 'Dashboard', path: '/client/dashboard' },
  { icon: Mail, label: 'Progress', path: '/client/analytics' },
  { icon: History, label: 'Weight', path: '/client/weight' },
  { icon: User, label: 'Profile', path: '/client/profile' },
];

export function UserHeader() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [profile, setProfile] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (user) {
      // Load profile
      fetch('/api/client/profile')
        .then(res => res.json())
        .then((data) => {
          if (data.profile) {
            setProfile({
              full_name: user.name,
              avatar_url: data.profile.avatar_url
            });
          }
        })
        .catch(() => {});
    }
  }, [user]);

  const initials = profile?.full_name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase() || user?.name?.charAt(0).toUpperCase() || 'U';

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 border-b border-border" style={{ backgroundColor: '#0f172a' }}>
      <div className="flex items-center gap-3">
        <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden text-white hover:bg-gray-800">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent 
            side="left" 
            className="w-[280px] sm:w-[300px] [&>button]:text-white [&>button]:hover:bg-gray-800" 
            style={{ backgroundColor: '#0f172a' }}
          >
            <SheetHeader>
              <SheetTitle className="text-white">Menu</SheetTitle>
            </SheetHeader>
            <div className="mt-6 space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    onClick={() => setMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                      isActive 
                        ? "bg-gray-800 text-white font-medium" 
                        : "hover:bg-gray-800 text-gray-400 hover:text-white"
                    )}
                  >
                    <Icon className={cn("h-5 w-5", isActive ? "text-white" : "text-gray-400")} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
              <div className="pt-4 border-t border-gray-700">
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white w-full transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                  <span className="font-medium">Sign Out</span>
                </button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
        <Link href="/client/profile" className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={profile?.avatar_url || ''} />
            <AvatarFallback className="bg-primary text-primary-foreground">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-semibold text-sm text-white">{profile?.full_name || user?.name || 'User'}</span>
            <span className="text-xs text-gray-400">Active now</span>
          </div>
        </Link>
      </div>
    </header>
  );
}
