import { db } from "./firebase";
import { 
    collection, 
    addDoc, 
    query, 
    where, 
    onSnapshot, 
    orderBy, 
    Timestamp,
    doc,
    updateDoc,
    increment,
    arrayUnion,
    arrayRemove,
    getDocs,
    getDoc,
    writeBatch
} from "firebase/firestore";
import type { UserData, Question, Poll, PollOption, Vote } from "./types";
import { updateUserScore } from "./gamification";

const questionsCollection = collection(db, "questions");
const pollsCollection = collection(db, "polls");
const votesCollection = collection(db, "votes");


// --- Q&A Functions ---

export async function askQuestion(eventId: string, user: UserData, text: string): Promise<void> {
    if (!text.trim()) return;

    await addDoc(questionsCollection, {
        eventId,
        userId: user.uid,
        userName: user.displayName,
        userPhotoURL: user.photoURL,
        text: text.trim(),
        upvotes: 0,
        upvotedBy: [],
        isAnswered: false,
        timestamp: Timestamp.now(),
    });

    await updateUserScore(eventId, user, 10);
}

export function getQuestions(eventId: string, callback: (questions: Question[]) => void) {
    const q = query(
        questionsCollection,
        where("eventId", "==", eventId),
        orderBy("isAnswered", "asc"),
        orderBy("upvotes", "desc"),
        orderBy("timestamp", "desc")
    );

    return onSnapshot(q, (querySnapshot) => {
        const questions = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Question));
        callback(questions);
    });
}

export async function toggleUpvoteQuestion(questionId: string, userId: string) {
    const questionRef = doc(db, "questions", questionId);
    const questionDoc = await getDoc(questionRef);
    if (!questionDoc.exists()) return;

    const upvotedBy = questionDoc.data().upvotedBy || [];
    const isUpvoted = upvotedBy.includes(userId);

    await updateDoc(questionRef, {
        upvotes: increment(isUpvoted ? -1 : 1),
        upvotedBy: isUpvoted ? arrayRemove(userId) : arrayUnion(userId),
    });
}

export async function markQuestionAsAnswered(questionId: string, isAnswered: boolean) {
    const questionRef = doc(db, "questions", questionId);
    await updateDoc(questionRef, { isAnswered });
}


// --- Polls Functions ---

export async function createPoll(eventId: string, question: string, options: string[]) {
    if (!question.trim() || options.length < 2) return;

    const pollOptions: PollOption[] = options
      .filter(opt => opt.trim() !== '')
      .map((opt, index) => ({ id: `option_${index + 1}`, text: opt.trim() }));
      
    if (pollOptions.length < 2) return;

    await addDoc(pollsCollection, {
        eventId,
        question,
        options: pollOptions,
        timestamp: Timestamp.now(),
    });
}

export function getPolls(eventId: string, callback: (polls: Poll[]) => void) {
    const q = query(
        pollsCollection,
        where("eventId", "==", eventId),
        orderBy("timestamp", "desc")
    );

    return onSnapshot(q, (querySnapshot) => {
        const polls = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Poll));
        callback(polls);
    });
}

export function getPollVotes(pollId: string, callback: (votes: Vote[]) => void) {
    const q = query(votesCollection, where("pollId", "==", pollId));
    return onSnapshot(q, (querySnapshot) => {
        const votes = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Vote));
        callback(votes);
    });
}


export async function voteInPoll(pollId: string, optionId: string, user: UserData, eventId: string) {
    // Check if the user has already voted on this poll
    const q = query(votesCollection, where("pollId", "==", pollId), where("userId", "==", user.uid));
    const existingVotes = await getDocs(q);

    if (!existingVotes.empty && existingVotes.docs[0].data().optionId === optionId) {
        return; // User is voting for the same option again, do nothing.
    }
    
    const batch = writeBatch(db);

    let hadPreviousVote = false;
    // If user has voted before, remove their old vote
    existingVotes.forEach(doc => {
        hadPreviousVote = true;
        batch.delete(doc.ref);
    });

    // Add the new vote
    const newVoteRef = doc(collection(db, "votes"));
    batch.set(newVoteRef, {
        pollId,
        optionId,
        userId: user.uid,
    });

    await batch.commit();

    // Only award points if this is their first vote on this poll
    if(!hadPreviousVote) {
        await updateUserScore(eventId, user, 5);
    }
}
