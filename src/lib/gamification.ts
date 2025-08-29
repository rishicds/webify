import { db } from "./firebase";
import { 
    collection, 
    query, 
    where, 
    onSnapshot, 
    orderBy, 
    doc,
    setDoc,
    increment,
    getDocs
} from "firebase/firestore";
import type { UserData, LeaderboardEntry } from "./types";

const leaderboardCollection = collection(db, "leaderboard");

export async function updateUserScore(eventId: string, user: UserData, points: number) {
    const q = query(
        leaderboardCollection, 
        where("eventId", "==", eventId),
        where("userId", "==", user.uid)
    );

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        // Create new entry
        const newEntryRef = doc(leaderboardCollection);
        await setDoc(newEntryRef, {
            eventId,
            userId: user.uid,
            userName: user.displayName,
            userPhotoURL: user.photoURL,
            score: points,
        });
    } else {
        // Update existing entry
        const docRef = querySnapshot.docs[0].ref;
        await setDoc(docRef, { score: increment(points) }, { merge: true });
    }
}

export function getLeaderboard(eventId: string, callback: (entries: LeaderboardEntry[]) => void) {
    const q = query(
        leaderboardCollection,
        where("eventId", "==", eventId),
        orderBy("score", "desc")
    );

    return onSnapshot(q, (querySnapshot) => {
        const entries = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as LeaderboardEntry));
        callback(entries);
    });
}
