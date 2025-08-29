import { db } from "./firebase";
import { 
    collection, 
    addDoc, 
    doc, 
    getDoc, 
    getDocs, 
    updateDoc, 
    deleteDoc, 
    query, 
    where, 
    orderBy,
    Timestamp 
} from "firebase/firestore";
import type { BlogPost, UserData } from "./types";

const postsCollection = collection(db, "blogPosts");

// --- Blog Post Functions ---

export async function createPost(postData: Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt'>, user: UserData): Promise<string> {
    const docRef = await addDoc(postsCollection, {
        ...postData,
        authorId: user.uid,
        authorName: user.displayName,
        authorPhotoURL: user.photoURL,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
    });
    return docRef.id;
}

export async function updatePost(postId: string, postData: Partial<Omit<BlogPost, 'id' | 'createdAt' | 'authorId' | 'authorName' | 'authorPhotoURL'>>) {
    const postRef = doc(db, "posts", postId);
    await updateDoc(postRef, {
        ...postData,
        updatedAt: Timestamp.now()
    });
}

export async function deletePost(postId: string) {
    const postRef = doc(db, "blogPosts", postId);
    await deleteDoc(postRef);
}

export async function getPostById(postId: string): Promise<BlogPost | null> {
    const postRef = doc(db, "blogPosts", postId);
    const postSnap = await getDoc(postRef);

    if (postSnap.exists()) {
        const data = postSnap.data();
        return {
            id: postSnap.id,
            ...data,
        } as BlogPost;
    }
    return null;
}

export async function getAllPosts(): Promise<BlogPost[]> {
    const q = query(postsCollection, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
    } as BlogPost));
}

export async function getPostsByAuthor(authorId: string): Promise<BlogPost[]> {
    const q = query(postsCollection, where("authorId", "==", authorId), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
    } as BlogPost));
}
