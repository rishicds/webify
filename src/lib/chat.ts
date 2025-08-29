import { db } from "./firebase";
import { collection, addDoc, query, where, onSnapshot, orderBy, Timestamp } from "firebase/firestore";
import type { UserData, ChatMessage } from "./types";
import { updateUserScore } from "./gamification";


const messagesCollection = collection(db, "chatMessages");

export async function sendMessage(eventId: string, user: UserData, text: string): Promise<void> {
    if (!text.trim()) return;

    await addDoc(messagesCollection, {
        eventId,
        userId: user.uid,
        userName: user.displayName,
        userPhotoURL: user.photoURL,
        text: text.trim(),
        timestamp: Timestamp.now(),
    });

    await updateUserScore(eventId, user, 1);
}

export function getMessages(eventId: string, callback: (messages: ChatMessage[]) => void) {
    const q = query(
        messagesCollection,
        where("eventId", "==", eventId),
        orderBy("timestamp", "asc")
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const messages = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as ChatMessage));
        callback(messages);
    });

    return unsubscribe;
}
