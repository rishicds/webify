'use server';

/**
 * @fileOverview Generates a post-event summary using AI by analyzing chat, Q&A, polls, and attendance data.
 *
 * - generateEventSummary - A function that generates the event summary.
 */

import {ai} from '@/ai/genkit';
import { z } from 'genkit';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import type { ChatMessage, Poll, Question, Registration, Vote } from '@/lib/types';

const GenerateEventSummaryInputSchema = z.object({
  eventId: z.string().describe('The ID of the event to summarize.'),
  eventTitle: z.string().describe('The title of the event.'),
});

const GenerateEventSummaryOutputSchema = z.object({
  summary: z.string().describe('A summary of the event, including key feedback, attendance insights, and engagement metrics.'),
});

type GenerateEventSummaryInput = z.infer<typeof GenerateEventSummaryInputSchema>;
type GenerateEventSummaryOutput = z.infer<typeof GenerateEventSummaryOutputSchema>;

// Helper function to fetch data for the event
async function getEventData(eventId: string) {
    const registrationsQuery = query(collection(db, "registrations"), where("eventId", "==", eventId));
    const chatMessagesQuery = query(collection(db, "chatMessages"), where("eventId", "==", eventId));
    const questionsQuery = query(collection(db, "questions"), where("eventId", "==", eventId));
    const pollsQuery = query(collection(db, "polls"), where("eventId", "==", eventId));

    const [registrationsSnapshot, chatSnapshot, questionsSnapshot, pollsSnapshot] = await Promise.all([
        getDocs(registrationsQuery),
        getDocs(chatMessagesQuery),
        getDocs(questionsQuery),
        getDocs(pollsQuery),
    ]);

    const registrations = registrationsSnapshot.docs.map(doc => doc.data() as Registration);
    const chatMessages = chatSnapshot.docs.map(doc => doc.data() as ChatMessage);
    const questions = questionsSnapshot.docs.map(doc => doc.data() as Question);
    const polls = pollsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Poll));

    const pollVotes: { [key: string]: Vote[] } = {};
    for (const poll of polls) {
        const votesQuery = query(collection(db, "votes"), where("pollId", "==", poll.id));
        const votesSnapshot = await getDocs(votesQuery);
        pollVotes[poll.id] = votesSnapshot.docs.map(doc => doc.data() as Vote);
    }
    
    return { registrations, chatMessages, questions, polls, pollVotes };
}


const generateEventSummaryFlow = ai.defineFlow(
  {
    name: 'generateEventSummaryFlow',
    inputSchema: GenerateEventSummaryInputSchema,
    outputSchema: GenerateEventSummaryOutputSchema,
  },
  async ({ eventId, eventTitle }) => {
    const { registrations, chatMessages, questions, polls, pollVotes } = await getEventData(eventId);

    // 1. Analyze Attendance
    const totalRegistrations = registrations.length;
    const checkedInCount = registrations.filter(r => r.checkedIn).length;
    const checkInRate = totalRegistrations > 0 ? (checkedInCount / totalRegistrations) * 100 : 0;
    const attendanceAnalysis = `Total Registered: ${totalRegistrations}\nTotal Checked-in: ${checkedInCount}\nCheck-in Rate: ${checkInRate.toFixed(1)}%`;

    // 2. Format Chat Transcript
    const chatTranscript = chatMessages.map(m => `${m.userName}: ${m.text}`).join('\n') || "No chat messages.";

    // 3. Format Q&A Transcript
    const qaTranscript = questions
        .sort((a,b) => b.upvotes - a.upvotes)
        .map(q => `(Upvotes: ${q.upvotes}) ${q.userName}: ${q.text} ${q.isAnswered ? "[Answered]" : ""}`)
        .join('\n') || "No questions were asked.";

    // 4. Format Poll Results
    const pollResults = polls.map(poll => {
        const totalVotes = pollVotes[poll.id]?.length || 0;
        const optionsResults = poll.options.map(option => {
            const voteCount = pollVotes[poll.id]?.filter(v => v.optionId === option.id).length || 0;
            const percentage = totalVotes > 0 ? (voteCount / totalVotes) * 100 : 0;
            return `${option.text}: ${voteCount} votes (${percentage.toFixed(0)}%)`;
        }).join(', ');
        return `Poll: "${poll.question}"\nResults: ${optionsResults}\nTotal Votes: ${totalVotes}`;
    }).join('\n\n') || "No polls were conducted.";


    const prompt = ai.definePrompt({
        name: 'generateEventSummaryPrompt',
        input: {schema: z.object({
            eventTitle: z.string(),
            attendanceAnalysis: z.string(),
            chatTranscript: z.string(),
            qaTranscript: z.string(),
            pollResults: z.string(),
        })},
        output: {schema: GenerateEventSummaryOutputSchema},
        prompt: `You are an AI assistant that generates insightful post-event summaries for event organizers.

Analyze the provided data for the event titled "{{eventTitle}}". Generate a concise and informative summary that highlights key aspects of the event.

Your summary should be structured with the following sections:
1.  **Attendance Summary**: Briefly describe the registration and check-in numbers. Note any significant trends.
2.  **Key Discussion Topics**: Identify the main themes and topics discussed in the live chat. What were the most talked-about subjects?
3.  **Audience Questions**: Summarize the most upvoted or frequently asked questions from the Q&A session. What was the audience most curious about?
4.  **Poll Insights**: Describe the results of any polls conducted. What do the results indicate about audience opinion or knowledge?
5.  **Overall Engagement**: Provide a brief, overall conclusion about the event's engagement level based on all the data.

Here is the data:

**Attendance Data:**
{{{attendanceAnalysis}}}

**Chat Transcript:**
{{{chatTranscript}}}

**Q&A Transcript:**
{{{qaTranscript}}}

**Poll Results:**
{{{pollResults}}}

Generate the summary now.`,
    });

    const {output} = await prompt({
        eventTitle,
        attendanceAnalysis,
        chatTranscript,
        qaTranscript,
        pollResults,
    });
    return output!;
  }
);


export async function generateEventSummary(input: GenerateEventSummaryInput): Promise<GenerateEventSummaryOutput> {
  return generateEventSummaryFlow(input);
}