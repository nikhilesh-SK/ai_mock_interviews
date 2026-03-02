/**
 * Admin Server Actions
 * 
 * Server-side functions for admin dashboard including user management,
 * interview management, and analytics data retrieval.
 */

"use server";

import { db } from "@/firebase/admin";
import { getCurrentUser } from "./auth.action";
import { normalizeInterviewType } from "@/lib/utils";

/** Admin email - hardcoded for simple admin access */
const ADMIN_EMAIL = "admin@gmail.com";

/**
 * Checks if the current user is an admin.
 * Admin access is granted only to the hardcoded admin email.
 * 
 * @returns true if current user is admin, false otherwise
 */
export async function isAdmin(): Promise<boolean> {
  const user = await getCurrentUser();
  return user?.email === ADMIN_EMAIL;
}

/**
 * Gets all users from the database.
 * Admin only function.
 * 
 * @returns Array of all users or null if not authorized
 */
export async function getAllUsers(): Promise<AdminUser[] | null> {
  const admin = await isAdmin();
  if (!admin) return null;

  try {
    const usersSnapshot = await db.collection("users").get();

    return usersSnapshot.docs.map((doc) => ({
      id: doc.id,
      name: doc.data().name || "Unknown",
      email: doc.data().email || "No email",
      createdAt: doc.data().createdAt || undefined,
    }));
  } catch (error) {
    console.error("Error fetching users:", error);
    return null;
  }
}

/**
 * Gets all interviews from the database.
 * Admin only function.
 * 
 * @returns Array of all interviews or null if not authorized
 */
export async function getAllInterviews(): Promise<AdminInterview[] | null> {
  const admin = await isAdmin();
  if (!admin) return null;

  try {
    const interviewsSnapshot = await db
      .collection("interviews")
      .orderBy("createdAt", "desc")
      .get();

    // Get user mapping for displaying user names
    const usersSnapshot = await db.collection("users").get();
    const userMap = new Map<string, string>();
    usersSnapshot.docs.forEach((doc) => {
      userMap.set(doc.id, doc.data().name || "Unknown User");
    });

    return interviewsSnapshot.docs.map((doc) => ({
      id: doc.id,
      role: doc.data().role || "Unknown Role",
      type: normalizeInterviewType(doc.data().type),
      level: doc.data().level || "Unknown",
      techstack: doc.data().techstack || [],
      userId: doc.data().userId,
      userName: userMap.get(doc.data().userId) || "Unknown User",
      finalized: doc.data().finalized || false,
      createdAt: doc.data().createdAt || null,
    }));
  } catch (error) {
    console.error("Error fetching interviews:", error);
    return null;
  }
}

/**
 * Gets analytics data for the admin dashboard.
 * Computes various metrics across users, interviews, and feedback.
 * 
 * @returns Analytics data object or null if not authorized
 */
export async function getAnalyticsData(): Promise<AnalyticsData | null> {
  const admin = await isAdmin();
  if (!admin) return null;

  try {
    // Fetch all collections in parallel
    const [usersSnapshot, interviewsSnapshot, feedbackSnapshot] = await Promise.all([
      db.collection("users").get(),
      db.collection("interviews").get(),
      db.collection("feedback").get(),
    ]);

    const totalUsers = usersSnapshot.size;
    const totalInterviews = interviewsSnapshot.size;
    const totalFeedback = feedbackSnapshot.size;

    // Calculate finalized interviews
    const finalizedInterviews = interviewsSnapshot.docs.filter(
      (doc) => doc.data().finalized === true
    ).length;

    // Calculate average score from feedback
    let totalScore = 0;
    let scoreCount = 0;
    feedbackSnapshot.docs.forEach((doc) => {
      const score = doc.data().totalScore;
      if (typeof score === "number") {
        totalScore += score;
        scoreCount++;
      }
    });
    const averageScore = scoreCount > 0 ? Math.round(totalScore / scoreCount) : 0;

    // Calculate completion rate (interviews with feedback / total interviews)
    const completionRate = totalInterviews > 0
      ? Math.round((totalFeedback / totalInterviews) * 100)
      : 0;

    // Get interview types distribution
    const typeDistribution: Record<string, number> = {};
    interviewsSnapshot.docs.forEach((doc) => {
      const type = normalizeInterviewType(doc.data().type);
      typeDistribution[type] = (typeDistribution[type] || 0) + 1;
    });

    return {
      totalUsers,
      totalInterviews,
      totalFeedback,
      finalizedInterviews,
      averageScore,
      completionRate,
      typeDistribution,
    };
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return null;
  }
}
