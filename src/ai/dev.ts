import { config } from 'dotenv';
config();

import '@/ai/flows/generate-event-summary.ts';
import '@/ai/flows/send-email-blast.ts';
import '@/ai/flows/event-assistant.ts';
import '@/ai/flows/recommend-events.ts';
import '@/ai/flows/find-mentors.ts';
