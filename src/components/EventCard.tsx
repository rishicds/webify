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
  let eventDate: Date;
  if (event.date instanceof Date) {
    eventDate = event.date;
  } else if (typeof event.date === "object" && event.date !== null && "seconds" in event.date) {
    eventDate = new Date(event.date.seconds * 1000);
  } else if (typeof event.date === "string" || typeof event.date === "number") {
    eventDate = new Date(event.date);
  } else {
    eventDate = new Date(); // fallback to now if invalid
  }


  return (
    <Card className="group relative flex flex-col overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1 bg-gradient-to-br from-card to-card/95 border border-border/50 backdrop-blur-sm">
      <CardHeader className="p-0">
        <Link href={`/events/${event.id}`}>
          <div className="relative h-48 w-full overflow-hidden">
            <Image
              src={event.imageUrl}
              alt={event.title}
              fill
              className="object-cover transition-all duration-500 group-hover:scale-110 rounded-t-lg"
              data-ai-hint={`${event.category.toLowerCase()} event`}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <Badge className="absolute top-3 right-3 bg-white/90 text-foreground hover:bg-white transition-colors duration-200 shadow-lg">
              {event.category}
            </Badge>
            <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="bg-white/10 backdrop-blur-md rounded-lg p-2 border border-white/20">
                <p className="text-white text-sm font-medium truncate">{event.title}</p>
              </div>
            </div>
          </div>
        </Link>
      </CardHeader>
      <CardContent className="flex-grow p-5 space-y-4">
        <CardTitle className="text-xl font-headline mb-3 leading-tight h-14 group-hover:text-primary transition-colors duration-200">
          <Link
            href={`/events/${event.id}`}
            className="hover:text-primary transition-colors"
          >
            {event.title}
          </Link>
        </CardTitle>
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-2 bg-muted/50 px-3 py-1.5 rounded-full">
              <Calendar className="h-4 w-4 text-primary" />
              <span className="font-medium">
                {eventDate.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-2 bg-muted/50 px-3 py-1.5 rounded-full">
              <MapPin className="h-4 w-4 text-primary" />
              <span className="font-medium truncate">{event.location}</span>
            </div>
          </div>
        </div>
        <p className="text-sm text-foreground/80 line-clamp-3 leading-relaxed">
          {event.description}
        </p>
         {event.tags && event.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {event.tags.slice(0, 3).map(tag => (
              <Badge key={tag} variant="outline" className="text-xs bg-primary/5 border-primary/20 text-primary hover:bg-primary/10 transition-colors duration-200">
                <Tag className="mr-1 h-3 w-3" />
                {tag}
              </Badge>
            ))}
            {event.tags.length > 3 && (
              <Badge variant="outline" className="text-xs bg-muted/50 border-muted text-muted-foreground">
                +{event.tags.length - 3} more
              </Badge>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="p-5 pt-0">
        <Button asChild className="w-full group/btn bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border-0">
          <Link href={`/events/${event.id}`}>
            <span className="font-medium">View Details</span>
            <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform duration-200" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
