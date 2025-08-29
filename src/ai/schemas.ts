import { z } from 'genkit';

/**
 * @fileOverview Shared schemas and types for AI flows
 */

// Find Mentors Flow
export const FindMentorsInputSchema = z.object({
  userId: z.string().describe('The ID of the user searching for a mentor.'),
  skillToLearn: z.string().describe('The skill or topic the user wants to learn.'),
});
export type FindMentorsInput = z.infer<typeof FindMentorsInputSchema>;

export const FindMentorsOutputSchema = z.object({
  matches: z.array(z.object({
    uid: z.string().describe("The user ID of the matched mentor."),
    reason: z.string().describe("A short, personalized reason why this person is a good match."),
  })).describe('A list of up to 5 potential mentors.'),
});
export type FindMentorsOutput = z.infer<typeof FindMentorsOutputSchema>;

// Event Assistant Flow
export const AnswerQuestionAboutEventInputSchema = z.object({
  eventId: z.string().describe('The ID of the event.'),
  query: z.string().describe('The user\'s question about the event.'),
});
export type AnswerQuestionAboutEventInput = z.infer<typeof AnswerQuestionAboutEventInputSchema>;

export const AnswerQuestionAboutEventOutputSchema = z.object({
  answer: z.string().describe('The answer to the user\'s question about the event.'),
});
export type AnswerQuestionAboutEventOutput = z.infer<typeof AnswerQuestionAboutEventOutputSchema>;

// Recommend Events Flow
export const RecommendEventsInputSchema = z.object({
  userId: z.string().describe('The ID of the user to get recommendations for.'),
});
export type RecommendEventsInput = z.infer<typeof RecommendEventsInputSchema>;

export const RecommendEventsOutputSchema = z.object({
  recommendations: z.array(z.object({
    id: z.string().describe('The ID of the recommended event.'),
    title: z.string().describe('The title of the recommended event.'),
    reason: z.string().describe('A short, compelling reason why the user might be interested in this event.')
  })).describe('A list of recommended events.'),
});
export type RecommendEventsOutput = z.infer<typeof RecommendEventsOutputSchema>;

// Generate Event Summary Flow
export const GenerateEventSummaryInputSchema = z.object({
  eventId: z.string().describe('The ID of the event to summarize.'),
  eventTitle: z.string().describe('The title of the event.'),
});
export type GenerateEventSummaryInput = z.infer<typeof GenerateEventSummaryInputSchema>;

export const GenerateEventSummaryOutputSchema = z.object({
  summary: z.string().describe('A summary of the event, including key feedback, attendance insights, and engagement metrics.'),
});
export type GenerateEventSummaryOutput = z.infer<typeof GenerateEventSummaryOutputSchema>;

// Send Email Blast Flow
export const SendEmailBlastInputSchema = z.object({
  eventId: z.string().describe('The ID of the event.'),
  subject: z.string().describe('The subject of the email.'),
  body: z.string().describe('The body of the email (can be HTML).'),
});
export type SendEmailBlastInput = z.infer<typeof SendEmailBlastInputSchema>;
