"use client"

import { useEffect, useState } from "react";
import { useAuth } from "./AuthProvider";
import { recommendEvents } from "@/ai/flows/recommend-events";
import type { RecommendedEvent, Event } from "@/lib/types";
import { Loader2, Wand2 } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { EventCard } from "./EventCard";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { Skeleton } from "./ui/skeleton";


function RecommendationCard({ event }: { event: RecommendedEvent }) {
  return (
     <div className="h-full flex flex-col">
        <EventCard event={event as Event} />
        <div className="p-4 bg-primary/10 rounded-b-lg border-t border-primary/20 flex-grow">
          <p className="text-sm text-primary/90 font-medium">
            <Wand2 className="inline-block mr-2 h-4 w-4" />
            {event.reason}
          </p>
        </div>
      </div>
  )
}

function LoadingSkeleton() {
  return (
    <Card className="bg-transparent border-none shadow-none dark:shadow-none">
      <Skeleton className="h-48 w-full" />
      <CardContent className="p-4 space-y-2">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-1/3" />
      </CardContent>
      <CardFooter className="p-4">
          <Skeleton className="h-10 w-full" />
      </CardFooter>
      <div className="p-4 mt-1">
        <Skeleton className="h-8 w-full" />
      </div>
    </Card>
  )
}


export function RecommendedEvents() {
    const { user } = useAuth();
    const [recommendations, setRecommendations] = useState<RecommendedEvent[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user?.uid) {
            setLoading(true);
            recommendEvents({ userId: user.uid })
                .then(setRecommendations)
                .finally(() => setLoading(false));
        }
    }, [user]);

    if (loading) {
        return (
             <div>
                <h2 className="text-2xl font-bold font-headline mb-4">Recommended For You</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {Array.from({ length: 3 }).map((_, i) => <LoadingSkeleton key={i} />)}
                </div>
            </div>
        )
    }

    if (recommendations.length === 0) {
        return null; // Don't show the component if there are no recommendations
    }

    return (
        <div>
            <h2 className="text-2xl font-bold font-headline mb-4">Recommended For You</h2>
             <Carousel
                opts={{
                    align: "start",
                    loop: recommendations.length > 2,
                }}
                className="w-full"
            >
                <CarouselContent>
                    {recommendations.map(event => (
                        <CarouselItem key={event.id} className="md:basis-1/2 lg:basis-1/3">
                            <RecommendationCard event={event} />
                        </CarouselItem>
                    ))}
                </CarouselContent>
                 <CarouselPrevious className="ml-12" />
                 <CarouselNext className="mr-12" />
            </Carousel>
        </div>
    )
}
