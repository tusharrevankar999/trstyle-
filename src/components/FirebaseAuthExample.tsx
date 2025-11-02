"use client";
import React from "react";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";
import { signInWithGoogle, signOutFirebase, getCurrentUser } from "@/lib/firebase";
import { AiOutlineUser } from "react-icons/ai";
import { FiLogOut } from "react-icons/fi";
import Image from "next/image";

/**
 * Example component showing how to use Firebase Auth to get logged-in user data
 * This can be used alongside or instead of NextAuth
 */
const FirebaseAuthExample = () => {
  const { user, loading } = useFirebaseAuth();

  const handleSignIn = async () => {
    try {
      const user = await signInWithGoogle();
      console.log("Signed in with Firebase Auth:", user);
    } catch (error) {
      console.error("Firebase Auth sign in error:", error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOutFirebase();
      console.log("Signed out from Firebase Auth");
    } catch (error) {
      console.error("Firebase Auth sign out error:", error);
    }
  };

  // Get current user synchronously
  const currentUser = getCurrentUser();

  if (loading) {
    return <div className="p-4">Loading Firebase Auth...</div>;
  }

  return (
    <div className="p-4 border rounded-lg">
      <h2 className="text-xl font-bold mb-4">Firebase Auth User Data</h2>
      
      {user ? (
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            {user.photoURL && (
              <Image
                src={user.photoURL}
                alt="User photo"
                width={50}
                height={50}
                className="rounded-full"
              />
            )}
            <div>
              <p className="font-semibold">{user.displayName || user.email}</p>
              <p className="text-sm text-gray-600">{user.email}</p>
              <p className="text-xs text-gray-500">UID: {user.uid}</p>
            </div>
          </div>
          
          <div className="text-sm">
            <p><strong>Email Verified:</strong> {user.emailVerified ? "Yes" : "No"}</p>
            <p><strong>Provider:</strong> {user.providerData[0]?.providerId}</p>
          </div>

          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            <FiLogOut />
            Sign Out (Firebase Auth)
          </button>

          <div className="mt-4 p-2 bg-gray-100 rounded text-xs">
            <p><strong>Current User (from getCurrentUser()):</strong></p>
            <pre>{JSON.stringify(currentUser ? {
              uid: currentUser.uid,
              email: currentUser.email,
              displayName: currentUser.displayName
            } : null, null, 2)}</pre>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-gray-600">Not signed in with Firebase Auth</p>
          <button
            onClick={handleSignIn}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            <AiOutlineUser />
            Sign In with Google (Firebase Auth)
          </button>
          <p className="text-xs text-gray-500">
            Note: This is separate from NextAuth. You can use both or switch to Firebase Auth.
          </p>
        </div>
      )}
    </div>
  );
};

export default FirebaseAuthExample;

