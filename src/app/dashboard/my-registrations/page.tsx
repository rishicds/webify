"use client"

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { getRegisteredEventsForUser } from '@/lib/events';
import type { Event } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function MyRegistrationsPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const fetchEvents = async () => {
        setLoading(true);
        const registeredEvents = await getRegisteredEventsForUser(user.uid);
        setEvents(registeredEvents);
        setLoading(false);
      };
      fetchEvents();
    }
  }, [user]);

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="container py-12">
      <Card>
        <CardHeader>
          <CardTitle>My Registered Events</CardTitle>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <div className="text-muted-foreground">You have not registered for any events yet.</div>
          ) : (
            <ul className="space-y-4">
              {events.map(event => (
                <li key={event.id} className="border-b pb-4">
                  <Link href={`/events/${event.id}`} className="font-semibold text-lg hover:underline">{event.title}</Link>
                  <div className="text-sm text-muted-foreground">{event.date.toLocaleDateString ? event.date.toLocaleDateString() : new Date(event.date).toLocaleDateString()} | {event.location}</div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
