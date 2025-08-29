
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import { askQuestion, getQuestions, toggleUpvoteQuestion, markQuestionAsAnswered } from '@/lib/engagement';
import type { Question } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, ThumbsUp, Check, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';

export function QandA({ eventId, isOrganizer }: { eventId: string; isOrganizer: boolean }) {
  const { user } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = getQuestions(eventId, (newQuestions) => {
      setQuestions(newQuestions);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, [eventId]);

  const handleAskQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newQuestion.trim()) return;
    await askQuestion(eventId, user, newQuestion);
    setNewQuestion('');
  };

  const handleUpvote = async (questionId: string) => {
    if (!user) return;
    await toggleUpvoteQuestion(questionId, user.uid);
  };

  const handleMarkAsAnswered = async (questionId: string, isAnswered: boolean) => {
     await markQuestionAsAnswered(questionId, isAnswered);
  }

  if (isLoading) {
    return <div className="flex justify-center items-center h-48"><Loader2 className="animate-spin h-6 w-6 text-primary" /></div>
  }

  return (
    <div className="flex flex-col h-[60vh]">
      <div className="flex-grow overflow-y-auto pr-4 space-y-4">
        {questions.length === 0 && !isLoading && (
            <p className="text-center text-muted-foreground pt-8">No questions yet. Be the first to ask!</p>
        )}
        {questions.map((q) => (
          <div key={q.id} className={`p-4 rounded-lg flex items-start gap-4 transition-colors ${q.isAnswered ? 'bg-green-500/10' : 'bg-secondary/50'}`}>
            <div className="flex flex-col items-center gap-1">
                 <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleUpvote(q.id)}
                    disabled={!user}
                    className={`flex flex-col h-auto px-2 py-1 ${q.upvotedBy?.includes(user?.uid ?? '') ? 'text-primary' : ''}`}
                 >
                    <ThumbsUp className="h-5 w-5"/>
                    <span className="text-sm font-bold">{q.upvotes}</span>
                 </Button>
                 {isOrganizer && (
                     <Button
                        variant="ghost"
                        size="icon"
                        className={`h-8 w-8 rounded-full ${q.isAnswered ? 'bg-green-500/80 text-white hover:bg-green-600' : ''}`}
                        onClick={() => handleMarkAsAnswered(q.id, !q.isAnswered)}
                     >
                        <Check className="h-5 w-5"/>
                     </Button>
                 )}
            </div>
            <div className="flex-grow">
              <div className="flex items-center gap-2">
                <Link href={`/profile/${q.userId}`}>
                    <Avatar className="h-6 w-6">
                    <AvatarImage src={q.userPhotoURL ?? undefined} />
                    <AvatarFallback>
                        {q.userName?.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                    </Avatar>
                </Link>
                <Link href={`/profile/${q.userId}`} className="font-semibold text-sm hover:underline">{q.userName}</Link>
                <p className="text-xs text-muted-foreground">
                   {formatDistanceToNow(q.timestamp.toDate(), { addSuffix: true })}
                </p>
              </div>
              <p className="text-sm mt-1">{q.text}</p>
            </div>
          </div>
        ))}
      </div>
       {user && (
        <form onSubmit={handleAskQuestion} className="mt-4 flex gap-2 pt-4 border-t">
            <Textarea
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              placeholder="Ask a question..."
              rows={1}
              className="min-h-0"
            />
            <Button type="submit" disabled={!newQuestion.trim()}>
              <Send className="h-4 w-4" />
            </Button>
        </form>
      )}
    </div>
  );
}
