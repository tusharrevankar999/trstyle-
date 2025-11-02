// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics, logEvent as firebaseLogEvent } from "firebase/analytics";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut as firebaseSignOut,
  User 
} from "firebase/auth";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc,
  serverTimestamp 
} from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCRFteABTCp_myJn-Lp558OLNUtYdH9U_4",
  authDomain: "trstyle-bd6e4.firebaseapp.com",
  projectId: "trstyle-bd6e4",
  storageBucket: "trstyle-bd6e4.firebasestorage.app",
  messagingSenderId: "173550803521",
  appId: "1:173550803521:web:2d312bebac5c65ffd784c0",
  measurementId: "G-R9CCS4EFKG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics (only in browser environment)
let analytics: ReturnType<typeof getAnalytics> | null = null;
if (typeof window !== "undefined") {
  analytics = getAnalytics(app);
}

// Initialize Auth
const auth = getAuth(app);

// Initialize Firestore
const db = getFirestore(app);

export { app, analytics, auth, db };

// Helper function to get current Firebase Auth user
export const getCurrentUser = (): User | null => {
  if (typeof window !== "undefined") {
    return auth.currentUser;
  }
  return null;
};

// Helper function to sign in with Google using Firebase Auth
export const signInWithGoogle = async (): Promise<User> => {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  return result.user;
};

// Helper function to sign out from Firebase Auth
export const signOutFirebase = async (): Promise<void> => {
  await firebaseSignOut(auth);
};

// Firestore User Functions

/**
 * Save user data to Firestore when they log in
 * Tries server-side API route first, falls back to client-side if Admin SDK not available
 * @param userId - User ID (email or Firebase Auth UID)
 * @param userData - User data object
 */
export const saveUserToFirestore = async (
  userId: string,
  userData: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    provider?: string;
  }
) => {
  try {
    // Try server-side API route first (bypasses Firestore security rules)
    const response = await fetch("/api/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId,
        userData,
      }),
    });

    if (response.ok) {
      const result = await response.json();
      console.log("User data saved to Firestore via API:", userId);
      return true;
    }

    // If API route fails (Admin SDK not initialized), try client-side direct access
    // This will work if Firestore security rules allow writes
    const userRef = doc(db, "users", userId);
    await setDoc(
      userRef,
      {
        ...userData,
        updatedAt: serverTimestamp(),
        createdAt: serverTimestamp(),
      },
      { merge: true }
    );
    console.log("User data saved to Firestore (client-side):", userId);
    return true;
  } catch (error: any) {
    console.error("Error saving user to Firestore:", error);
    if (error.code === "permission-denied") {
      console.error(
        "⚠️ Firestore permission denied. Please update Firestore security rules in Firebase Console."
      );
    }
    return false;
  }
};

/**
 * Get user data from Firestore
 * Tries server-side API route first, falls back to client-side if Admin SDK not available
 * @param userId - User ID (email or Firebase Auth UID)
 */
export const getUserFromFirestore = async (userId: string) => {
  try {
    // Try server-side API route first (bypasses Firestore security rules)
    const response = await fetch(`/api/users?userId=${encodeURIComponent(userId)}`);

    if (response.ok) {
      const result = await response.json();
      console.log("User data retrieved from Firestore via API:", result.userData);
      return result.userData;
    }

    // If API route fails (Admin SDK not initialized), try client-side direct access
    // This will work if Firestore security rules allow reads
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const userData = userSnap.data();
      console.log("User data retrieved from Firestore (client-side):", userData);
      return userData;
    } else {
      console.log("No user data found in Firestore for:", userId);
      return null;
    }
  } catch (error: any) {
    console.error("Error getting user from Firestore:", error);
    if (error.code === "permission-denied") {
      console.error(
        "⚠️ Firestore permission denied. Please update Firestore security rules in Firebase Console."
      );
    }
    return null;
  }
};

/**
 * Update user data in Firestore
 * @param userId - User ID
 * @param updates - Partial user data to update
 */
export const updateUserInFirestore = async (
  userId: string,
  updates: Partial<{
    name?: string | null;
    email?: string | null;
    image?: string | null;
  }>
) => {
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
    console.log("User data updated in Firestore:", userId);
    return true;
  } catch (error) {
    console.error("Error updating user in Firestore:", error);
    return false;
  }
};

// Helper function to log events to Firebase Analytics
export const logEvent = (eventName: string, eventParams?: Record<string, any>) => {
  if (typeof window !== "undefined" && analytics) {
    firebaseLogEvent(analytics, eventName, eventParams);
  }
};

