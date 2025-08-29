"use client";

import { 
    GoogleAuthProvider,
    signInWithPopup,
    signOut,
} from "firebase/auth";
import { auth, db } from "./firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import type { UserData } from "./types";

export async function signInWithGoogle(): Promise<UserData> {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    const user = userCredential.user;

    const userDocRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
        const isAdmin = user.email === "rishipaulstudy@gmail.com";
        const userData: UserData = {
            uid: user.uid,
            displayName: user.displayName,
            email: user.email,
            photoURL: user.photoURL,
            role: isAdmin ? 'admin' : null,
        }
        await setDoc(userDocRef, userData);
        return userData;
    }

    return userDoc.data() as UserData;
}


export async function logOut() {
    await signOut(auth);
}
