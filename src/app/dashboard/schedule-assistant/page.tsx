"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { EventCalendar } from '@/components/EventCalendar';

export default function ScheduleAssistantPage() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold font-headline">Schedule Assistant</h1>
                <p className="text-muted-foreground">
                    View all scheduled events on the platform to avoid conflicts.
                </p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Master Event Calendar</CardTitle>
                    <CardDescription>
                        This calendar shows all events created by all organizers. Click on a day with events to see more details.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <EventCalendar />
                </CardContent>
            </Card>
        </div>
    )
}
