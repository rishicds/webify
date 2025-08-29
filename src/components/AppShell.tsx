"use client";

import { usePathname } from 'next/navigation';
import { Header } from '@/components/Header';
import { SidebarProvider } from './ui/sidebar';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDashboard = pathname.startsWith('/dashboard');

  if (isDashboard) {
    return <SidebarProvider>{children}</SidebarProvider>;
  }

  return (
    <>
      <Header />
      <main className="pt-16 min-h-[calc(100vh-4rem)]">{children}</main>
      <footer className="border-t">
        <div className="container mx-auto py-6 text-center text-sm text-muted-foreground">
          <p>
            &copy; {new Date().getFullYear()} Konvele Connect. All rights
            reserved.
          </p>
        </div>
      </footer>
    </>
  );
}
