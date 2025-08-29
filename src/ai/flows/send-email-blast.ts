'use server';

/**
 * @fileOverview A flow to send an email blast to all attendees of an event.
 *
 * - sendEmailBlast - A function that handles sending the email blast.
 */

import { ai } from '@/ai/genkit';
import { getEventAttendees } from '@/lib/events';
import { z } from 'genkit';

const SendEmailBlastInputSchema = z.object({
  eventId: z.string().describe('The ID of the event.'),
  subject: z.string().describe('The subject of the email.'),
  body: z.string().describe('The body of the email (can be HTML).'),
});

type SendEmailBlastInput = z.infer<typeof SendEmailBlastInputSchema>;

// This is a placeholder for a real email sending function.
// In a real-world app, this would use a service like SendGrid, Mailgun, or Nodemailer.
const sendEmailTool = ai.defineTool(
    {
        name: 'sendEmail',
        description: 'Sends an email to a recipient.',
        inputSchema: z.object({
            to: z.string().describe('The email address of the recipient.'),
            subject: z.string().describe('The subject of the email.'),
            body: z.string().describe('The HTML body of the email.'),
        }),
        outputSchema: z.object({
            success: z.boolean(),
        }),
    },
    async (input) => {
        console.log(`--- Sending Email (Placeholder) to ${input.to} ---`);
        console.log(`Subject: ${input.subject}`);
        // In a real app, you'd integrate your email service here.
        return { success: true };
    }
);


const sendEmailBlastFlow = ai.defineFlow(
  {
    name: 'sendEmailBlastFlow',
    inputSchema: SendEmailBlastInputSchema,
    outputSchema: z.void(),
  },
  async (input) => {
    const attendees = await getEventAttendees(input.eventId);
    
    if (attendees.length === 0) {
        console.log("No attendees to email for this event.");
        return;
    }

    const emailPromises = attendees.map(attendee => {
        if (!attendee.userEmail) return Promise.resolve();

        return sendEmailTool({
            to: attendee.userEmail,
            subject: input.subject,
            body: input.body,
        });
    });

    await Promise.all(emailPromises);
  }
);

export async function sendEmailBlast(input: SendEmailBlastInput): Promise<void> {
    return await sendEmailBlastFlow(input);
}
