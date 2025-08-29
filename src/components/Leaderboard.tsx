"use client";

import { useState, useEffect } from 'react';
import { getLeaderboard } from '@/lib/gamification';
import type { LeaderboardEntry } from '@/lib/types';
import { Loader2, Trophy, Medal } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export function Leaderboard({ eventId }: { eventId: string }) {
    const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = getLeaderboard(eventId, (newEntries) => {
            setEntries(newEntries);
            setIsLoading(false);
        });
        return () => unsubscribe();
    }, [eventId]);

    if (isLoading) {
        return <div className="flex justify-center items-center h-48"><Loader2 className="animate-spin h-6 w-6 text-primary" /></div>
    }

    const getRankColor = (rank: number) => {
        if (rank === 0) return "text-yellow-400";
        if (rank === 1) return "text-gray-400";
        if (rank === 2) return "text-yellow-600";
        return "text-muted-foreground";
    }

    return (
        <div className="h-[60vh] overflow-y-auto pr-4 space-y-2">
            {entries.length === 0 && !isLoading && (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                    <Trophy className="h-12 w-12 mb-4" />
                    <p className="text-center">The leaderboard is empty.</p>
                    <p className="text-sm">Participate in the chat, Q&A, and polls to earn points!</p>
                </div>
            )}
            {entries.map((entry, index) => (
                <div key={entry.id} className="flex items-center gap-4 p-3 rounded-lg bg-secondary/50">
                    <div className={`font-bold text-lg w-8 text-center ${getRankColor(index)}`}>
                        {index < 3 ? <Medal className="h-6 w-6 mx-auto" /> : index + 1}
                    </div>
                    <Avatar className="h-10 w-10">
                        <AvatarImage src={entry.userPhotoURL ?? undefined} />
                        <AvatarFallback>
                            {entry.userName?.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-grow">
                        <p className="font-semibold">{entry.userName}</p>
                    </div>
                    <div className="font-bold text-primary text-lg">
                        {entry.score} pts
                    </div>
                </div>
            ))}
        </div>
    )
}
