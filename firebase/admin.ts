/**
 * Firebase Admin SDK Configuration
 * 
 * This module initializes Firebase Admin SDK for server-side operations.
 * Admin SDK provides privileged access to Firebase services including:
 * - Authentication (verify tokens, manage users)
 * - Firestore (read/write without security rules)
 * 
 * Used in server actions and API routes for secure backend operations.
 */

import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

/**
 * Initializes Firebase Admin SDK with service account credentials.
 * Uses singleton pattern to prevent multiple initializations.
 * 
 * Environment variables required:
 * - FIREBASE_PROJECT_ID: Your Firebase project ID
 * - FIREBASE_CLIENT_EMAIL: Service account email
 * - FIREBASE_PRIVATE_KEY: Service account private key (with \n for newlines)
 * 
 * @returns Object containing auth and db instances
 */
function initFirebaseAdmin() {
  const apps = getApps();

  // Only initialize if no app exists (singleton pattern)
  if (!apps.length) {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // Replace escaped newlines with actual newlines in the private key
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      }),
    });
  }

  // Return auth and Firestore instances
  return {
    auth: getAuth(),    // For user authentication and session management
    db: getFirestore(), // For database operations
  };
}

/** Firebase Auth instance for server-side authentication */
/** Firestore database instance for server-side data operations */
export const { auth, db } = initFirebaseAdmin();
