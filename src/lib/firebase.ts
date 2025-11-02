// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics, logEvent as firebaseLogEvent } from "firebase/analytics";
import { getAuth } from "firebase/auth";

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

export { app, analytics, auth };

// Helper function to log events to Firebase Analytics
export const logEvent = (eventName: string, eventParams?: Record<string, any>) => {
  if (typeof window !== "undefined" && analytics) {
    firebaseLogEvent(analytics, eventName, eventParams);
  }
};

