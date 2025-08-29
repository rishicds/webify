"use client";

import { useState } from 'react';
import {
  generateEventSummary,
  type GenerateEventSummaryInput,
} from '@/ai/flows/generate-event-summary';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Wand2, Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

export function AISummary({ eventTitle, eventId }: { eventTitle: string, eventId: string }) {
  const [summary, setSummary] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    setIsLoading(true);
    setError(null);
    setSummary(null);
    try {
      const input: GenerateEventSummaryInput = {
        eventId,
        eventTitle,
      };
      const result = await generateEventSummary(input);
      setSummary(result.summary);
    } catch (e: any) {
      setError(e.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-4">
       <Card>
        <CardHeader>
          <CardTitle>Generate AI Event Summary</CardTitle>
          <CardDescription>
            Click the button below to automatically analyze this event's attendance, chat, Q&A, and poll data to generate an insightful summary.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <Button onClick={handleGenerate} disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Wand2 className="mr-2 h-4 w-4" />
                )}
                Generate Summary from Event Data
            </Button>
        </CardContent>
       </Card>

      <div className="space-y-4">
        <h3 className="text-xl font-semibold font-headline">Generated Summary</h3>
        {isLoading && (
          <Card>
            <CardContent className="p-6 flex flex-col items-center justify-center h-[400px] text-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">AI is analyzing the event data...</p>
            </CardContent>
          </Card>
        )}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {summary && (
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <Wand2 className="h-5 w-5" />
                AI-Powered Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm dark:prose-invert max-w-none">
                 <p className="whitespace-pre-wrap">{summary}</p>
              </div>
            </CardContent>
          </Card>
        )}
        {!isLoading && !summary && !error && (
          <Card className="border-dashed">
            <CardContent className="p-6 flex items-center justify-center text-center text-muted-foreground h-[400px]">
              <p>Your generated event summary will appear here.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
