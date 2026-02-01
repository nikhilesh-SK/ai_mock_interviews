/**
 * Firebase Client SDK Configuration
 * 
 * This module initializes Firebase Client SDK for client-side operations.
 * Client SDK is used in the browser for:
 * - User authentication (sign up, sign in)
 * - Client-side Firestore access (with security rules applied)
 * 
 * Note: This configuration is safe to expose in the browser as
 * Firebase security rules protect your data.
 */

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

/**
 * Firebase configuration object
 * These values identify your Firebase project to the SDK.
 * They are safe to include in client-side code.
 */
const firebaseConfig = {
  apiKey: "AIzaSyAOu6K-EIXHCTkBkf4kQflxl2Smv1Gtpro",
  authDomain: "prepwise-f09b7.firebaseapp.com",
  projectId: "prepwise-f09b7",
  storageBucket: "prepwise-f09b7.firebasestorage.app",
  messagingSenderId: "164047330745",
  appId: "1:164047330745:web:c92282f40b0c8d7b0caa68",
  measurementId: "G-DKK0NCGB5Y",
};

/** Initialize and export the Firebase app instance */
const app = initializeApp(firebaseConfig);

/** Firebase Auth instance for client-side authentication */
const auth = getAuth(app);

/** Firestore instance for client-side database operations */
const db = getFirestore(app);

export { app, auth, db };
