"use client"

import { useAuth } from "@/components/AuthProvider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getMessagesForConversation, sendMessage } from "@/lib/messages";
import { Message } from "@/lib/types";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { Loader2, Send } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export default function ConversationPage({ params }: { params: { conversationId: string } }) {
    const { user } = useAuth();
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const unsubscribe = getMessagesForConversation(params.conversationId, (newMessages) => {
            setMessages(newMessages);
            setLoading(false);
        });
        return () => unsubscribe();
    }, [params.conversationId]);

     useEffect(() => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTo({
                top: scrollAreaRef.current.scrollHeight,
            });
        }
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !newMessage.trim()) return;
        await sendMessage(params.conversationId, user.uid, newMessage);
        setNewMessage("");
    }

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }
    
    return (
        <Card className="h-full flex flex-col">
            <CardHeader className="border-b">
                {/* Header can be dynamic with other participant's info */}
                <h2 className="font-semibold">Conversation</h2>
            </CardHeader>
            <CardContent className="flex-grow p-4 overflow-hidden">
                <ScrollArea className="h-full pr-4" ref={scrollAreaRef}>
                    <div className="space-y-4">
                        {messages.map((message, index) => {
                            const isSender = message.senderId === user?.uid;
                            const prevMessage = messages[index-1];
                            // Show avatar only for first message in a sequence from a sender
                            const showAvatar = !prevMessage || prevMessage.senderId !== message.senderId;

                            return (
                                <div key={message.id} className={cn("flex items-end gap-2", isSender ? "justify-end" : "")}>
                                    {!isSender && (
                                        <Link href={`/profile/${message.senderId}`}>
                                             <Avatar className={cn("h-8 w-8", showAvatar ? "opacity-100" : "opacity-0")}>
                                                {/* <AvatarImage src={} /> */}
                                                <AvatarFallback>{'U'}</AvatarFallback>
                                            </Avatar>
                                        </Link>
                                    )}
                                    <div className={cn("max-w-xs md:max-w-md lg:max-w-lg p-3 rounded-lg", isSender ? "bg-primary text-primary-foreground" : "bg-secondary")}>
                                        <p className="text-sm">{message.text}</p>
                                        <p className="text-xs text-right mt-1 opacity-70">
                                            {formatDistanceToNow(message.timestamp.toDate(), {addSuffix: true})}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </ScrollArea>
            </CardContent>
            <CardFooter className="pt-4 border-t">
                <form onSubmit={handleSendMessage} className="w-full flex gap-2">
                    <Input 
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                    />
                    <Button type="submit" size="icon" disabled={!newMessage.trim()}>
                        <Send />
                    </Button>
                </form>
            </CardFooter>
        </Card>
    )
}
