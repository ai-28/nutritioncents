'use client';

import { UserLayout } from '@/components/layout/UserLayout';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { 
  BookOpen, Heart, Target, Settings, 
  FileText, TrendingUp, AlertTriangle 
} from 'lucide-react';

export default function MorePage() {
  const menuItems = [
    {
      icon: FileText,
      label: 'Meal Templates',
      description: 'Save and reuse your favorite meals',
      href: '/client/templates',
      color: 'text-blue-500',
    },
    {
      icon: Heart,
      label: 'Health & Safety',
      description: 'Allergies, conditions, and recommendations',
      href: '/client/health',
      color: 'text-red-500',
    },
    {
      icon: Target,
      label: 'Nutrition Goals',
      description: 'Set and track your nutrition targets',
      href: '/client/goals',
      color: 'text-green-500',
    },
    {
      icon: TrendingUp,
      label: 'Analytics',
      description: 'Weekly and monthly nutrition trends',
      href: '/client/analytics',
      color: 'text-purple-500',
    },
    {
      icon: Settings,
      label: 'Settings',
      description: 'Account and app preferences',
      href: '/client/settings',
      color: 'text-gray-500',
    },
  ];

  return (
    <UserLayout>
      <div className="px-4 py-6 space-y-6 pb-24">
        <h1 className="text-3xl font-bold">More</h1>

        <div className="space-y-3">
          {menuItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <div className="bg-card rounded-lg border border-border p-4 flex items-start gap-4 hover:bg-muted/50 transition-colors">
                <div className={`${item.color} mt-1`}>
                  <item.icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{item.label}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="pt-6 border-t border-border">
          <h2 className="text-lg font-semibold mb-3">Quick Actions</h2>
          <div className="space-y-2">
            <Link href="/meals/add">
              <Button className="w-full" variant="outline">
                Add Meal
              </Button>
            </Link>
            <Link href="/client/weight">
              <Button className="w-full" variant="outline">
                Log Weight
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </UserLayout>
  );
}
