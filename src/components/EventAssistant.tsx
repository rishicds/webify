"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { MessageCircle, Send, X, Loader2, Bot } from "lucide-react";
import { answerQuestionAboutEvent } from "@/ai/flows/event-assistant";
import { useAuth } from "./AuthProvider";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";


type Message = {
    sender: 'user' | 'bot';
    text: string;
};

export function EventAssistant() {
    const pathname = usePathname();
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [eventId, setEventId] = useState<string | null>(null);

    const scrollAreaRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const match = pathname.match(/^\/events\/([a-zA-Z0-9]+)/);
        if (match) {
            setEventId(match[1]);
        } else {
            setEventId(null);
        }
        setIsOpen(false); // Close on page change
        setMessages([]); // Clear messages on page change
    }, [pathname]);

    useEffect(() => {
        // Scroll to bottom when new messages are added
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTo({
                top: scrollAreaRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    }, [messages]);


    const handleSend = async () => {
        if (!input.trim() || !eventId) return;

        const userMessage: Message = { sender: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const result = await answerQuestionAboutEvent({ eventId, query: input });
            const botMessage: Message = { sender: 'bot', text: result.answer };
            setMessages(prev => [...prev, botMessage]);
        } catch (error) {
            const errorMessage: Message = { sender: 'bot', text: "Sorry, I encountered an error. Please try again." };
            setMessages(prev => [...prev, errorMessage]);
            console.error("AI assistant error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    if (!eventId) {
        return null; // Don't render the chatbot if not on an event page
    }

    return (
        <div className="fixed bottom-4 right-4 z-50">
            {isOpen ? (
                <Card className="w-80 h-[28rem] flex flex-col shadow-2xl">
                    <CardHeader className="flex flex-row items-center justify-between p-4 border-b">
                        <div className="flex items-center gap-2">
                            <Bot className="h-6 w-6 text-primary" />
                            <CardTitle className="text-lg">Event Assistant</CardTitle>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                            <X className="h-4 w-4" />
                        </Button>
                    </CardHeader>
                    <CardContent className="p-4 flex-grow overflow-hidden">
                        <ScrollArea className="h-full pr-4" ref={scrollAreaRef}>
                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <Avatar className="h-8 w-8 bg-primary text-primary-foreground">
                                        <Bot className="h-5 w-5 m-auto" />
                                    </Avatar>
                                    <div className="bg-secondary p-3 rounded-lg rounded-tl-none max-w-[80%]">
                                        <p className="text-sm">Hi! How can I help you with this event?</p>
                                    </div>
                                </div>

                                {messages.map((message, index) => (
                                    <div key={index} className={`flex items-start gap-3 ${message.sender === 'user' ? 'justify-end' : ''}`}>
                                        {message.sender === 'bot' && (
                                             <Avatar className="h-8 w-8 bg-primary text-primary-foreground">
                                                <Bot className="h-5 w-5 m-auto" />
                                            </Avatar>
                                        )}
                                        <div className={`p-3 rounded-lg max-w-[80%] ${message.sender === 'user' ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-secondary rounded-tl-none'}`}>
                                            <p className="text-sm">{message.text}</p>
                                        </div>
                                         {message.sender === 'user' && (
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src={user?.photoURL ?? undefined} />
                                                <AvatarFallback>{user?.displayName?.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                            </Avatar>
                                        )}
                                    </div>
                                ))}
                                {isLoading && (
                                    <div className="flex items-start gap-3">
                                        <Avatar className="h-8 w-8 bg-primary text-primary-foreground">
                                            <Bot className="h-5 w-5 m-auto" />
                                        </Avatar>
                                        <div className="bg-secondary p-3 rounded-lg rounded-tl-none">
                                            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    </CardContent>
                    <CardFooter className="p-4 border-t">
                        <form
                            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                            className="flex w-full gap-2"
                        >
                            <Input
                                placeholder="Ask a question..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                disabled={isLoading}
                                autoComplete="off"
                            />
                            <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
                                <Send className="h-4 w-4" />
                            </Button>
                        </form>
                    </CardFooter>
                </Card>
            ) : (
                <Button onClick={() => setIsOpen(true)} size="lg" className="rounded-full shadow-2xl h-14 w-14 p-0">
                    <MessageCircle className="h-7 w-7" />
                </Button>
            )}
        </div>
    );
}
