"use client"

import { useAuth } from "@/components/AuthProvider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getConversationsForUser } from "@/lib/messages";
import { Conversation } from "@/lib/types";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

function ConversationList() {
    const { user } = useAuth();
    const pathname = usePathname();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        const unsubscribe = getConversationsForUser(user.uid, (newConversations) => {
            setConversations(newConversations);
            setLoading(false);
        });
        return () => unsubscribe();
    }, [user]);

    if (loading) {
        return <div className="flex justify-center items-center h-full"><Loader2 className="animate-spin" /></div>
    }

    if (conversations.length === 0) {
        return <div className="text-center text-sm text-muted-foreground p-4">No conversations yet. Find a mentor in Peer Connect to start a chat!</div>
    }

    const getInitials = (name?: string | null) => {
        if (!name) return '';
        return name.split(' ').map(n => n[0]).join('');
    }

    return (
        <nav className="flex flex-col gap-1 p-2">
            {conversations.map(convo => {
                const otherParticipantId = convo.participantIds.find(id => id !== user?.uid);
                if (!otherParticipantId) return null;

                const otherParticipant = convo.participants[otherParticipantId];
                const isActive = pathname.endsWith(convo.id);
                const isUnread = convo.lastMessageSenderId !== user?.uid;

                return (
                    <Link
                        key={convo.id}
                        href={`/dashboard/messages/${convo.id}`}
                        className={cn(
                            "flex items-start gap-3 rounded-lg p-3 text-left text-sm transition-all hover:bg-accent",
                            isActive && "bg-accent"
                        )}
                    >
                        <Avatar className="h-10 w-10">
                            <AvatarImage src={otherParticipant.photoURL ?? undefined} alt={otherParticipant.displayName ?? ''} />
                            <AvatarFallback>{getInitials(otherParticipant.displayName)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 overflow-hidden">
                            <div className="flex items-center justify-between">
                                <p className="font-semibold truncate">{otherParticipant.displayName}</p>
                                <p className={cn("text-xs", isActive ? "text-foreground" : "text-muted-foreground")}>
                                    {formatDistanceToNow(convo.lastMessageTimestamp.toDate(), { addSuffix: true })}
                                </p>
                            </div>
                            <p className={cn("text-xs truncate", isActive ? "text-foreground" : "text-muted-foreground", isUnread && !isActive && "font-bold text-foreground")}>
                                {convo.lastMessageSenderId === user?.uid && "You: "}
                                {convo.lastMessage}
                            </p>
                        </div>
                    </Link>
                );
            })}
        </nav>
    )
}


export default function MessagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <div className="grid md:grid-cols-[300px_1fr] lg:grid-cols-[350px_1fr] gap-4 h-[calc(100vh-8rem)]">
        <Card className="h-full flex flex-col">
             <CardHeader>
                <CardTitle>Messages</CardTitle>
            </CardHeader>
             <CardContent className="p-0 flex-grow overflow-hidden">
                <ScrollArea className="h-full">
                    <ConversationList />
                </ScrollArea>
             </CardContent>
        </Card>
        
        <div className="h-full">
            {children}
        </div>
    </div>
  );
}
