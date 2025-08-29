"use client"

import { useEffect, useState } from 'react';
import { notFound } from 'next/navigation';
import { getEventById, getEventAttendees } from '@/lib/events';
import type { Event, Registration } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Wand2, Info, Loader2, QrCode, Mail } from 'lucide-react';
import { AISummary } from '@/components/AISummary';
import { QRCheckIn } from '@/components/QRCheckIn';
import { EmailBlast } from '@/components/EmailBlast';

export default function ManageEventPage({ params }: { params: { id: string } }) {
  const [event, setEvent] = useState<Event | null>(null);
  const [attendees, setAttendees] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEventData = async () => {
    setLoading(true);
    const [fetchedEvent, fetchedAttendees] = await Promise.all([
      getEventById(params.id),
      getEventAttendees(params.id),
    ]);
    
    if (!fetchedEvent) {
      notFound();
    }

    setEvent(fetchedEvent);
    setAttendees(fetchedAttendees);
    setLoading(false);
  };

  useEffect(() => {
    fetchEventData();
  }, [params.id]);


  if (loading) {
    return <div className="flex justify-center items-center h-[calc(100vh-10rem)]"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }
  
  if (!event) {
    return notFound();
  }

  const eventDate = (event.date as any).toDate ? (event.date as any).toDate() : new Date(event.date);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">{event.title}</h1>
        <p className="text-muted-foreground">
          Manage event settings, view attendees, and generate insights.
        </p>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview"><Info className="mr-2 h-4 w-4"/>Overview</TabsTrigger>
          <TabsTrigger value="attendees"><Users className="mr-2 h-4 w-4"/>Attendees ({attendees.length})</TabsTrigger>
          <TabsTrigger value="check-in"><QrCode className="mr-2 h-4 w-4"/>Check-in</TabsTrigger>
          <TabsTrigger value="email"><Mail className="mr-2 h-4 w-4" />Email</TabsTrigger>
          <TabsTrigger value="ai-summary"><Wand2 className="mr-2 h-4 w-4"/>AI Summary</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Event Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p><strong>Category:</strong> <Badge variant="secondary">{event.category}</Badge></p>
              <p><strong>Date:</strong> {eventDate.toLocaleDateString('en-US', { dateStyle: 'full' })}</p>
              <p><strong>Location:</strong> {event.location}</p>
              <p><strong>Description:</strong> {event.description}</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="attendees" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Attendees</CardTitle>
            </CardHeader>
            <CardContent>
             {attendees.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Registered On</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attendees.map((attendee) => (
                    <TableRow key={attendee.id}>
                      <TableCell className="font-medium">{attendee.userName}</TableCell>
                      <TableCell>{attendee.userEmail}</TableCell>
                      <TableCell>{attendee.registrationDate.toDate().toLocaleDateString()}</TableCell>
                       <TableCell>
                        <Badge variant={attendee.checkedIn ? 'default' : 'secondary'}>
                          {attendee.checkedIn ? 'Checked In' : 'Registered'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
             ) : (
                <p className="text-muted-foreground">No attendees have registered yet.</p>
             )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="check-in" className="mt-6">
          <QRCheckIn eventId={event.id} attendees={attendees} onCheckInSuccess={fetchEventData} />
        </TabsContent>
        <TabsContent value="email" className="mt-6">
          <EmailBlast eventId={event.id} eventTitle={event.title} />
        </TabsContent>
        <TabsContent value="ai-summary" className="mt-6">
          <AISummary eventTitle={event.title} eventId={event.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
