"use client"

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getEventById, isUserRegisteredForEvent, getUserRegistrationForEvent } from '@/lib/events';
import type { Event, Registration } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Calendar, MapPin, Ticket, User, Loader2, MessageSquare, Mic, FileQuestion, Trophy, CheckCircle } from 'lucide-react';
import { notFound } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EventChat } from '@/components/EventChat';
import { useAuth } from '@/components/AuthProvider';
import { QandA } from '@/components/QandA';
import { Polls } from '@/components/Polls';
import { Leaderboard } from '@/components/Leaderboard';


export default function EventPage({ params }: { params: { id: string } }) {
  const { user } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRegistered, setIsRegistered] = useState(false);
  const [userRegistration, setUserRegistration] = useState<Registration | null>(null);

  useEffect(() => {
    const fetchEvent = async () => {
      const fetchedEvent = await getEventById(params.id);
      if (!fetchedEvent) {
        notFound();
      }
      setEvent(fetchedEvent);
      setLoading(false);
    };
    fetchEvent();
  }, [params.id]);

  useEffect(() => {
    const checkRegistrationStatus = async () => {
      if (user && event) {
        const registered = await isUserRegisteredForEvent(user.uid, event.id);
        setIsRegistered(registered);
        if (registered) {
          const registration = await getUserRegistrationForEvent(user.uid, event.id);
          setUserRegistration(registration);
        }
      }
    };
    checkRegistrationStatus();
  }, [user, event]);

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }
  
  if (!event) {
    return notFound();
  }

  const isOrganizer = user?.uid === event.organizerId;
  const eventDate = (event.date as any).toDate ? (event.date as any).toDate() : new Date(event.date);

  return (
    <div className="bg-card">
      <div className="container mx-auto py-12">
        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
          <div className="md:col-span-2 space-y-8">
            <div className="relative w-full h-64 md:h-96 rounded-lg overflow-hidden shadow-lg">
              <Image
                src={event.imageUrl}
                alt={event.title}
                fill
                className="object-cover"
                data-ai-hint={`${event.category.toLowerCase()} conference`}
                priority
                sizes="(max-width: 768px) 100vw, 67vw"
              />
            </div>

            <Tabs defaultValue="details">
              <TabsList>
                <TabsTrigger value="details">Event Details</TabsTrigger>
                <TabsTrigger value="engagement">Engagement</TabsTrigger>
              </TabsList>
              <TabsContent value="details" className="mt-6">
                <div className="space-y-8">
                   <div>
                    <h1 className="text-4xl font-bold font-headline tracking-tight">
                      {event.title}
                    </h1>
                    <div
                      className="mt-6 prose prose-lg dark:prose-invert max-w-none"
                      dangerouslySetInnerHTML={{ __html: event.longDescription }}
                    />
                  </div>

                  <Separator />

                  <div>
                    <h2 className="text-3xl font-bold font-headline mb-6">Schedule</h2>
                    <div className="space-y-6 border-l-2 border-primary/20 ml-2">
                      {event.schedule.map((item, index) => (
                        <div key={index} className="relative pl-8">
                          <div className="absolute -left-[11px] top-1 h-5 w-5 rounded-full bg-primary" />
                          <p className="font-bold text-primary">{item.time}</p>
                          <h3 className="font-semibold text-lg">{item.title}</h3>
                          {item.speaker && (
                            <p className="text-sm text-muted-foreground">
                              by {item.speaker}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h2 className="text-3xl font-bold font-headline mb-6">Speakers</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {event.speakers.map((speaker) => (
                        <div key={speaker.name} className="flex items-start gap-4">
                          <Avatar className="h-16 w-16 border-2 border-primary/50">
                            <AvatarImage src={speaker.avatar} alt={speaker.name} />
                            <AvatarFallback>
                              {speaker.name
                                .split(' ')
                                .map((n) => n[0])
                                .join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-bold text-lg">{speaker.name}</h3>
                            <p className="text-muted-foreground">{speaker.title}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="engagement" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Engagement Hub</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="chat">
                      <TabsList>
                        <TabsTrigger value="chat"><MessageSquare className="mr-2 h-4 w-4" />Chat</TabsTrigger>
                        <TabsTrigger value="qna"><FileQuestion className="mr-2 h-4 w-4" />Q&A</TabsTrigger>
                        <TabsTrigger value="polls"><Mic className="mr-2 h-4 w-4" />Polls</TabsTrigger>
                        <TabsTrigger value="leaderboard"><Trophy className="mr-2 h-4 w-4" />Leaderboard</TabsTrigger>
                      </TabsList>
                      <TabsContent value="chat" className="mt-4">
                        <EventChat eventId={event.id} />
                      </TabsContent>
                       <TabsContent value="qna" className="mt-4">
                        <QandA eventId={event.id} isOrganizer={isOrganizer} />
                      </TabsContent>
                       <TabsContent value="polls" className="mt-4">
                        <Polls eventId={event.id} isOrganizer={isOrganizer} />
                      </TabsContent>
                      <TabsContent value="leaderboard" className="mt-4">
                        <Leaderboard eventId={event.id} />
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
          <div className="md:col-span-1 space-y-6">
            <Card className="sticky top-24 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {isRegistered ? (
                    <>
                      <CheckCircle className="h-6 w-6 text-green-500" />
                      <span>You're Registered!</span>
                    </>
                  ) : (
                    <>
                      <Ticket className="h-6 w-6 text-primary" />
                      <span>Register Now</span>
                    </>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 mt-1 text-muted-foreground" />
                  <div>
                    <p className="font-semibold">Date & Time</p>
                    <p className="text-muted-foreground">
                      {eventDate.toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                      <br />
                      {eventDate.toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 mt-1 text-muted-foreground" />
                  <div>
                    <p className="font-semibold">Location</p>
                    <p className="text-muted-foreground">{event.location}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 mt-1 text-muted-foreground" />
                  <div>
                    <p className="font-semibold">Category</p>
                    <Badge variant="outline">{event.category}</Badge>
                  </div>
                </div>
                {isRegistered && userRegistration && (
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 mt-1 text-green-500" />
                    <div>
                      <p className="font-semibold">Registration Status</p>
                      <p className="text-muted-foreground">
                        {userRegistration.checkedIn ? 'Checked In' : 'Registered'}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
              <CardContent>
                {isRegistered ? (
                  <Button size="lg" className="w-full" variant="outline" asChild>
                    <Link href={`/ticket/${event.id}`}>View Your Ticket</Link>
                  </Button>
                ) : (
                  <Button size="lg" className="w-full" asChild>
                    <Link href={`/ticket/${event.id}`}>Register for this Event</Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
