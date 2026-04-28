"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { QrCode, History, Package, User, Shield, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUserProfile } from '@/hooks/use-user-profile';
import { Badge } from '@/components/ui/badge';
import { Button } from './ui/button';

const navItems = [
  { href: '/scan', label: 'Scanner', icon: QrCode, adminOnly: false },
  { href: '/history', label: 'Historique', icon: History, adminOnly: false },
  { href: '/config', label: 'Configuration', icon: Shield, adminOnly: true },
];

export default function Header() {
  const pathname = usePathname();
  const { profile, logout } = useUserProfile();

  const filteredNavItems = navItems.filter(item => {
    if (!item.adminOnly) return true;
    return profile === 'administrateur';
  });

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Link href="/" className="mr-8 flex items-center space-x-2">
          <Package className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg">Traçabilité des big-bags</span>
        </Link>
        {profile && (
          <nav className="flex items-center space-x-6 text-sm font-medium">
            {filteredNavItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'transition-colors hover:text-primary flex items-center',
                    isActive ? 'text-primary' : 'text-muted-foreground'
                  )}
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        )}
        <div className="ml-auto flex items-center gap-4">
            {profile && (
                <Badge variant={profile === 'administrateur' ? 'default' : 'secondary'}>
                    {profile === 'administrateur' ? <Shield className="mr-2 h-4 w-4" /> : <User className="mr-2 h-4 w-4" />}
                    {profile.charAt(0).toUpperCase() + profile.slice(1)}
                </Badge>
            )}
            {profile && (
              <Button variant="ghost" size="sm" onClick={logout}>
                <Menu className="mr-2 h-4 w-4" />
                Menu
              </Button>
            )}
        </div>
      </div>
    </header>
  );
}
