"use client"

import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Tag } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { EventCard } from '@/components/EventCard';
import { getAllEvents } from '@/lib/events';
import type { Event } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Card,
  CardContent,
  CardFooter,
} from '@/components/ui/card';

export default function Home() {
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('all');

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      const fetchedEvents = await getAllEvents();
      setAllEvents(fetchedEvents);
      setFilteredEvents(fetchedEvents);
      setLoading(false);
    }
    fetchEvents();
  }, []);

  const handleSearch = () => {
    let events = allEvents;

    if (category !== 'all') {
      events = events.filter(event => event.category === category);
    }

    if (searchTerm) {
      events = events.filter(event => 
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredEvents(events);
  };

  useEffect(() => {
    // Live search as user types or changes category
    handleSearch();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, category, allEvents]);

  return (
    <>
      <section className="bg-card border-b-0">
        <div className="container mx-auto py-20 text-center">
          <h1 className="text-4xl md:text-6xl font-bold font-headline mb-4 tracking-tight">
            Connect, Learn, and Grow
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Discover a vibrant ecosystem of events, workshops, and communities.
            Your journey into tech, business, and creativity starts here.
          </p>
        </div>
      </section>

      <div className="container mx-auto py-10">
        <div className="flex flex-col md:flex-row gap-4 mb-8 p-4 border-none rounded-lg bg-card shadow-none">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search for events..."
              className="pl-10 text-base bg-secondary"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-full md:w-[200px] text-base bg-secondary">
              <div className="flex items-center gap-2">
                <Tag className="h-5 w-5 text-muted-foreground" />
                <SelectValue placeholder="All Categories" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="Tech">Tech</SelectItem>
              <SelectItem value="Business">Business</SelectItem>
              <SelectItem value="Marketing">Marketing</SelectItem>
              <SelectItem value="Design">Design</SelectItem>
              <SelectItem value="Science">Science</SelectItem>
            </SelectContent>
          </Select>
          <Button size="lg" className="text-base w-full md:w-auto" onClick={handleSearch}>
            <Search className="mr-2 h-5 w-5" />
            Find Events
          </Button>
        </div>

        {loading ? (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="bg-transparent border-none shadow-none dark:shadow-none">
                <Skeleton className="h-48 w-full" />
                <CardContent className="p-4 space-y-2">
                   <Skeleton className="h-6 w-3/4" />
                   <Skeleton className="h-4 w-1/2" />
                   <Skeleton className="h-4 w-1/3" />
                </CardContent>
                <CardFooter className="p-4">
                  <Skeleton className="h-10 w-full" />
                </CardFooter>
              </Card>
            ))}
           </div>
        ) : filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-muted-foreground">
            <h2 className="text-2xl font-semibold">No Events Found</h2>
            <p>Try adjusting your search or filter criteria.</p>
          </div>
        )}
      </div>
    </>
  );
}
