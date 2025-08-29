'use server';

/**
 * @fileOverview An AI flow to recommend events to a user based on their registration history.
 *
 * - recommendEvents - A function that returns a list of recommended events.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { getAllEvents, getRegisteredEventsForUser } from '@/lib/events';
import type { RecommendedEvent } from '@/lib/types';

const RecommendEventsInputSchema = z.object({
  userId: z.string().describe('The ID of the user to get recommendations for.'),
});

const RecommendEventsOutputSchema = z.object({
  recommendations: z.array(z.object({
    id: z.string().describe('The ID of the recommended event.'),
    title: z.string().describe('The title of the recommended event.'),
    reason: z.string().describe('A short, compelling reason why the user might be interested in this event.')
  })).describe('A list of recommended events.'),
});

type RecommendEventsInput = z.infer<typeof RecommendEventsInputSchema>;
type RecommendEventsOutput = z.infer<typeof RecommendEventsOutputSchema>;

const recommendEventsFlow = ai.defineFlow(
  {
    name: 'recommendEventsFlow',
    inputSchema: RecommendEventsInputSchema,
    outputSchema: RecommendEventsOutputSchema,
  },
  async ({ userId }) => {
    
    const [allEvents, registeredEvents] = await Promise.all([
        getAllEvents(),
        getRegisteredEventsForUser(userId)
    ]);
    
    // Filter out events the user is already registered for
    const registeredEventIds = new Set(registeredEvents.map(e => e.id));
    const upcomingEvents = allEvents.filter(e => !registeredEventIds.has(e.id) && e.date > new Date());
    
    if (upcomingEvents.length === 0) {
      return { recommendations: [] };
    }

    // Don't call AI if user has no registration history yet
    if (registeredEvents.length === 0) {
      // Return the 3 most recent upcoming events as a default
        const defaultRecommendations = upcomingEvents
          .sort((a,b) => a.date.getTime() - b.date.getTime())
          .slice(0, 3)
          .map(event => ({
                id: event.id,
                title: event.title,
                reason: 'A popular upcoming event you might like.'
            }));
        return { recommendations: defaultRecommendations };
    }

    const prompt = ai.definePrompt({
        name: 'recommendEventsPrompt',
        input: {schema: z.object({
            registeredEvents: z.any(),
            upcomingEvents: z.any(),
        })},
        output: {schema: RecommendEventsOutputSchema},
        prompt: `You are an expert event recommender for a platform called Konvele. Your goal is to help users discover new events they'll love.

Analyze the user's past registered events, paying close attention to the event tags and categories to understand their interests. Based on this analysis, recommend up to 5 events from the list of available upcoming events.

For each recommendation, provide a short, compelling reason (max 1-2 sentences) explaining why the user would be interested. The reason should be engaging and directly relate to their past activity (especially similar tags) or the event's content.

User's Registered Events (for interest analysis):
{{{json registeredEvents}}}

Available Upcoming Events (to recommend from):
{{{json upcomingEvents}}}

Provide your recommendations now in the specified JSON format.`,
    });

    const registeredEventDetails = registeredEvents.map(e => ({ title: e.title, category: e.category, tags: e.tags, description: e.description }));
    const upcomingEventDetails = upcomingEvents.map(e => ({ id: e.id, title: e.title, category: e.category, tags: e.tags, description: e.description }));

    const {output} = await prompt({
        registeredEvents: registeredEventDetails,
        upcomingEvents: upcomingEventDetails,
    });
    
    return output!;
  }
);


export async function recommendEvents(input: RecommendEventsInput): Promise<RecommendedEvent[]> {
  const result = await recommendEventsFlow(input);
  // Ensure we get the full event object for the card display
  const allEvents = await getAllEvents();
  const eventMap = new Map(allEvents.map(e => [e.id, e]));

  const recommendationsWithData = result.recommendations.map(rec => {
      const eventData = eventMap.get(rec.id);
      return eventData ? { ...eventData, reason: rec.reason } : null;
  }).filter(Boolean);

  // This is a type assertion because filter(Boolean) is not enough for TS
  return recommendationsWithData as RecommendedEvent[];
}
