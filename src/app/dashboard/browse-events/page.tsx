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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-8 md:py-12">
        <div className="space-y-8 md:space-y-12">
          {/* Header Section */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
              <Tag className="h-4 w-4" />
              Discover Events
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold font-headline bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Browse Events
            </h1>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Discover and explore all available events. Find the perfect event to attend and connect with like-minded people.
            </p>
          </div>

          {/* Search and Filter Section */}
          <div className="max-w-4xl mx-auto">
            <Card className="bg-gradient-to-r from-card/80 to-card/60 backdrop-blur-sm border border-border/50 shadow-xl">
              <CardContent className="p-6 md:p-8">
                <div className="space-y-6">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      placeholder="Search for events by title, description, or keywords..."
                      className="pl-12 text-base bg-background/50 border-border/50 h-14 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all duration-200"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4 items-center">
                    <div className="flex-1 w-full sm:w-auto">
                      <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger className="w-full text-base bg-background/50 border-border/50 h-14 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary/50">
                          <div className="flex items-center gap-3">
                            <Tag className="h-5 w-5 text-muted-foreground" />
                            <SelectValue placeholder="All Categories" />
                          </div>
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          <SelectItem value="all" className="text-base py-3">All Categories</SelectItem>
                          <SelectItem value="Tech" className="text-base py-3">Tech</SelectItem>
                          <SelectItem value="Business" className="text-base py-3">Business</SelectItem>
                          <SelectItem value="Marketing" className="text-base py-3">Marketing</SelectItem>
                          <SelectItem value="Design" className="text-base py-3">Design</SelectItem>
                          <SelectItem value="Science" className="text-base py-3">Science</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      size="lg"
                      className="text-base h-14 px-8 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 rounded-xl w-full sm:w-auto"
                      onClick={handleSearch}
                    >
                      <Search className="mr-2 h-5 w-5" />
                      Find Events
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Events Grid Section */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 md:gap-8">
              {Array.from({ length: 8 }).map((_, i) => (
                <Card key={i} className="bg-gradient-to-br from-card/80 to-card/60 backdrop-blur-sm border border-border/50 shadow-lg">
                  <Skeleton className="h-48 w-full rounded-t-lg" />
                  <CardContent className="p-5 space-y-3">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </CardContent>
                  <CardFooter className="p-5 pt-0">
                    <Skeleton className="h-12 w-full rounded-xl" />
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : filteredEvents.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-2 gap-6 md:gap-8">
              {filteredEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 md:py-20">
              <div className="max-w-md mx-auto space-y-4">
                <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
                  <Search className="h-8 w-8 text-muted-foreground" />
                </div>
                <h2 className="text-2xl md:text-3xl font-semibold">No Events Found</h2>
                <p className="text-muted-foreground text-lg">Try adjusting your search or filter criteria to find more events.</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => {
                    setSearchTerm('');
                    setCategory('all');
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
