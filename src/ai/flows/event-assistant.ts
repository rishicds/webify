'use server';
/**
 * @fileOverview An AI assistant that can answer questions about a specific event.
 *
 * - answerQuestionAboutEvent - The main function to interact with the assistant.
 * - AnswerQuestionAboutEventInput - The input type for the flow.
 * - AnswerQuestionAboutEventOutput - The output type for the flow.
 */

import { ai } from '@/ai/genkit';
import { getEventById } from '@/lib/events';
import type { Event } from '@/lib/types';
import { z } from 'genkit';
import { format } from 'date-fns';

const AnswerQuestionAboutEventInputSchema = z.object({
  eventId: z.string().describe('The ID of the event.'),
  query: z.string().describe('The user\'s question about the event.'),
});
export type AnswerQuestionAboutEventInput = z.infer<typeof AnswerQuestionAboutEventInputSchema>;

const AnswerQuestionAboutEventOutputSchema = z.object({
  answer: z.string().describe('The AI\'s answer to the user\'s question.'),
});
export type AnswerQuestionAboutEventOutput = z.infer<typeof AnswerQuestionAboutEventOutputSchema>;

// Tool to get event details
const getEventDetailsTool = ai.defineTool(
  {
    name: 'getEventDetails',
    description: 'Retrieves the details for a specific event, including its title, description, date, location, schedule, and speakers.',
    inputSchema: z.object({ eventId: z.string() }),
    outputSchema: z.any(), // Using any() because Event type is complex and includes Timestamps
  },
  async ({ eventId }) => {
    const event = await getEventById(eventId);
    if (!event) {
      return { error: 'Event not found' };
    }
    // Convert Firestore Timestamps to readable strings for the AI
    const eventDate = (event.date as any).toDate ? (event.date as any).toDate() : new Date(event.date);
    return {
        ...event,
        date: format(eventDate, "PPPP"), // e.g., "Sunday, June 7, 2020"
        schedule: event.schedule.map(item => `${item.time}: ${item.title}`).join(', '),
        speakers: event.speakers.map(s => `${s.name} (${s.title})`).join(', '),
    };
  }
);


const eventAssistantPrompt = ai.definePrompt({
    name: 'eventAssistantPrompt',
    input: { schema: AnswerQuestionAboutEventInputSchema },
    output: { schema: AnswerQuestionAboutEventOutputSchema },
    tools: [getEventDetailsTool],
    prompt: `You are a friendly and helpful AI assistant for an event platform called Konvele. Your goal is to answer attendee questions about a specific event.

    1. Use the 'getEventDetails' tool with the provided eventId to get all the information about the event.
    2. Use the retrieved event details to answer the user's query.
    3. If the information is not available in the event details, politely state that you do not have that information.
    4. Do not make up information. Be concise and helpful.
    5. The user's question is: "{{query}}"`,
});


const answerQuestionAboutEventFlow = ai.defineFlow(
  {
    name: 'answerQuestionAboutEventFlow',
    inputSchema: AnswerQuestionAboutEventInputSchema,
    outputSchema: AnswerQuestionAboutEventOutputSchema,
  },
  async (input) => {
    const response = await eventAssistantPrompt(input);
    return response.output!;
  }
);

export async function answerQuestionAboutEvent(input: AnswerQuestionAboutEventInput): Promise<AnswerQuestionAboutEventOutput> {
    return await answerQuestionAboutEventFlow(input);
}
