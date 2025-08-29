
"use client";

import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Calendar,
  Users,
  PlusCircle,
  Loader2,
  List,
  CheckCheck,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import {
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from 'recharts';
import { useAuth } from '@/components/AuthProvider';
import { getOrganizerAnalytics, getEventsByOrganizer } from '@/lib/events';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import type { Event } from '@/lib/types';


const chartConfig = {
  registrations: {
    label: 'Registrations',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig;

type AnalyticsData = {
    totalEvents: number;
    totalRegistrations: number;
    activeEventsCount: number;
    registrationsByMonth: { month: string; registrations: number }[];
    checkInRate: number;
    totalEngagement: number;
    topEvents: { id: string; title: string; registrations: number }[];
};

export default function OrganizerDashboard() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.uid) {
        const fetchEvents = async () => {
            const data = await getEventsByOrganizer(user.uid);
            setEvents(data);
        }
        fetchEvents();
    }
  }, [user]);

  useEffect(() => {
    if (user?.uid) {
      const fetchAnalytics = async () => {
          setLoading(true);
          const data = await getOrganizerAnalytics(user.uid, selectedEventId === 'all' ? undefined : selectedEventId);
          setAnalytics(data);
          setLoading(false);
      }
      fetchAnalytics();
    }
  }, [user, selectedEventId]);

  const selectedEventTitle = selectedEventId === 'all' 
    ? 'All Events' 
    : events.find(e => e.id === selectedEventId)?.title || 'Select an Event';

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline">Welcome, Organizer!</h1>
          <p className="text-muted-foreground">Here&apos;s a snapshot of your events.</p>
        </div>
        <div className="flex gap-2">
            <Select onValueChange={setSelectedEventId} defaultValue="all">
                <SelectTrigger className="w-[280px]">
                    <SelectValue placeholder="Select an event" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Events</SelectItem>
                    {events.map(event => (
                        <SelectItem key={event.id} value={event.id}>{event.title}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <Button asChild>
            <Link href="/dashboard/events/new">
                <PlusCircle className="mr-2 h-4 w-4" /> Create Event
            </Link>
            </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <List className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : (
                <div className="text-2xl font-bold">{analytics?.totalEvents}</div>
             )}
              {selectedEventId !== 'all' && <p className="text-xs text-muted-foreground">(Showing 1 of {events.length})</p>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Registrations
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : (
                <div className="text-2xl font-bold">{analytics?.totalRegistrations}</div>
             )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : (
                <div className="text-2xl font-bold">{analytics?.activeEventsCount}</div>
             )}
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Check-in Rate
            </CardTitle>
            <CheckCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : (
                <div className="text-2xl font-bold">{analytics?.checkInRate}%</div>
             )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Engagements
            </CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : (
                <div className="text-2xl font-bold">{analytics?.totalEngagement}</div>
             )}
              <p className="text-xs text-muted-foreground">chats, questions, poll votes</p>
          </CardContent>
        </Card>
      </div>

       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
            <CardHeader>
            <CardTitle>Registrations Summary</CardTitle>
            <CardDescription>
                {selectedEventId === 'all' ? 'A summary of event registrations per month this year.' : `Daily registrations for ${selectedEventTitle}`}
            </CardDescription>
            </CardHeader>
            <CardContent>
                {loading ? <div className="h-[250px] w-full flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div> : (
                <ChartContainer config={chartConfig} className="h-[250px] w-full">
                    <RechartsBarChart data={analytics?.registrationsByMonth} accessibilityLayer>
                    <CartesianGrid vertical={false} />
                    <XAxis
                        dataKey="month"
                        tickLine={false}
                        tickMargin={10}
                        axisLine={false}
                        tickFormatter={(value) => value.slice(0, 3)}
                    />
                    <YAxis />
                    <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent />}
                    />
                    <Bar
                        dataKey="registrations"
                        fill="var(--color-registrations)"
                        radius={4}
                    />
                    </RechartsBarChart>
                </ChartContainer>
                )}
            </CardContent>
        </Card>

        <Card className="lg:col-span-3">
             <CardHeader>
                <CardTitle>Top Performing Events</CardTitle>
                <CardDescription>
                    Your most popular events by registration.
                </CardDescription>
            </CardHeader>
            <CardContent>
                 {loading ? <div className="h-[250px] w-full flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div> : (
                   analytics && analytics.topEvents.length > 0 ? (
                     <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Event</TableHead>
                                <TableHead className="text-right">Registrations</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {analytics.topEvents.map(event => (
                                <TableRow key={event.id}>
                                    <TableCell className="font-medium truncate max-w-xs">{event.title}</TableCell>
                                    <TableCell className="text-right font-bold">{event.registrations}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                     </Table>
                   ) : (
                      <div className="h-[250px] w-full flex items-center justify-center text-muted-foreground">
                        No registration data available.
                      </div>
                   )
                 )}
            </CardContent>
        </Card>
      </div>

    </div>
  );
}
