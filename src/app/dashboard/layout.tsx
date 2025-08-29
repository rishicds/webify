

"use client";

import { useAuth } from '@/components/AuthProvider';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { Home, Calendar, BarChart, Settings, PlusCircle, Rocket, User, LogOut, Loader2, Ticket, Users, FileText, Share2, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { logOut } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, userData, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (!userData?.role) {
        router.push('/onboarding');
      }
    }
  }, [user, userData, loading, router]);
  
  const handleLogout = async () => {
    await logOut();
    router.push('/');
  }

  const getInitials = (name?: string | null) => {
    if (!name) return '';
    return name.split(' ').map(n => n[0]).join('');
  }

  if (loading || !user || !userData) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const isStudent = userData.role === 'student';

  return (
    <div className="flex min-h-screen">
      <Sidebar collapsible="icon">
        <SidebarHeader className="p-4">
          <div className="flex items-center justify-between group-data-[collapsible=icon]:justify-center">
            <Link href="/" className="flex items-center gap-2 font-bold text-lg group-data-[collapsible=icon]:hidden">
              <Rocket className="w-6 h-6 text-primary" />
              <span className="font-headline">Konvele</span>
            </Link>
            <SidebarTrigger />
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {isStudent ? (
              <>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="My Tickets">
                    <Link href="/dashboard">
                      <Ticket />
                      <span>My Tickets</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="My Registrations">
                    <Link href="/dashboard/my-registrations">
                      <Calendar />
                      <span>My Registrations</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="My Posts">
                    <Link href="/dashboard/my-posts">
                      <FileText />
                      <span>My Posts</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Browse Events">
                    <Link href="/dashboard/browse-events">
                      <Calendar />
                      <span>Browse Events</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Browse Blog Posts">
                    <Link href="/dashboard/browse-blogs">
                      <FileText />
                      <span>Browse Blog Posts</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Peer Connect">
                    <Link href="/dashboard/peer-connect">
                      <Share2 />
                      <span>Peer Connect</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Messages">
                    <Link href="/dashboard/messages">
                      <MessageCircle />
                      <span>Messages</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </>
            ) : (
              <>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="New Event">
                    <Link href="/dashboard/events/new">
                      <PlusCircle />
                      <span>New Event</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Overview">
                    <Link href="/dashboard">
                      <Home />
                      <span>Overview</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Events">
                    <Link href="/dashboard/events">
                      <Calendar />
                      <span>Events</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                 <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Schedule Assistant">
                    <Link href="/dashboard/schedule-assistant">
                      <Users />
                      <span>Schedule Assistant</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Analytics">
                    <Link href="#">
                      <BarChart />
                      <span>Analytics</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </>
            )}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
           <SidebarMenu>
            <SidebarMenuItem>
                <div className="flex items-center gap-3 p-2 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:w-8 group-data-[collapsible=icon]:h-8 group-data-[collapsible=icon]:justify-center">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={user.photoURL ?? undefined} />
                        <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 overflow-hidden group-data-[collapsible=icon]:hidden">
                        <p className="text-sm font-medium truncate">{user.displayName}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                </div>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Settings">
                <Link href="/dashboard/settings">
                  <Settings />
                  <span>Settings</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
              <SidebarMenuButton onClick={handleLogout} tooltip="Log Out">
                  <LogOut />
                  <span>Log Out</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <div className="p-4 ml-28 sm:p-6 lg:p-8">{children}</div>
      </SidebarInset>
    </div>
  );
}
