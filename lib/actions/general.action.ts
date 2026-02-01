/**
 * General Server Actions
 * 
 * This module contains server-side functions for core application features
 * including feedback generation, interview management, and data retrieval.
 * Uses GROQ API for generating interview feedback.
 */

"use server";

import { db } from "@/firebase/admin";
import { generateFeedbackWithGroq } from "@/lib/groq";

/**
 * Creates AI-generated feedback for a completed mock interview.
 * Analyzes the interview transcript using GROQ API and scores
 * the candidate across multiple categories.
 * 
 * @param params - Feedback creation parameters
 * @param params.interviewId - The ID of the completed interview
 * @param params.userId - The ID of the user who took the interview
 * @param params.transcript - Array of conversation messages (role and content)
 * @param params.feedbackId - Optional existing feedback ID for updates
 * @returns Object with success status and feedbackId
 * 
 * Scoring categories:
 * - Communication Skills: Clarity, articulation, structured responses
 * - Technical Knowledge: Understanding of key concepts for the role
 * - Problem-Solving: Ability to analyze problems and propose solutions
 * - Cultural & Role Fit: Alignment with company values and job role
 * - Confidence & Clarity: Confidence in responses, engagement, and clarity
 */
export async function createFeedback(params: CreateFeedbackParams) {
  const { interviewId, userId, transcript, feedbackId } = params;

  try {
    console.log("Creating feedback with GROQ for interview:", interviewId);
    
    // Generate structured feedback using GROQ API
    const feedbackResult = await generateFeedbackWithGroq(transcript);
    
    console.log("GROQ feedback result:", feedbackResult);

    // Build the feedback document to store in Firestore
    const feedback = {
      interviewId: interviewId,
      userId: userId,
      totalScore: feedbackResult.totalScore,
      categoryScores: feedbackResult.categoryScores,
      strengths: feedbackResult.strengths,
      areasForImprovement: feedbackResult.areasForImprovement,
      finalAssessment: feedbackResult.finalAssessment,
      createdAt: new Date().toISOString(),
    };

    // Create or update the feedback document
    let feedbackRef;
    if (feedbackId) {
      // Update existing feedback (e.g., when retaking an interview)
      feedbackRef = db.collection("feedback").doc(feedbackId);
    } else {
      // Create new feedback with auto-generated ID
      feedbackRef = db.collection("feedback").doc();
    }

    await feedbackRef.set(feedback);

    return { success: true, feedbackId: feedbackRef.id };
  } catch (error) {
    console.error("Error saving feedback:", error);
    return { success: false };
  }
}

/**
 * Retrieves a single interview by its ID.
 * 
 * @param id - The Firestore document ID of the interview
 * @returns The interview data or null if not found
 */
export async function getInterviewById(id: string): Promise<Interview | null> {
  const interview = await db.collection("interviews").doc(id).get();

  return interview.data() as Interview | null;
}

/**
 * Gets feedback for a specific interview taken by a specific user.
 * 
 * @param params - Query parameters
 * @param params.interviewId - The interview to get feedback for
 * @param params.userId - The user who took the interview
 * @returns The feedback data or null if not found
 */
export async function getFeedbackByInterviewId(
  params: GetFeedbackByInterviewIdParams
): Promise<Feedback | null> {
  const { interviewId, userId } = params;

  // Query for feedback matching both interview and user
  const querySnapshot = await db
    .collection("feedback")
    .where("interviewId", "==", interviewId)
    .where("userId", "==", userId)
    .limit(1) // Only need one result
    .get();

  if (querySnapshot.empty) return null;

  // Return the first (and only) matching document
  const feedbackDoc = querySnapshot.docs[0];
  return { id: feedbackDoc.id, ...feedbackDoc.data() } as Feedback;
}

/**
 * Gets the latest finalized interviews from other users.
 * Used to show available interviews on the dashboard that the current
 * user can practice with.
 * 
 * @param params - Query parameters
 * @param params.userId - Current user's ID (to exclude their own interviews)
 * @param params.limit - Maximum number of interviews to return (default: 20)
 * @returns Array of interview objects or null
 */
export async function getLatestInterviews(
  params: GetLatestInterviewsParams
): Promise<Interview[] | null> {
  const { userId, limit = 20 } = params;

  // Query for finalized interviews from other users, sorted by newest first
  const interviews = await db
    .collection("interviews")
    .orderBy("createdAt", "desc")
    .where("finalized", "==", true)  // Only show completed interviews
    .where("userId", "!=", userId)    // Exclude current user's interviews
    .limit(limit)
    .get();

  // Map documents to Interview objects with IDs
  return interviews.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Interview[];
}

/**
 * Gets all interviews created by a specific user.
 * Used to display the user's interview history on their dashboard.
 * 
 * @param userId - The user's ID
 * @returns Array of the user's interviews, sorted by creation date (newest first)
 */
export async function getInterviewsByUserId(
  userId: string
): Promise<Interview[] | null> {
  const interviews = await db
    .collection("interviews")
    .where("userId", "==", userId)
    .orderBy("createdAt", "desc")
    .get();

  // Map documents to Interview objects with IDs
  return interviews.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Interview[];
}
