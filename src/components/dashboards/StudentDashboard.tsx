"use client"

import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { getRegisteredEventsForUser } from "@/lib/events";
import { Event } from "@/lib/types";
import { Loader2, Calendar, Ticket } from "lucide-react";
import { EventCard } from "@/components/EventCard";
import { RecommendedEvents } from "../RecommendedEvents";
import { Separator } from "../ui/separator";

export default function StudentDashboard() {
  const { user } = useAuth();
  const [registeredEvents, setRegisteredEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const fetchRegisteredEvents = async () => {
        setLoading(true);
        const events = await getRegisteredEventsForUser(user.uid);
        setRegisteredEvents(events);
        setLoading(false);
      };
      fetchRegisteredEvents();
    }
  }, [user]);

  return (
    <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold font-headline">Welcome, {user?.displayName}!</h1>
          <p className="text-muted-foreground">
            Here are your upcoming events and some recommendations you might like.
          </p>
        </div>

        <RecommendedEvents />

        <Separator />
       
       <div>
         <h2 className="text-2xl font-bold font-headline flex items-center gap-2 mb-4">
            <Ticket className="h-6 w-6 text-primary" />
            My Registered Events
         </h2>
        {loading ? (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        ) : registeredEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {registeredEvents.map(event => (
                    <EventCard key={event.id} event={event} />
                ))}
            </div>
        ) : (
            <div className="text-center py-16 border border-dashed rounded-lg">
                <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
                <h2 className="mt-4 text-xl font-semibold">You haven't registered for any events yet.</h2>
                <p className="mt-2 text-muted-foreground">Check out the events page to find something new!</p>
            </div>
        )}
       </div>

    </div>
  );
}
