/**
 * Interview State Store
 * 
 * This module provides global state management for interviews using Valtio.
 * Valtio creates a reactive proxy that automatically triggers re-renders
 * when state changes, providing a simple alternative to Redux or Context.
 * 
 * @see https://github.com/pmndrs/valtio
 */

import { proxy } from "valtio";

/**
 * Interview data structure
 * Represents a complete interview with all its metadata and content
 */
interface Interview {
  id: string;           // Firestore document ID
  role: string;         // Job role (e.g., "Frontend Developer")
  type: string;         // Interview type (e.g., "Technical", "Behavioral")
  level: string;        // Experience level (e.g., "Junior", "Senior")
  techstack: string[];  // Technologies being tested
  questions: string[];  // Array of interview questions
  userId: string;       // ID of the user who created the interview
  finalized: boolean;   // Whether the interview is ready for use
  coverImage: string;   // Path to the interview cover image
  createdAt: string;    // ISO timestamp of creation
}

/**
 * Interview store state and actions interface
 */
interface InterviewStore {
  /** Array of all interviews currently in the store */
  interviews: Interview[];
  
  /** Replace all interviews in the store (used for initial load) */
  setInterviews: (interviews: Interview[]) => void;
  
  /** Add a new interview to the beginning of the list */
  addInterview: (interview: Interview) => void;
}

/**
 * Global interview store using Valtio proxy
 * 
 * Usage in components:
 * ```tsx
 * import { useSnapshot } from "valtio";
 * import { interviewStore } from "@/store";
 * 
 * const snap = useSnapshot(interviewStore);
 * // snap.interviews is reactive and will trigger re-renders
 * ```
 */
export const interviewStore = proxy<InterviewStore>({
  interviews: [],
  
  /**
   * Sets the interviews array, replacing any existing data.
   * Typically used when initially loading interviews from the server.
   */
  setInterviews: (interviews) => {
    interviewStore.interviews = interviews;
  },
  
  /**
   * Adds a new interview to the front of the list.
   * Used when a user creates a new interview to update the UI immediately.
   */
  addInterview: (interview) => {
    interviewStore.interviews = [interview, ...interviewStore.interviews];
  },
});
