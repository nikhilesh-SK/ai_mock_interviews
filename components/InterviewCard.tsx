/**
 * InterviewCard Component
 * 
 * Displays a single interview as a card with:
 * - Cover image and type badge
 * - Role title and tech stack badges
 * - Date and score (if feedback exists)
 * - Action button to view interview or feedback
 * 
 * Fetches feedback data to show completion status.
 */

"use client";

import { useEffect, useState } from "react";
import dayjs from "dayjs";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { Button } from "./ui/button";
import DisplayTechIcons from "./DisplayTechIcons";

import { cn, getRandomInterviewCover } from "@/lib/utils";
import { getFeedbackByInterviewId } from "@/lib/actions/general.action";

/**
 * Simplified feedback interface for display purposes
 */
interface Feedback {
  id: string;
  totalScore: number;
  createdAt: string;
  finalAssessment: string;
}

/**
 * InterviewCard Component
 * 
 * @param interviewId - Interview document ID
 * @param userId - Current user's ID (for fetching their feedback)
 * @param role - Job role displayed on the card
 * @param type - Interview type (Technical, Behavioral, Mixed)
 * @param techstack - Array of technologies
 * @param createdAt - Interview creation date
 * @param coverImage - Optional cover image path
 */
const InterviewCard = ({
  interviewId,
  userId,
  role,
  type,
  techstack,
  createdAt,
  coverImage,
}: InterviewCardProps) => {
  const router = useRouter();
  
  // State for storing fetched feedback
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  // State for button loading
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Fetch feedback for this interview when component mounts
   * This determines if the user has already taken this interview
   */
  useEffect(() => {
    const fetchFeedback = async () => {
      if (userId && interviewId) {
        const data = await getFeedbackByInterviewId({
          interviewId,
          userId,
        });
        setFeedback(data as Feedback | null);
      }
    };
    fetchFeedback();
  }, [interviewId, userId]);

  /**
   * Handle button click with loading state
   */
  const handleClick = () => {
    setIsLoading(true);
    const href = feedback
      ? `/interview/${interviewId}/feedback`
      : `/interview/${interviewId}`;
    router.push(href);
  };

  // Normalize interview type for badge display
  const normalizedType = /mix/gi.test(type) ? "Mixed" : type;

  // Determine badge color based on interview type
  const badgeColor =
    {
      Behavioral: "bg-light-400",
      Mixed: "bg-light-600",
      Technical: "bg-light-800",
    }[normalizedType] || "bg-light-600";

  // Format date for display
  const formattedDate = dayjs(
    feedback?.createdAt || createdAt || Date.now()
  ).format("MMM D, YYYY");

  return (
    <div className="card-border w-[360px] max-sm:w-full min-h-96">
      <div className="card-interview">
        <div>
          {/* Interview Type Badge */}
          <div
            className={cn(
              "absolute top-0 right-0 w-fit px-4 py-2 rounded-bl-lg",
              badgeColor
            )}
          >
            <p className="badge-text ">{normalizedType}</p>
          </div>

          {/* Cover Image */}
          <Image
            src={coverImage || "/covers/default.png"}
            alt="cover-image"
            width={90}
            height={90}
            className="rounded-full object-fit size-[90px]"
          />

          {/* Interview Role Title */}
          <h3 className="mt-5 capitalize">{role} Interview</h3>

          {/* Date and Score Row */}
          <div className="flex flex-row gap-5 mt-3">
            {/* Date indicator */}
            <div className="flex flex-row gap-2">
              <Image
                src="/calendar.svg"
                width={22}
                height={22}
                alt="calendar"
              />
              <p>{formattedDate}</p>
            </div>

            {/* Score indicator (shows "---" if no feedback yet) */}
            <div className="flex flex-row gap-2 items-center">
              <Image src="/star.svg" width={22} height={22} alt="star" />
              <p>{feedback?.totalScore || "---"}/100</p>
            </div>
          </div>

          {/* Feedback summary or prompt to take interview */}
          <p className="line-clamp-2 mt-5">
            {feedback?.finalAssessment ||
              "You haven't taken this interview yet. Take it now to improve your skills."}
          </p>
        </div>

        {/* Footer: Tech icons and action button */}
        <div className="flex flex-row justify-between">
          <DisplayTechIcons techStack={techstack} />

          {/* Dynamic button with loading state */}
          <Button 
            className="btn-primary min-w-[140px]" 
            onClick={handleClick}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                <span>Loading...</span>
              </div>
            ) : (
              feedback ? "View Interview" : "Attend Interview"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InterviewCard;
