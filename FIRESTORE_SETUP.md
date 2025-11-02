# Firestore Setup Guide

## Problem
You're getting "Firebase Admin SDK not initialized" errors because either:
1. Firebase Admin SDK credentials are not set up, OR
2. Firestore security rules are blocking writes

## Solution Options

### Option 1: Update Firestore Security Rules (Quick Fix - Recommended for Development)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `trstyle-bd6e4`
3. Navigate to **Firestore Database** → **Rules**
4. Replace the rules with this:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write access to users collection
    match /users/{userId} {
      allow read, write: if true;
    }
    
    // Block everything else
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

5. Click **"Publish"**
6. Refresh your app and try logging in again

**⚠️ Warning:** These rules allow anyone to read/write user data. Only use for development/testing!

---

### Option 2: Set Up Firebase Admin SDK (Better for Production)

If you want a more secure solution using Firebase Admin SDK:

#### Step 1: Get Service Account Credentials

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `trstyle-bd6e4`
3. Click the gear icon ⚙️ → **Project Settings**
4. Go to **"Service accounts"** tab
5. Click **"Generate new private key"**
6. Download the JSON file (keep it secure, never commit to git!)

#### Step 2: Extract Credentials

Open the downloaded JSON file and find:
- `project_id`
- `client_email`
- `private_key`

#### Step 3: Add to .env File

Add these variables to your `.env` file:

```env
FIREBASE_PROJECT_ID=trstyle-bd6e4
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@trstyle-bd6e4.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
```

**Important:** 
- Keep the `FIREBASE_PRIVATE_KEY` in quotes
- Replace `\n` with actual newlines in the private key
- Never commit `.env` file to git (it's already in `.gitignore`)

#### Step 4: Restart Your Server

```bash
npm run dev
```

---

### Option 3: Production-Ready Firestore Security Rules

For production, use these rules (requires Firebase Auth):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      // Allow users to read/write their own data
      allow read, write: if request.auth != null && 
        (request.auth.uid == userId || request.auth.token.email == userId);
    }
  }
}
```

---

## Recommended Approach

For now, use **Option 1** (update Firestore rules) to get it working quickly.

Later, set up **Option 2** (Firebase Admin SDK) for production security.

---

## Testing

After updating rules or setting up Admin SDK:

1. Log in with NextAuth (Google sign-in)
2. Check browser console - should see:
   - ✅ "User data saved to Firestore: [email]"
   - ✅ "User data retrieved from Firestore: [user data]"
3. Check Firebase Console → Firestore Database:
   - ✅ Should see `users` collection
   - ✅ Should see document with your email as ID
   - ✅ Should see user data fields

