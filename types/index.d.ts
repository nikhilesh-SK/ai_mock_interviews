/**
 * TypeScript Type Definitions
 * 
 * This file contains global TypeScript interfaces and types used throughout
 * the PrepWise application. These definitions provide type safety and
 * IntelliSense support for all data structures.
 */

/**
 * Interview Feedback Data Structure
 * 
 * Represents AI-generated feedback for a completed mock interview.
 * Contains scores, assessments, and recommendations.
 */
interface Feedback {
  id: string;                    // Firestore document ID
  interviewId: string;           // Reference to the interview this feedback is for
  totalScore: number;            // Overall score (0-100)
  categoryScores: Array<{        // Individual category scores
    name: string;                // Category name (e.g., "Communication Skills")
    score: number;               // Score for this category (0-100)
    comment: string;             // AI-generated comment explaining the score
  }>;
  strengths: string[];           // List of candidate's strong points
  areasForImprovement: string[]; // List of areas to work on
  finalAssessment: string;       // Overall summary and recommendation
  createdAt: string;             // ISO timestamp of when feedback was generated
}

/**
 * Interview Data Structure
 * 
 * Represents a mock interview with its configuration and content.
 */
interface Interview {
  id: string;             // Firestore document ID
  role: string;           // Job role (e.g., "Frontend Developer")
  level: string;          // Experience level (e.g., "Junior", "Senior")
  questions: string[];    // Array of interview questions
  techstack: string[];    // Technologies/skills being tested
  createdAt: string;      // ISO timestamp of creation
  userId: string;         // ID of the user who created this interview
  type: string;           // Interview type (e.g., "Technical", "Behavioral", "Mixed")
  finalized: boolean;     // Whether the interview is ready for use
  coverImage?: string;    // Optional cover image path
}

/**
 * Parameters for creating interview feedback
 */
interface CreateFeedbackParams {
  interviewId: string;                           // Interview to create feedback for
  userId: string;                                // User who completed the interview
  transcript: { role: string; content: string }[]; // Conversation transcript
  feedbackId?: string;                           // Optional: existing feedback ID for updates
}

/**
 * User Profile Data Structure
 */
interface User {
  name: string;   // User's display name
  email: string;  // User's email address
  id: string;     // Firestore document ID (same as Firebase Auth UID)
}

/**
 * Props for the InterviewCard component
 */
interface InterviewCardProps {
  interviewId?: string;   // Interview document ID
  userId?: string;        // Current user's ID (for fetching feedback)
  role: string;           // Job role displayed on the card
  type: string;           // Interview type badge
  techstack: string[];    // Technologies displayed as badges
  createdAt?: string;     // Date shown on the card
  coverImage?: string;    // Cover image for the card
}

/**
 * Props for the Agent (Voice AI) component
 */
interface AgentProps {
  userName: string;       // User's name for personalization
  userId?: string;        // User's ID for saving data
  interviewId?: string;   // Interview ID (for interview mode)
  feedbackId?: string;    // Existing feedback ID (for updates)
  type: "generate" | "interview"; // Mode: generate new interview or conduct interview
  questions?: string[];   // Questions to ask (for interview mode)
}

/**
 * Next.js Route Parameters
 * 
 * Used for dynamic routes like /interview/[id]
 * Note: In Next.js 15+, params are returned as Promises
 */
interface RouteParams {
  params: Promise<Record<string, string>>;       // URL path parameters
  searchParams: Promise<Record<string, string>>; // URL query parameters
}

/**
 * Parameters for fetching feedback by interview ID
 */
interface GetFeedbackByInterviewIdParams {
  interviewId: string;  // Interview to get feedback for
  userId: string;       // User's ID (feedback is per-user-per-interview)
}

/**
 * Parameters for fetching latest interviews
 */
interface GetLatestInterviewsParams {
  userId: string;    // Current user's ID (to exclude their interviews)
  limit?: number;    // Maximum number of interviews to return
}

/**
 * Parameters for user sign-in
 */
interface SignInParams {
  email: string;     // User's email
  idToken: string;   // Firebase ID token from client authentication
}

/**
 * Parameters for user sign-up
 */
interface SignUpParams {
  uid: string;       // Firebase Auth user ID
  name: string;      // User's display name
  email: string;     // User's email
  password: string;  // User's password (not stored, just for type consistency)
}

/**
 * Form Type for Authentication
 * Determines whether to show sign-in or sign-up form
 */
type FormType = "sign-in" | "sign-up";

/**
 * Interview Form Properties
 * Used when displaying interview details before starting
 */
interface InterviewFormProps {
  interviewId: string;  // Interview document ID
  role: string;         // Job role
  level: string;        // Experience level
  type: string;         // Interview type
  techstack: string[];  // Technologies
  amount: number;       // Number of questions
}
/**
 * Props for the DisplayTechIcons component
 */
interface TechIconProps {
  techStack: string[] | string;  // Can be array or comma-separated string
}

/**
 * Admin User Data Structure
 * Used in admin dashboard for user listing
 */
interface AdminUser {
  id: string;          // Firestore document ID
  name: string;        // User's display name
  email: string;       // User's email address
  createdAt?: string;  // ISO timestamp of when user joined
}

/**
 * Admin Interview Data Structure
 * Extended interview data for admin dashboard
 */
interface AdminInterview {
  id: string;          // Firestore document ID
  role: string;        // Job role
  type: string;        // Interview type
  level: string;       // Experience level
  techstack: string[]; // Technologies
  userId: string;      // User who created the interview
  userName: string;    // User's display name (denormalized for display)
  finalized: boolean;  // Whether interview is complete
  createdAt?: string;  // ISO timestamp
}

/**
 * Analytics Data Structure
 * Aggregated metrics for admin dashboard
 */
interface AnalyticsData {
  totalUsers: number;         // Total registered users
  totalInterviews: number;    // Total interviews created
  totalFeedback: number;      // Total feedback generated
  finalizedInterviews: number; // Completed interviews
  averageScore: number;       // Average feedback score (0-100)
  completionRate: number;     // Percentage of interviews with feedback
  typeDistribution: Record<string, number>; // Interview type counts
}
