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

export default function BrowseEventsPage() {
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
    <div className="space-y-6 md:space-y-8 px-4 md:px-6 lg:px-8">
      <div className="text-center md:text-left">
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold font-headline">Browse Events</h1>
        <p className="text-sm md:text-base text-muted-foreground mt-2">
          Discover and explore all available events.
        </p>
      </div>

      <div className="flex flex-col gap-4 p-4 md:p-6 border rounded-lg bg-card shadow-sm max-w-4xl mx-auto">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 md:h-5 md:w-5 text-muted-foreground" />
          <Input
            placeholder="Search for events..."
            className="pl-10 text-sm md:text-base bg-secondary h-11 md:h-12"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-full sm:w-[200px] text-sm md:text-base bg-secondary h-11 md:h-12">
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground" />
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
          <Button size="lg" className="text-sm md:text-base h-11 md:h-12 px-6 w-full sm:w-auto" onClick={handleSearch}>
            <Search className="mr-2 h-4 w-4 md:h-5 md:w-5" />
            Find Events
          </Button>
        </div>
      </div>

      {loading ? (
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="bg-transparent border-none shadow-none dark:shadow-none">
              <Skeleton className="h-40 md:h-48 w-full rounded-lg" />
              <CardContent className="p-3 md:p-4 space-y-2">
                 <Skeleton className="h-5 md:h-6 w-3/4" />
                 <Skeleton className="h-3 md:h-4 w-1/2" />
                 <Skeleton className="h-3 md:h-4 w-1/3" />
              </CardContent>
              <CardFooter className="p-3 md:p-4">
                <Skeleton className="h-9 md:h-10 w-full rounded-md" />
              </CardFooter>
            </Card>
          ))}
         </div>
      ) : filteredEvents.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
          {filteredEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 md:py-16 px-4">
          <h2 className="text-xl md:text-2xl font-semibold mb-2">No Events Found</h2>
          <p className="text-sm md:text-base text-muted-foreground">Try adjusting your search or filter criteria.</p>
        </div>
      )}
    </div>
  );
}
