
"use client";

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import { getMessages, sendMessage } from '@/lib/chat';
import type { ChatMessage } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';

export function EventChat({ eventId }: { eventId: string }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!eventId) return;
    
    setIsLoading(true);
    const unsubscribe = getMessages(eventId, (newMessages) => {
      setMessages(newMessages);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [eventId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newMessage.trim()) return;

    await sendMessage(eventId, user, newMessage);
    setNewMessage('');
  };
  
  if (isLoading) {
    return <div className="flex justify-center items-center h-48"><Loader2 className="animate-spin h-6 w-6 text-primary" /></div>
  }

  return (
    <div className="flex flex-col h-[60vh]">
      <div className="flex-grow overflow-y-auto pr-4 space-y-4">
        {messages.length === 0 && !isLoading && (
            <p className="text-center text-muted-foreground pt-8">The chat is empty. Start the conversation!</p>
        )}
        {messages.map((message) => (
          <div key={message.id} className="flex items-start gap-3">
             <Link href={`/profile/${message.userId}`}>
                <Avatar className="h-8 w-8">
                <AvatarImage src={message.userPhotoURL ?? undefined} />
                <AvatarFallback>
                    {message.userName.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
                </Avatar>
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <Link href={`/profile/${message.userId}`} className="font-semibold text-sm hover:underline">{message.userName}</Link>
                <p className="text-xs text-muted-foreground">
                   {formatDistanceToNow(message.timestamp.toDate(), { addSuffix: true })}
                </p>
              </div>
              <p className="text-sm">{message.text}</p>
            </div>
          </div>
        ))}
         <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSendMessage} className="mt-4 flex gap-2 pt-4 border-t">
        {user ? (
          <>
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              autoComplete="off"
            />
            <Button type="submit" disabled={!newMessage.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">You must be logged in to chat.</p>
        )}
      </form>
    </div>
  );
}
