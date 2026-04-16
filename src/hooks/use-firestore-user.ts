"use client";

import { useDoc } from "@/firebase/firestore/use-doc";
import { useFirestore } from "@/firebase/provider";
import { doc } from "firebase/firestore";
import { useMemo } from "react";

// Define the shape of the user profile document in Firestore
interface FirestoreUserProfile {
    role: 'admin' | 'operator';
    // Add other profile fields if they exist, e.g., email, firstName
}

/**
 * A hook to fetch a user's profile from Firestore based on their UID.
 * @param uid The user's ID.
 * @returns The user's profile data, loading state, and any errors.
 */
export const useFirestoreUser = (uid: string | undefined) => {
    const firestore = useFirestore();

    const userDocRef = useMemo(() => {
        if (!uid || !firestore) return null;
        return doc(firestore, 'userProfiles', uid);
    }, [uid, firestore]);

    const { data, isLoading, error } = useDoc<FirestoreUserProfile>(userDocRef);

    return { firestoreUser: data, isLoading, error };
};
