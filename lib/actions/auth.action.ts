/**
 * Authentication Server Actions
 * 
 * This module contains server-side functions for user authentication
 * including sign up, sign in, sign out, and session management using
 * Firebase Admin SDK and HTTP-only cookies.
 */

"use server";

import { auth, db } from "@/firebase/admin";
import { cookies } from "next/headers";

/** Session duration in seconds (1 week = 604,800 seconds) */
const SESSION_DURATION = 60 * 60 * 24 * 7;

/**
 * Creates and sets a secure session cookie for the authenticated user.
 * The cookie is HTTP-only and uses secure flag in production.
 * 
 * @param idToken - The Firebase ID token from client-side authentication
 */
export async function setSessionCookie(idToken: string) {
  const cookieStore = await cookies();

  // Create a session cookie using Firebase Admin SDK
  // This creates a long-lived session that can be verified server-side
  const sessionCookie = await auth.createSessionCookie(idToken, {
    expiresIn: SESSION_DURATION * 1000, // Firebase expects milliseconds
  });

  // Set the session cookie with security options
  cookieStore.set("session", sessionCookie, {
    maxAge: SESSION_DURATION,    // Cookie expiry in seconds
    httpOnly: true,               // Prevents client-side JS access (XSS protection)
    secure: process.env.NODE_ENV === "production", // HTTPS only in production
    path: "/",                    // Cookie valid for all routes
    sameSite: "lax",              // CSRF protection while allowing navigation
  });
}

/**
 * Registers a new user in the database after Firebase Authentication.
 * This function is called after the user is created in Firebase Auth.
 * 
 * @param params - User registration parameters
 * @param params.uid - Firebase user ID from authentication
 * @param params.name - User's display name
 * @param params.email - User's email address
 * @returns Object with success status and message
 */
export async function signUp(params: SignUpParams) {
  const { uid, name, email } = params;

  try {
    // Check if user already exists in Firestore
    const userRecord = await db.collection("users").doc(uid).get();
    if (userRecord.exists)
      return {
        success: false,
        message: "User already exists. Please sign in.",
      };

    // Save new user to Firestore with their profile data
    await db.collection("users").doc(uid).set({
      name,
      email,
      // profileURL and resumeURL can be added later
    });

    return {
      success: true,
      message: "Account created successfully. Please sign in.",
    };
  } catch (error: any) {
    console.error("Error creating user:", error);

    // Handle specific Firebase authentication errors
    if (error.code === "auth/email-already-exists") {
      return {
        success: false,
        message: "This email is already in use",
      };
    }

    return {
      success: false,
      message: "Failed to create account. Please try again.",
    };
  }
}

/**
 * Signs in an existing user by verifying their credentials and creating a session.
 * 
 * @param params - Sign in parameters
 * @param params.email - User's email address
 * @param params.idToken - Firebase ID token from client-side authentication
 * @returns Object with success status and optional error message
 */
export async function signIn(params: SignInParams) {
  const { email, idToken } = params;

  try {
    // Verify the user exists in Firebase Auth
    const userRecord = await auth.getUserByEmail(email);
    if (!userRecord)
      return {
        success: false,
        message: "User does not exist. Create an account.",
      };

    // Create a session cookie for the authenticated user
    await setSessionCookie(idToken);
  } catch (error: any) {
    console.log("");

    return {
      success: false,
      message: "Failed to log into account. Please try again.",
    };
  }
}

/**
 * Signs out the current user by clearing the session cookie.
 * This effectively invalidates the user's session.
 */
export async function signOut() {
  const cookieStore = await cookies();

  // Remove the session cookie to log the user out
  cookieStore.delete("session");
}

/**
 * Retrieves the currently authenticated user from the session cookie.
 * Verifies the session is valid and fetches user data from Firestore.
 * 
 * @returns The current user object or null if not authenticated
 */
export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies();

  // Get the session cookie value
  const sessionCookie = cookieStore.get("session")?.value;
  if (!sessionCookie) return null;

  try {
    // Verify the session cookie and get user claims
    // The 'true' parameter checks if the cookie has been revoked
    const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);

    // Fetch additional user info from Firestore
    const userRecord = await db
      .collection("users")
      .doc(decodedClaims.uid)
      .get();
    if (!userRecord.exists) return null;

    // Return user data with the document ID
    return {
      ...userRecord.data(),
      id: userRecord.id,
    } as User;
  } catch (error) {
    console.log(error);

    // Invalid or expired session - return null
    return null;
  }
}

/**
 * Checks if the current user is authenticated.
 * Useful for protecting routes and conditional rendering.
 * 
 * @returns true if user is authenticated, false otherwise
 */
export async function isAuthenticated() {
  const user = await getCurrentUser();
  return !!user; // Convert to boolean
}
