"use client"

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { getEventsByOrganizer, deleteEvent } from '@/lib/events';
import type { Event } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, PlusCircle, ExternalLink, Edit, Trash2, Loader2 } from 'lucide-react';
import Link from 'next/link';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';


export default function OrganizerEventsPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      const fetchEvents = async () => {
        setLoading(true);
        const fetchedEvents = await getEventsByOrganizer(user.uid);
        setEvents(fetchedEvents);
        setLoading(false);
      }
      fetchEvents();
    }
  }, [user]);

  const handleDelete = async (eventId: string) => {
    try {
        await deleteEvent(eventId);
        setEvents(events.filter(event => event.id !== eventId));
        toast({ title: "Success", description: "Event deleted successfully." });
    } catch (error: any) {
        toast({ variant: "destructive", title: "Error", description: `Could not delete event: ${error.message}` });
    }
  }

  const getStatus = (date: Event['date']): 'upcoming' | 'past' | 'live' => {
    const now = new Date();
    const eventDate = (date as any).toDate ? (date as any).toDate() : new Date(date);
    if (eventDate > now) return 'upcoming';
    // Check if the event is today
    if (eventDate.toDateString() === now.toDateString()) return 'live';
    return 'past';
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline">My Events</h1>
          <p className="text-muted-foreground">
            Manage your created events here.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/events/new">
            <PlusCircle className="mr-2 h-4 w-4" /> Create Event
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Attendees</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                    <TableCell colSpan={5} className="text-center h-24">
                        <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
                    </TableCell>
                </TableRow>
              ) : events.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                        You haven't created any events yet.
                    </TableCell>
                </TableRow>
              ) : (
                events.map((event) => {
                  const status = getStatus(event.date);
                  const eventDate = (event.date as any).toDate ? (event.date as any).toDate() : new Date(event.date);

                  return (
                  <TableRow key={event.id}>
                    <TableCell className="font-medium">{event.title}</TableCell>
                    <TableCell>
                      <Badge variant={status === 'live' ? 'default' : 'secondary'} className={
                          status === 'live' ? 'bg-green-500/20 text-green-700 border-green-500/30' : 
                          status === 'upcoming' ? 'bg-blue-500/20 text-blue-700 border-blue-500/30' : ''
                      }>
                          <div className={`h-2 w-2 rounded-full mr-2 ${
                              status === 'live' ? 'bg-green-500 animate-pulse' :
                              status === 'upcoming' ? 'bg-blue-500' :
                              'bg-gray-400'
                          }`}></div>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>{eventDate.toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                       <Link href={`/dashboard/events/${event.id}`} className="hover:underline">
                         View
                       </Link>
                    </TableCell>
                    <TableCell>
                      <AlertDialog>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                                <Link href={`/dashboard/events/${event.id}`}>Manage</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href={`/events/${event.id}`} target="_blank">
                                    View Public Page <ExternalLink className="h-4 w-4 ml-2" />
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => router.push(`/dashboard/events/${event.id}/edit`)}>
                                <Edit className="h-4 w-4 mr-2" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem className="text-destructive">
                                  <Trash2 className="h-4 w-4 mr-2" /> Delete
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete the event "{event.title}".
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-destructive hover:bg-destructive/90"
                              onClick={() => handleDelete(event.id)}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                )})
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
