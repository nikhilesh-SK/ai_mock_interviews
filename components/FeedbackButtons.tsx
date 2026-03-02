/**
 * FeedbackButtons Component
 * 
 * Client component that provides navigation buttons with loading states
 * for the feedback page. Shows a spinner when navigating to prevent
 * perceived lag.
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";

interface FeedbackButtonsProps {
  interviewId: string;
}

const FeedbackButtons = ({ interviewId }: FeedbackButtonsProps) => {
  const router = useRouter();
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(false);
  const [isLoadingRetake, setIsLoadingRetake] = useState(false);

  const handleDashboard = () => {
    setIsLoadingDashboard(true);
    router.push("/");
  };

  const handleRetake = () => {
    setIsLoadingRetake(true);
    router.push(`/interview/${interviewId}`);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      {/* Back to Dashboard button */}
      <Button
        className="btn-secondary flex-1 min-h-[44px]"
        onClick={handleDashboard}
        isLoading={isLoadingDashboard}
        disabled={isLoadingRetake}
        loadingText="Loading..."
      >
        <span className="text-sm font-semibold text-primary-200">Back to Dashboard</span>
      </Button>

      {/* Retake Interview button */}
      <Button
        className="btn-primary flex-1 min-h-[44px]"
        onClick={handleRetake}
        isLoading={isLoadingRetake}
        disabled={isLoadingDashboard}
        loadingText="Loading..."
      >
        <span className="text-sm font-semibold text-black">Retake Interview</span>
      </Button>
    </div>
  );
};

export default FeedbackButtons;
