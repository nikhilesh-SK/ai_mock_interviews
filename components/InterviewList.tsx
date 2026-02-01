/**
 * InterviewList Component
 * 
 * Displays a list of interview cards with real-time updates.
 * Uses Valtio for reactive state management, allowing the list
 * to update immediately when a new interview is created without
 * requiring a page refresh.
 */

"use client";

import { useEffect } from "react";
import { useSnapshot } from "valtio";

import InterviewCard from "@/components/InterviewCard";
import { interviewStore } from "@/store";

/**
 * Props for InterviewList component
 */
interface InterviewListProps {
  initialInterviews: any[]; // Server-fetched interviews for initial render
  userId: string;           // Current user's ID
}

/**
 * InterviewList Component
 * 
 * Combines server-side data with client-side reactivity:
 * 1. Initial interviews are passed from the server
 * 2. Valtio store is hydrated with this data
 * 3. Any subsequent additions update the store and trigger re-render
 * 
 * @param initialInterviews - Pre-fetched interviews from the server
 * @param userId - Current user's ID for feedback fetching
 */
const InterviewList = ({ initialInterviews, userId }: InterviewListProps) => {
  // Subscribe to reactive store updates
  const snap = useSnapshot(interviewStore);

  /**
   * Initialize the store with server-fetched data on mount.
   * This hydrates the client-side state with server data.
   */
  useEffect(() => {
    if (initialInterviews) {
      interviewStore.setInterviews(initialInterviews);
    }
  }, [initialInterviews]);

  // Get interviews from the reactive snapshot
  const interviews = snap.interviews;
  const hasInterviews = interviews && interviews.length > 0;

  return (
    <div className="interviews-section">
      {hasInterviews ? (
        // Map through interviews and render a card for each
        interviews.map((interview) => (
          <InterviewCard
            key={interview.id}
            userId={userId}
            interviewId={interview.id}
            role={interview.role}
            type={interview.type}
            techstack={[...interview.techstack]}
            createdAt={interview.createdAt}
            coverImage={interview.coverImage}
          />
        ))
      ) : (
        // Empty state message
        <p>There are no interviews available</p>
      )}
    </div>
  );
};

export default InterviewList;
