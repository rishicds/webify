"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Rocket, Menu, LogOut, Tickets } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from './AuthProvider';
import { logOut } from '@/lib/auth';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

const routes = [
  { href: '/', label: 'Events' },
  { href: '/blog', label: 'Blog' },
  { href: '/dashboard', label: 'Organizer Dashboard' },
];

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, userData } = useAuth();

  const handleLogout = async () => {
    await logOut();
    router.push('/');
  }
  
  const getInitials = (name?: string | null) => {
    if (!name) return '';
    return name.split(' ').map(n => n[0]).join('');
  }
  
  const isStudent = userData?.role === 'student';

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b">
      <div className="container mx-auto flex h-16 items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-lg"
        >
          <Tickets className="w-6 h-6 text-primary" />
          <span className="font-headline">Konvele</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          {routes.map((route) => {
            if (isStudent && route.href === '/dashboard') return null;
            return (
                <Link
                  key={route.href}
                  href={route.href}
                  className={cn(
                    'text-sm font-medium transition-colors hover:text-primary',
                    (pathname.startsWith(route.href) && route.href !== '/') || pathname === route.href
                      ? 'text-primary'
                      : 'text-muted-foreground'
                  )}
                >
                  {route.label}
                </Link>
            )
          })}
        </nav>
        <div className="hidden md:flex items-center gap-2">
          {user ? (
             <>
                <Button variant="ghost" size="sm" asChild>
                    <Link href={isStudent ? "/dashboard" : "/dashboard/events"}>
                        Dashboard
                    </Link>
                </Button>
                <Avatar className="h-9 w-9">
                    <AvatarImage src={user.photoURL ?? undefined} />
                    <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
                </Avatar>
                <Button variant="ghost" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" /> Log Out
                </Button>
            </>
          ) : (
              <Button asChild>
                <Link href="/login">Login / Sign Up</Link>
              </Button>
          )}
        </div>
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <div className="flex flex-col gap-6 p-6">
                <Link
                  href="/"
                  className="flex items-center gap-2 font-bold text-lg"
                >
                  <Rocket className="w-6 h-6 text-primary" />
                  <span className="font-headline">Konvele Connect</span>
                </Link>
                <nav className="flex flex-col gap-4">
                  {routes.map((route) => {
                     if (isStudent && route.href === '/dashboard') return null;
                    return (
                        <Link
                        key={route.href}
                        href={route.href}
                        className={cn(
                            'text-base font-medium transition-colors hover:text-primary',
                            (pathname.startsWith(route.href) && route.href !== '/') || pathname === route.href
                            ? 'text-primary'
                            : 'text-foreground/70'
                        )}
                        >
                        {route.label}
                        </Link>
                    )
                  })}
                </nav>
                <div className="mt-auto flex flex-col gap-2">
                  {user ? (
                    <>
                    <Button asChild className="w-full">
                        <Link href={isStudent ? "/dashboard" : "/dashboard/events"}>
                            Dashboard
                        </Link>
                    </Button>
                    <Button variant="ghost" onClick={handleLogout} className="w-full">Log Out</Button>
                    </>
                  ) : (
                      <Button asChild className="w-full">
                        <Link href="/login">Login / Sign Up</Link>
                      </Button>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
