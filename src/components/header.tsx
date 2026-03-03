"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { QrCode, History, Package } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/scan', label: 'Scanner', icon: QrCode },
  { href: '/history', label: 'Historique', icon: History },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Link href="/" className="mr-8 flex items-center space-x-2">
          <Package className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg">TraceFacile</span>
        </Link>
        <nav className="flex items-center space-x-6 text-sm font-medium">
          {navItems.map((item) => {
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
      </div>
    </header>
  );
}
