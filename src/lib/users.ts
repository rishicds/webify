
import { db } from "./firebase";
import { 
    collection,
    doc, 
    getDoc, 
    getDocs, 
    query, 
    updateDoc,
    where
} from "firebase/firestore";
import type { UserData } from "./types";

export async function getUserById(userId: string): Promise<UserData | null> {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
        const data = userSnap.data();
        return {
            uid: userSnap.id,
            ...data,
        } as UserData;
    }
    return null;
}

export async function getAllUsers(role?: 'student' | 'organiser' | 'admin'): Promise<UserData[]> {
    const usersCollection = collection(db, "users");
    let q = query(usersCollection);
    if (role) {
        q = query(usersCollection, where("role", "==", role));
    }
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
    } as UserData));
}

export async function updateUserProfile(userId: string, data: Partial<UserData>): Promise<void> {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, data);
}
