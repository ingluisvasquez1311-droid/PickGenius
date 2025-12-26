import { db } from '../firebase';
import {
    collection,
    addDoc,
    query,
    where,
    orderBy,
    onSnapshot,
    serverTimestamp,
    limit,
    Timestamp
} from 'firebase/firestore';

export interface Comment {
    id: string;
    matchId: string;
    userId: string;
    displayName: string;
    photoURL?: string;
    content: string;
    role: 'admin' | 'premium' | 'user';
    timestamp: any;
}

export const addComment = async (
    matchId: string,
    userId: string,
    displayName: string,
    content: string,
    role: 'admin' | 'premium' | 'user',
    photoURL?: string
) => {
    if (!db) return;

    await addDoc(collection(db, 'comments'), {
        matchId,
        userId,
        displayName,
        photoURL,
        content,
        role,
        timestamp: serverTimestamp()
    });
};

export const subscribeToComments = (matchId: string, callback: (comments: Comment[]) => void) => {
    if (!db) return () => { };

    const q = query(
        collection(db, 'comments'),
        where('matchId', '==', matchId),
        orderBy('timestamp', 'desc'),
        limit(50)
    );

    return onSnapshot(q, (snapshot) => {
        const comments = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as Comment[];
        callback(comments.reverse()); // Show oldest first for chat flow
    });
};
