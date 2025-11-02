import { NextRequest, NextResponse } from "next/server";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore, Firestore } from "firebase-admin/firestore";

// Initialize Firebase Admin SDK (server-side only)
let adminDb: Firestore | null = null;

try {
  if (!getApps().length) {
    // Try to initialize with service account credentials from env variables
    const projectId = process.env.FIREBASE_PROJECT_ID || "trstyle-bd6e4";
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

    if (clientEmail && privateKey) {
      initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
      adminDb = getFirestore();
      console.log("Firebase Admin SDK initialized successfully");
    } else {
      console.warn(
        "Firebase Admin SDK not initialized. Set FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY in .env file. Using Firestore security rules instead."
      );
    }
  } else {
    adminDb = getFirestore();
  }
} catch (error) {
  console.error("Firebase Admin initialization error:", error);
  console.warn(
    "Firebase Admin SDK failed to initialize. Make sure to update Firestore security rules to allow writes."
  );
}

// Save user data to Firestore
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, userData } = body;

    if (!userId || !userData) {
      return NextResponse.json(
        { error: "userId and userData are required" },
        { status: 400 }
      );
    }

    if (!adminDb) {
      return NextResponse.json(
        {
          error:
            "Firebase Admin SDK not initialized. Please set up service account credentials or update Firestore security rules.",
          instructions:
            "To fix this: 1) Set FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY in .env, OR 2) Update Firestore security rules in Firebase Console to allow writes.",
        },
        { status: 500 }
      );
    }

    // Save user data to Firestore using Admin SDK (bypasses security rules)
    const userRef = adminDb.collection("users").doc(userId);
    await userRef.set(
      {
        ...userData,
        updatedAt: new Date(),
        createdAt: new Date(),
      },
      { merge: true }
    );

    return NextResponse.json({
      success: true,
      message: "User data saved to Firestore",
    });
  } catch (error: any) {
    console.error("Error saving user to Firestore:", error);
    return NextResponse.json(
      { error: error.message || "Failed to save user data" },
      { status: 500 }
    );
  }
}

// Get user data from Firestore
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    if (!adminDb) {
      return NextResponse.json(
        {
          error:
            "Firebase Admin SDK not initialized. Please set up service account credentials or update Firestore security rules.",
        },
        { status: 500 }
      );
    }

    // Get user data from Firestore using Admin SDK
    const userRef = adminDb.collection("users").doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const userData = userDoc.data();
    return NextResponse.json({ success: true, userData });
  } catch (error: any) {
    console.error("Error getting user from Firestore:", error);
    return NextResponse.json(
      { error: error.message || "Failed to get user data" },
      { status: 500 }
    );
  }
}

