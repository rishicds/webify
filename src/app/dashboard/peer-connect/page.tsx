
"use client"

import { useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { findMentors } from '@/ai/flows/find-mentors';
import type { MatchedMentor } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Search, Wand2, User, Star, MessageSquare } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { createOrGetConversation } from '@/lib/messages';
import { useRouter } from 'next/navigation';

function MentorCard({ mentor }: { mentor: MatchedMentor }) {
    const { user } = useAuth();
    const router = useRouter();
    const [isConnecting, setIsConnecting] = useState(false);

    const getInitials = (name?: string | null) => {
        if (!name) return '';
        return name.split(' ').map(n => n[0]).join('');
    }
    
    const handleConnect = async () => {
        if (!user) return;
        setIsConnecting(true);
        try {
            const conversationId = await createOrGetConversation(user.uid, mentor.uid);
            router.push(`/dashboard/messages/${conversationId}`);
        } catch (error) {
            console.error("Failed to start conversation", error);
            setIsConnecting(false);
        }
    }


    return (
        <Card className="flex flex-col">
            <CardHeader className="flex flex-col items-center text-center">
                 <Link href={`/profile/${mentor.uid}`}>
                    <Avatar className="h-20 w-20 border-2 border-primary/50">
                        <AvatarImage src={mentor.photoURL ?? undefined} alt={mentor.displayName ?? ''} />
                        <AvatarFallback className="text-2xl">{getInitials(mentor.displayName)}</AvatarFallback>
                    </Avatar>
                 </Link>
                <CardTitle>
                     <Link href={`/profile/${mentor.uid}`} className="hover:text-primary">
                        {mentor.displayName}
                     </Link>
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-grow space-y-4">
                 <div className="p-3 bg-primary/10 rounded-md border-l-4 border-primary">
                    <p className="text-sm text-primary/90 font-medium">
                        <Wand2 className="inline-block mr-2 h-4 w-4" />
                        {mentor.reason}
                    </p>
                </div>
                <div>
                    <h4 className="font-semibold text-sm mb-2 flex items-center gap-2"><Star className="h-4 w-4" />Skills</h4>
                    <div className="flex flex-wrap gap-1">
                        {mentor.skills?.slice(0,5).map(skill => (
                            <Badge key={skill} variant="secondary">{skill}</Badge>
                        ))}
                         {mentor.skills && mentor.skills.length > 5 && (
                            <Badge variant="outline">+{mentor.skills.length - 5} more</Badge>
                        )}
                    </div>
                </div>
            </CardContent>
            <CardFooter>
                 <Button className="w-full" onClick={handleConnect} disabled={isConnecting}>
                    {isConnecting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <MessageSquare className="mr-2 h-4 w-4"/>}
                    Connect
                </Button>
            </CardFooter>
        </Card>
    )
}

export default function PeerConnectPage() {
    const { user } = useAuth();
    const [skill, setSkill] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [mentors, setMentors] = useState<MatchedMentor[]>([]);
    const [hasSearched, setHasSearched] = useState(false);

    const handleFindMentors = async () => {
        if (!user || !skill.trim()) return;
        setIsLoading(true);
        setHasSearched(true);
        const results = await findMentors({ userId: user.uid, skillToLearn: skill });
        setMentors(results);
        setIsLoading(false);
    }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Peer Connect</h1>
        <p className="text-muted-foreground">
          Find students who can help you learn new skills.
        </p>
      </div>

      <Card>
        <CardHeader>
            <CardTitle>Find a Mentor</CardTitle>
            <CardDescription>What do you want to learn? Enter a skill, topic, or technology.</CardDescription>
        </CardHeader>
        <CardContent>
            <form onSubmit={(e) => { e.preventDefault(); handleFindMentors(); }} className="flex flex-col sm:flex-row gap-2">
                <Input 
                    placeholder="e.g., React, UI/UX Design, Public Speaking..."
                    value={skill}
                    onChange={(e) => setSkill(e.target.value)}
                />
                <Button type="submit" disabled={isLoading || !skill.trim()}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Search className="mr-2 h-4 w-4"/>}
                    Find Mentors
                </Button>
            </form>
        </CardContent>
      </Card>
      
      {isLoading && (
         <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-4 text-muted-foreground">AI is finding the best matches for you...</p>
        </div>
      )}

      {!isLoading && hasSearched && mentors.length > 0 && (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {mentors.map(mentor => (
                <MentorCard key={mentor.uid} mentor={mentor} />
            ))}
        </div>
      )}

      {!isLoading && hasSearched && mentors.length === 0 && (
        <div className="text-center py-16 border border-dashed rounded-lg">
            <User className="mx-auto h-12 w-12 text-muted-foreground" />
            <h2 className="mt-4 text-xl font-semibold">No Matches Found</h2>
            <p className="mt-2 text-muted-foreground">We couldn't find any mentors with that skill. Try a different search term.</p>
        </div>
      )}

    </div>
  );
}
