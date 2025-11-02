"use client";
import React from "react";
import { useFirestoreUser } from "@/hooks/useFirestoreUser";
import { useSession } from "next-auth/react";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";
import Image from "next/image";

/**
 * Example component showing how to retrieve and display user data from Firestore
 */
const FirestoreUserExample = () => {
  const { data: session } = useSession();
  const { user: firebaseUser } = useFirebaseAuth();
  
  // Get user ID from either NextAuth session or Firebase Auth
  const userId = session?.user?.email || firebaseUser?.email || null;
  
  // Fetch user data from Firestore
  const { userData, loading, error } = useFirestoreUser(userId);

  if (!userId) {
    return (
      <div className="p-4 border rounded-lg">
        <h2 className="text-xl font-bold mb-4">Firestore User Data</h2>
        <p className="text-gray-600">Please log in to see user data from Firestore</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-4 border rounded-lg">
        <h2 className="text-xl font-bold mb-4">Firestore User Data</h2>
        <p>Loading user data from Firestore...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 border rounded-lg bg-red-50">
        <h2 className="text-xl font-bold mb-4">Firestore User Data</h2>
        <p className="text-red-600">Error: {error}</p>
        <p className="text-sm text-gray-600 mt-2">
          Make sure Firestore security rules allow read access for authenticated users.
        </p>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="p-4 border rounded-lg">
        <h2 className="text-xl font-bold mb-4">Firestore User Data</h2>
        <p className="text-gray-600">No user data found in Firestore for: {userId}</p>
        <p className="text-sm text-gray-500 mt-2">
          User data will be saved automatically when you log in.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 border rounded-lg">
      <h2 className="text-xl font-bold mb-4">User Data from Firestore</h2>
      
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          {userData.image && (
            <Image
              src={userData.image}
              alt="User photo"
              width={80}
              height={80}
              className="rounded-full"
            />
          )}
          <div>
            <p className="text-lg font-semibold">{userData.name || userData.email}</p>
            <p className="text-sm text-gray-600">{userData.email}</p>
            <p className="text-xs text-gray-500">Provider: {userData.provider || "unknown"}</p>
          </div>
        </div>

        <div className="mt-4 p-3 bg-gray-50 rounded">
          <p className="text-sm font-semibold mb-2">All Firestore Data:</p>
          <pre className="text-xs overflow-auto">
            {JSON.stringify(userData, null, 2)}
          </pre>
        </div>

        {userData.createdAt && (
          <p className="text-xs text-gray-500">
            Account created: {userData.createdAt?.toDate?.()?.toLocaleString() || "N/A"}
          </p>
        )}
        
        {userData.updatedAt && (
          <p className="text-xs text-gray-500">
            Last updated: {userData.updatedAt?.toDate?.()?.toLocaleString() || "N/A"}
          </p>
        )}
      </div>
    </div>
  );
};

export default FirestoreUserExample;

