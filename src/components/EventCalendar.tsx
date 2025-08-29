"use client"

import { useState, useEffect } from 'react';
import { getAllEvents } from '@/lib/events';
import type { Event } from '@/lib/types';
import { Calendar } from "@/components/ui/calendar"
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { format } from 'date-fns';

export function EventCalendar() {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [month, setMonth] = useState(new Date());

    useEffect(() => {
        const fetchEvents = async () => {
            setLoading(true);
            const fetchedEvents = await getAllEvents();
            setEvents(fetchedEvents);
            setLoading(false);
        };
        fetchEvents();
    }, []);

    const eventsByDate: Record<string, Event[]> = events.reduce((acc, event) => {
        const date = format(new Date(event.date), 'yyyy-MM-dd');
        if (!acc[date]) {
            acc[date] = [];
        }
        acc[date].push(event);
        return acc;
    }, {} as Record<string, Event[]>);

    const DayWithEvents = ({ date, displayMonth }: {date: Date, displayMonth: Date | undefined}) => {
        const dateString = format(date, 'yyyy-MM-dd');
        const dailyEvents = eventsByDate[dateString] || [];
        const isOutsideMonth = displayMonth && date.getMonth() !== displayMonth.getMonth();

        if (dailyEvents.length === 0) {
            return (
                <div className="h-full w-full p-1 text-sm text-muted-foreground">{format(date, 'd')}</div>
            );
        }

        return (
             <Popover>
                <PopoverTrigger asChild>
                    <button className="relative h-full w-full p-1 text-left">
                        <span className={`font-semibold ${isOutsideMonth ? 'text-muted-foreground' : ''}`}>{format(date, 'd')}</span>
                        <div className="mt-1 space-y-1">
                            {dailyEvents.slice(0, 2).map(event => (
                                <div key={event.id} className="w-full truncate text-xs rounded-sm px-1 bg-primary/20 text-primary-foreground/80">{event.title}</div>
                            ))}
                            {dailyEvents.length > 2 && (
                                <div className="text-xs text-muted-foreground">+{dailyEvents.length - 2} more</div>
                            )}
                        </div>
                    </button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                    <h4 className="font-medium">{format(date, 'PPP')}</h4>
                    <ul className="mt-2 space-y-2">
                        {dailyEvents.map(event => (
                             <li key={event.id} className="text-sm">
                                <span className="font-semibold">{event.title}</span>
                                <span className="text-muted-foreground"> by another organizer</span>
                             </li>
                        ))}
                    </ul>
                </PopoverContent>
            </Popover>
        )
    };
    

    return (
        <div className="relative">
            {loading && (
                <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            )}
            <Calendar
                month={month}
                onMonthChange={setMonth}
                className="p-0"
                classNames={{
                    months: 'w-full',
                    month: 'w-full space-y-4',
                    table: 'w-full border-collapse space-y-1',
                    head_row: 'flex border-b',
                    head_cell: 'text-muted-foreground rounded-md w-full font-normal text-[0.8rem] py-2',
                    row: 'flex w-full mt-0 border-b',
                    cell: 'h-28 w-full text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20 border-l',
                    day: 'h-full w-full p-1 text-left align-top',
                }}
                components={{
                    Day: DayWithEvents,
                }}
            />
        </div>
    )
}
