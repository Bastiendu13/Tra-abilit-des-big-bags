"use client";

import Header from '@/components/header';
import { ScanHistoryProvider } from '@/hooks/use-scan-history';

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ScanHistoryProvider>
      <div className="flex flex-col min-h-screen bg-background">
        <Header />
        <main className="flex-grow container py-8">
          {children}
        </main>
      </div>
    </ScanHistoryProvider>
  );
}
