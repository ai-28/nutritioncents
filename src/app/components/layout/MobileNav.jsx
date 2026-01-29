'use client';

import { Home, BarChart3, Scale, BookOpen, Heart, Plus } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const navItems = [
  { icon: Home, label: 'Dashboard', path: '/client/dashboard' },
  { icon: BarChart3, label: 'Analytics', path: '/client/analytics' },
  { icon: null, label: 'Record', path: '/meals/add' }, // Center button
  { icon: Scale, label: 'Weight', path: '/client/weight' },
  { icon: BookOpen, label: 'More', path: '/client/more' },
];

export function MobileNav() {
  const pathname = usePathname();

  // Split nav items into left and right groups
  const leftItems = navItems.slice(0, 2);
  const centerItem = navItems[2];
  const rightItems = navItems.slice(3);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border">
      <div className="flex items-center justify-evenly py-2 relative px-4">
        {/* Left items */}
        {leftItems.map((item) => {
          const isActive = pathname === item.path || pathname?.startsWith(item.path + '/');
          return (
            <Link
              key={item.path}
              href={item.path}
              className={cn(
                "flex flex-col items-center justify-center p-2 rounded-lg transition-all relative flex-1",
                isActive 
                  ? "text-foreground" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className={cn("h-5 w-5", isActive && "scale-110")} />
              <span className="text-xs mt-1">{item.label}</span>
              {isActive && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
              )}
            </Link>
          );
        })}
        
        {/* Center button (Record Meal) */}
        <Link
          href={centerItem.path}
          className="relative -mt-8 flex-1 flex items-center justify-center"
        >
          <div className={cn(
            "h-14 w-14 rounded-full bg-primary flex items-center justify-center shadow-lg transition-transform hover:scale-105",
            pathname === centerItem.path && "ring-4 ring-primary/30"
          )}>
            <Plus className="h-7 w-7 text-primary-foreground" />
          </div>
        </Link>
        
        {/* Right items */}
        {rightItems.map((item) => {
          const isActive = pathname === item.path || pathname?.startsWith(item.path + '/');
          return (
            <Link
              key={item.path}
              href={item.path}
              className={cn(
                "flex flex-col items-center justify-center p-2 rounded-lg transition-all relative flex-1",
                isActive 
                  ? "text-foreground" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className={cn("h-5 w-5", isActive && "scale-110")} />
              <span className="text-xs mt-1">{item.label}</span>
              {isActive && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
