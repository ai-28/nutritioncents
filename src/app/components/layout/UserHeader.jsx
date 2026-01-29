'use client';

import { Bell, Menu, Home, Mail, History, User, LogOut } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useAuth } from '@/lib/auth-context';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const menuItems = [
  { icon: Home, label: 'Dashboard', path: '/client/dashboard' },
  { icon: Mail, label: 'Messages', path: '/client/messages' },
  { icon: History, label: 'History', path: '/client/history' },
  { icon: User, label: 'Profile', path: '/client/profile' },
];

export function UserHeader() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [profile, setProfile] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadUnreadCount = useCallback(async () => {
    if (!user) return;
    
    try {
      // Get all meals without date/type filter to count unread
      const mealsRes = await fetch('/api/meals');
      if (mealsRes.ok) {
        const { meals } = await mealsRes.json();
        
        // Get read status from localStorage
        const readMeals = localStorage.getItem(`readMeals_${user.id}`);
        const readSet = readMeals ? new Set(JSON.parse(readMeals)) : new Set();
        
        // Count meals with nutrition estimates (admin responded) that user hasn't read
        const unread = meals.filter((meal) => {
          const hasResponse = meal.nutrition_estimates && meal.nutrition_estimates.length > 0;
          const isRead = readSet.has(meal.id);
          return hasResponse && !isRead;
        }).length;
        
        setUnreadCount(unread);
      }
    } catch (error) {
      console.error('Failed to load unread count:', error);
    }
  }, [user]);

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

      // Load unread messages count
      loadUnreadCount();
      
      // Refresh unread count periodically
      const interval = setInterval(loadUnreadCount, 30000); // Every 30 seconds
      
      return () => clearInterval(interval);
    }
  }, [user, loadUnreadCount]);

  // Refresh unread count when navigating to/from messages page
  useEffect(() => {
    if (user && pathname === '/client/messages') {
      loadUnreadCount();
    }
  }, [pathname, user, loadUnreadCount]);

  // Listen for unread count updates from Messages page
  useEffect(() => {
    const handleUnreadUpdate = (event) => {
      setUnreadCount(event.detail);
    };
    
    window.addEventListener('unreadCountUpdate', handleUnreadUpdate);
    return () => {
      window.removeEventListener('unreadCountUpdate', handleUnreadUpdate);
    };
  }, []);

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
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 bg-card border-b border-border">
      <div className="flex items-center gap-3">
        <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[280px] sm:w-[300px]">
            <SheetHeader>
              <SheetTitle>Menu</SheetTitle>
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
                        ? "bg-primary/10 text-primary font-medium" 
                        : "hover:bg-accent text-foreground"
                    )}
                  >
                    <Icon className={cn("h-5 w-5", isActive ? "text-primary" : "text-muted-foreground")} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
              <div className="pt-4 border-t">
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-destructive/10 text-destructive w-full transition-colors"
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
            <span className="font-semibold text-sm">{profile?.full_name || user?.name || 'User'}</span>
            <span className="text-xs text-muted-foreground">Active now</span>
          </div>
        </Link>
      </div>
      <Link href="/client/messages">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5 fill-foreground" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-semibold">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Button>
      </Link>
    </header>
  );
}
