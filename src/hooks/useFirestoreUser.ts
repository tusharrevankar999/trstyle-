"use client";
import { useEffect, useState } from "react";
import { getUserFromFirestore } from "@/lib/firebase";

/**
 * Hook to fetch user data from Firestore
 * @param userId - User ID (email or Firebase Auth UID)
 */
export const useFirestoreUser = (userId: string | null | undefined) => {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId) {
        setUserData(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      
      try {
        const data = await getUserFromFirestore(userId);
        setUserData(data);
      } catch (err: any) {
        setError(err.message || "Failed to fetch user data");
        console.error("Error fetching user from Firestore:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

  return { userData, loading, error };
};

