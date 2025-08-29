import { db } from "./firebase";
import { 
    collection, 
    addDoc, 
    query, 
    where, 
    orderBy, 
    onSnapshot, 
    Timestamp,
    doc,
    getDocs,
    writeBatch
} from "firebase/firestore";
import type { Conversation, Message, UserData } from "./types";
import { getUserById } from "./users";


const conversationsCollection = collection(db, "conversations");

// --- Conversation Functions ---

export async function createOrGetConversation(userId1: string, userId2: string): Promise<string> {
    // Check if a conversation between these two users already exists
    const q = query(
        conversationsCollection, 
        where('participantIds', 'array-contains', userId1)
    );
    
    const querySnapshot = await getDocs(q);
    const existingConversation = querySnapshot.docs
        .map(d => ({id: d.id, ...d.data()} as Conversation))
        .find(c => c.participantIds.includes(userId2));

    if (existingConversation) {
        return existingConversation.id;
    }

    // Create a new conversation
    const user1Data = await getUserById(userId1);
    const user2Data = await getUserById(userId2);

    if (!user1Data || !user2Data) {
        throw new Error("One or both users not found");
    }

    const newConversationData = {
        participantIds: [userId1, userId2],
        participants: {
            [userId1]: { displayName: user1Data.displayName, photoURL: user1Data.photoURL },
            [userId2]: { displayName: user2Data.displayName, photoURL: user2Data.photoURL },
        },
        lastMessage: "Conversation started.",
        lastMessageTimestamp: Timestamp.now(),
        lastMessageSenderId: '', // System message
    };

    const docRef = await addDoc(conversationsCollection, newConversationData);
    return docRef.id;
}


export function getConversationsForUser(userId: string, callback: (conversations: Conversation[]) => void) {
    const q = query(
        conversationsCollection, 
        where('participantIds', 'array-contains', userId),
        orderBy('lastMessageTimestamp', 'desc')
    );

    return onSnapshot(q, (querySnapshot) => {
        const conversations = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Conversation));
        callback(conversations);
    });
}


// --- Message Functions ---

export function getMessagesForConversation(conversationId: string, callback: (messages: Message[]) => void) {
    const messagesCollectionRef = collection(db, "conversations", conversationId, "messages");
    const q = query(messagesCollectionRef, orderBy('timestamp', 'asc'));

    return onSnapshot(q, (querySnapshot) => {
        const messages = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Message));
        callback(messages);
    });
}


export async function sendMessage(conversationId: string, senderId: string, text: string) {
    if (!text.trim()) return;

    const batch = writeBatch(db);

    // 1. Add new message to the messages sub-collection
    const messagesCollectionRef = collection(db, "conversations", conversationId, "messages");
    const newMessageRef = doc(messagesCollectionRef);
    batch.set(newMessageRef, {
        conversationId,
        senderId,
        text,
        timestamp: Timestamp.now(),
    });

    // 2. Update the last message on the parent conversation document
    const conversationRef = doc(db, "conversations", conversationId);
    batch.update(conversationRef, {
        lastMessage: text,
        lastMessageTimestamp: Timestamp.now(),
        lastMessageSenderId: senderId,
    });

    await batch.commit();
}