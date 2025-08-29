"use client"

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getEventById, registerForEvent } from '@/lib/events';
import type { Event, Registration } from '@/lib/types';
import { useAuth } from '@/components/AuthProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Calendar, MapPin, Download, Loader2, AlertTriangle } from 'lucide-react';
import { notFound, useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

export default function TicketPage({ params }: { params: { id: string } }) {
  const { user, loading: authLoading } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);
  const [registration, setRegistration] = useState<Registration | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push(`/login?redirect=/ticket/${params.id}`);
      return;
    }

    const processRegistration = async () => {
        setLoading(true);
        const fetchedEvent = await getEventById(params.id);
        if (!fetchedEvent) {
            notFound();
        }
        setEvent(fetchedEvent);

        setIsRegistering(true);
        try {
            const reg = await registerForEvent(params.id, fetchedEvent.title, user);
            setRegistration(reg);
            toast({
                title: "Registration Successful!",
                description: `You are now registered for ${fetchedEvent.title}.`,
            });
        } catch (error) {
            console.error("Registration failed:", error);
            toast({
                variant: "destructive",
                title: "Registration Failed",
                description: "Could not register for the event. Please try again.",
            });
        } finally {
            setIsRegistering(false);
            setLoading(false);
        }
    };

    processRegistration();
  }, [params.id, user, authLoading, router, toast]);

  if (loading || authLoading || isRegistering) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }
  
  if (!event || !registration) {
    return notFound();
  }

  if (!user) {
     return (
        <div className="container py-12 flex items-center justify-center">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center items-center space-y-2">
                     <AlertTriangle className="h-16 w-16 text-yellow-500" />
                    <CardTitle>Please Login</CardTitle>
                    <CardDescription>You need to be logged in to register for an event.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button asChild className="w-full">
                        <Link href={`/login?redirect=/events/${params.id}`}>Login</Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
     )
  }

  const qrCodeData = registration.id;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrCodeData)}`;
  const eventDate = (event.date as any).toDate ? (event.date as any).toDate() : new Date(event.date);


  return (
    <div className="container py-12 flex items-center justify-center">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center items-center space-y-2">
          <CheckCircle className="h-16 w-16 text-green-500" />
          <CardTitle className="text-2xl font-headline">You're Registered!</CardTitle>
          <CardDescription>
            Your ticket for {event.title}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex justify-center p-4 bg-white rounded-lg">
             <Image
                src={qrCodeUrl}
                alt="QR Code Ticket"
                width={250}
                height={250}
                data-ai-hint="qr code"
              />
          </div>
          <div className="space-y-2 text-center">
             <h3 className="font-bold text-lg">{event.title}</h3>
             <div className="text-sm text-muted-foreground flex items-center justify-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{eventDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</span>
             </div>
             <div className="text-sm text-muted-foreground flex items-center justify-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>{event.location}</span>
             </div>
          </div>
           <p className="text-xs text-muted-foreground text-center">Present this QR code at the event entrance. A confirmation has been sent to your email.</p>
          <div className="flex gap-2">
             <Button variant="outline" className="w-full">
                <Download className="mr-2 h-4 w-4" />
                Save Ticket
             </Button>
             <Button asChild className="w-full">
                <Link href="/">Explore More Events</Link>
             </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
