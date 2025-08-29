import { MessageCircle } from "lucide-react";


export default function MessagesPage() {
    return (
        <div className="flex h-full items-center justify-center rounded-xl bg-muted/50">
            <div className="text-center">
                <MessageCircle className="mx-auto h-12 w-12 text-muted-foreground" />
                <h2 className="mt-4 text-xl font-semibold">Select a conversation</h2>
                <p className="mt-1 text-muted-foreground">Choose one of your conversations from the list to see the messages.</p>
            </div>
        </div>
    )
}
