"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { createPoll, getPolls, getPollVotes, voteInPoll } from '@/lib/engagement';
import type { Poll, Vote, UserData } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { PlusCircle, Loader2, BarChart2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

function PollItem({ poll, isOrganizer, user, votes, eventId }: { poll: Poll; isOrganizer: boolean; user: UserData | null; votes: Vote[], eventId: string }) {
    const totalVotes = votes.length;
    const userVote = votes.find(v => v.userId === user?.uid);

    const getVoteCount = (optionId: string) => {
        return votes.filter(v => v.optionId === optionId).length;
    }

    const handleVote = async (optionId: string) => {
        if (!user) return;
        await voteInPoll(poll.id, optionId, user, eventId);
    }

    return (
        <Card className="bg-secondary/50">
            <CardHeader>
                <CardTitle className="text-lg">{poll.question}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {poll.options.map(option => {
                    const voteCount = getVoteCount(option.id);
                    const percentage = totalVotes > 0 ? (voteCount / totalVotes) * 100 : 0;
                    const isSelected = userVote?.optionId === option.id;

                    return (
                        <div key={option.id}>
                            <div className="flex justify-between items-center mb-1 text-sm">
                                <span className="font-medium">{option.text}</span>
                                <span className="text-muted-foreground">{voteCount} votes ({percentage.toFixed(0)}%)</span>
                            </div>
                             <button
                                onClick={() => handleVote(option.id)}
                                disabled={!user || isOrganizer}
                                className="w-full text-left group"
                             >
                                <div className="relative">
                                    <Progress value={percentage} className="h-8" />
                                    {isSelected && (
                                        <div className="absolute inset-0 bg-primary/30 rounded-full border-2 border-primary"></div>
                                    )}
                                </div>
                             </button>
                        </div>
                    );
                })}
            </CardContent>
            <CardFooter>
                 <p className="text-xs text-muted-foreground">{totalVotes} total votes.</p>
            </CardFooter>
        </Card>
    )
}

function CreatePollForm({ eventId, onPollCreated }: { eventId: string; onPollCreated: () => void }) {
    const [question, setQuestion] = useState('');
    const [options, setOptions] = useState(['', '']);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleOptionChange = (index: number, value: string) => {
        const newOptions = [...options];
        newOptions[index] = value;
        setOptions(newOptions);
    };

    const addOption = () => {
        setOptions([...options, '']);
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        await createPoll(eventId, question, options);
        setQuestion('');
        setOptions(['', '']);
        setIsSubmitting(false);
        onPollCreated();
    }

    return (
        <Card>
            <form onSubmit={handleSubmit}>
                <CardHeader>
                    <CardTitle>Create New Poll</CardTitle>
                    <CardDescription>Engage your attendees with a live poll.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Input 
                        placeholder="Poll Question"
                        value={question}
                        onChange={e => setQuestion(e.target.value)}
                        required
                    />
                    <div className="space-y-2">
                        {options.map((opt, index) => (
                            <Input 
                                key={index}
                                placeholder={`Option ${index + 1}`}
                                value={opt}
                                onChange={e => handleOptionChange(index, e.target.value)}
                                required
                            />
                        ))}
                    </div>
                     <Button type="button" variant="outline" size="sm" onClick={addOption}>
                        <PlusCircle className="mr-2 h-4 w-4"/> Add Option
                    </Button>
                </CardContent>
                <CardFooter>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                        Create Poll
                    </Button>
                </CardFooter>
            </form>
        </Card>
    )
}


export function Polls({ eventId, isOrganizer }: { eventId: string; isOrganizer: boolean }) {
  const { user } = useAuth();
  const [polls, setPolls] = useState<Poll[]>([]);
  const [votes, setVotes] = useState<{[pollId: string]: Vote[]}>({});
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    const unsubscribePolls = getPolls(eventId, (newPolls) => {
      setPolls(newPolls);
      setIsLoading(false);
    });
    return () => unsubscribePolls();
  }, [eventId]);

  useEffect(() => {
      if (polls.length === 0) return;

      const unsubscribers = polls.map(poll => {
          return getPollVotes(poll.id, newVotes => {
              setVotes(prevVotes => ({
                  ...prevVotes,
                  [poll.id]: newVotes
              }));
          });
      });

      return () => unsubscribers.forEach(unsub => unsub());

  }, [polls]);

  if (isLoading) {
    return <div className="flex justify-center items-center h-48"><Loader2 className="animate-spin h-6 w-6 text-primary" /></div>
  }

  return (
    <div className="h-[60vh] flex flex-col">
       {isOrganizer && (
         <div className="mb-4">
            {showCreateForm ? (
                <CreatePollForm eventId={eventId} onPollCreated={() => setShowCreateForm(false)}/>
            ) : (
                <Button onClick={() => setShowCreateForm(true)}>
                    <PlusCircle className="mr-2 h-4 w-4"/> Create New Poll
                </Button>
            )}
         </div>
       )}
      <div className="flex-grow overflow-y-auto pr-4 space-y-4">
        {polls.length === 0 && !isLoading && (
             <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                 <BarChart2 className="h-12 w-12 mb-4" />
                <p className="text-center">No polls have been created yet.</p>
                {isOrganizer && <p className="text-sm">Click the button above to create one.</p>}
            </div>
        )}
        {polls.map((poll) => (
          <PollItem 
            key={poll.id} 
            poll={poll} 
            isOrganizer={isOrganizer} 
            user={user} 
            votes={votes[poll.id] || []}
            eventId={eventId}
          />
        ))}
      </div>
    </div>
  );
}
