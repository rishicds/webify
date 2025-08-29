"use client"

import { useEffect, useState } from 'react';
// removed next/image to display base64 QR with standard <img>
import Link from 'next/link';
import { getEventById, registerForEvent, isUserRegisteredForEvent, getUserRegistrationForEvent } from '@/lib/events';
import { generateTicketPDF, type TicketData } from '@/lib/pdfGenerator';
import type { Event, Registration, UserData } from '@/lib/types';
import { useAuth } from '@/components/AuthProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Calendar, MapPin, Download, Loader2, AlertTriangle } from 'lucide-react';
import { notFound, useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { fetchQrCodeDataUrl } from '@/lib/fetchQrCodeDataUrl';

export default function TicketPage({ params }: { params: { id: string } }) {
  const { user, userData, loading: authLoading } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);
  const [registration, setRegistration] = useState<Registration | null>(null);
  const [isNewRegistration, setIsNewRegistration] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (authLoading) return;
    if (!user || !userData) {
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

        // Check if user is already registered
        const alreadyRegistered = await isUserRegisteredForEvent(userData.uid, params.id);
        if (alreadyRegistered) {
            const existingRegistration = await getUserRegistrationForEvent(userData.uid, params.id);
            setRegistration(existingRegistration);
            setIsNewRegistration(false);
            setLoading(false);
            return;
        }

        setIsRegistering(true);
        try {
            const reg = await registerForEvent(params.id, fetchedEvent.title, userData);
            setRegistration(reg);
            setIsNewRegistration(true);
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
  }, [params.id, user, userData, authLoading, router, toast]);


  // QR code data and url
  const qrCodeData = registration?.id || '';
  // request a high-resolution QR image for crisp rendering (we will display it smaller via CSS)
  const qrCodeUrl = qrCodeData ? `https://api.qrserver.com/v1/create-qr-code/?size=1000x1000&data=${encodeURIComponent(qrCodeData)}` : '';

  // Fetch QR code as base64 data URL for PDF and display
  useEffect(() => {
    if (!qrCodeUrl) return;
    let isMounted = true;
    fetchQrCodeDataUrl(qrCodeUrl).then((dataUrl) => {
      if (isMounted) setQrCodeDataUrl(dataUrl);
    });
    return () => { isMounted = false; };
  }, [qrCodeUrl]);

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

  const handleDownloadPDF = async () => {
    if (!event || !registration || !user || !userData || !qrCodeDataUrl) return;
    setIsGeneratingPDF(true);
    try {
      const ticketData: TicketData = {
        eventTitle: event.title,
        eventDate: eventDate,
        eventLocation: event.location,
        userName: userData.displayName || user.displayName || 'Attendee',
        userEmail: userData.email || user.email || '',
        qrCodeUrl: qrCodeDataUrl,
        registrationId: registration.id
      };
      await generateTicketPDF(ticketData);
      toast({
        title: "PDF Downloaded!",
        description: "Your ticket has been saved as a PDF file.",
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        variant: "destructive",
        title: "Download Failed",
        description: "Could not generate PDF. Please try again.",
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // removed duplicate qrCodeData and qrCodeUrl declarations
  const eventDate = (event.date as any).toDate ? (event.date as any).toDate() : new Date(event.date);


  return (
    <div className="container py-12 flex items-center justify-center">
      <Card className="w-full max-w-md shadow-2xl ticket-pdf-card">
        <CardHeader className="text-center items-center space-y-2">
          <CheckCircle className="h-16 w-16 text-green-500" />
          <CardTitle className="text-2xl font-headline">
            {isNewRegistration ? "You're Registered!" : "Your Ticket"}
          </CardTitle>
          <CardDescription>
            {isNewRegistration 
              ? `Successfully registered for ${event.title}` 
              : `Your ticket for ${event.title}`
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex justify-center items-center p-4 bg-white rounded-lg overflow-visible" style={{ minHeight: 260 }}>
            <div className="flex items-center justify-center w-full h-full">
              {qrCodeDataUrl ? (
                <img
                  src={qrCodeDataUrl}
                  alt="QR Code Ticket"
                  width={1000}
                  height={1000}
                  style={{ width: 180, height: 180, objectFit: 'contain', display: 'block' }}
                  className="mx-auto rounded-md shadow-md bg-white p-2"
                  data-ai-hint="qr code"
                />
              ) : (
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              )}
            </div>
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
           <p className="text-xs text-muted-foreground text-center">
             {isNewRegistration 
               ? "Present this QR code at the event entrance. A confirmation has been sent to your email." 
               : "Present this QR code at the event entrance for check-in."
             }
           </p>
          <div className="flex gap-2">
             <Button
               variant="outline"
               className="w-full"
               onClick={handleDownloadPDF}
               disabled={isGeneratingPDF}
             >
                {isGeneratingPDF ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Download className="mr-2 h-4 w-4" />
                )}
                {isGeneratingPDF ? 'Generating PDF...' : 'Save Ticket'}
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
