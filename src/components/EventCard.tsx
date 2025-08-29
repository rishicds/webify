import Link from 'next/link';
import Image from 'next/image';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, Calendar, MapPin, Tag } from 'lucide-react';
import type { Event } from '@/lib/types';

export function EventCard({ event }: { event: Event }) {
  const eventDate = new Date(event.date.seconds * 1000);


  return (
    <Card className="flex flex-col overflow-hidden transition-shadow duration-300 group bg-card border-none">
      <CardHeader className="p-0">
        <Link href={`/events/${event.id}`}>
          <div className="relative h-48 w-full">
            <Image
              src={event.imageUrl}
              alt={event.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105 rounded-t-lg"
              data-ai-hint={`${event.category.toLowerCase()} event`}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            <Badge className="absolute top-3 right-3" variant="secondary">
              {event.category}
            </Badge>
          </div>
        </Link>
      </CardHeader>
      <CardContent className="flex-grow p-4">
        <CardTitle className="text-xl font-headline mb-2 leading-tight h-14">
          <Link
            href={`/events/${event.id}`}
            className="hover:text-primary transition-colors"
          >
            {event.title}
          </Link>
        </CardTitle>
        <div className="text-sm text-muted-foreground space-y-2">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>
              {eventDate.toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span>{event.location}</span>
          </div>
        </div>
        <p className="mt-3 text-sm text-foreground/80 line-clamp-2">
          {event.description}
        </p>
         {event.tags && event.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {event.tags.map(tag => (
              <Badge key={tag} variant="outline" className="text-xs">
                <Tag className="mr-1 h-3 w-3" />
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button asChild className="w-full" variant="secondary">
          <Link href={`/events/${event.id}`}>
            View Details <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
