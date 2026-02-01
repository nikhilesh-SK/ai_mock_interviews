/**
 * Interview Feedback Page
 * 
 * Displays AI-generated feedback for a completed mock interview.
 * Shows comprehensive analysis including:
 * - Overall score with animated progress ring
 * - Category-by-category breakdown with progress bars
 * - Identified strengths in styled cards
 * - Areas for improvement with actionable suggestions
 * - Option to retake the interview
 */

import dayjs from "dayjs";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";

import {
  getFeedbackByInterviewId,
  getInterviewById,
} from "@/lib/actions/general.action";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/actions/auth.action";
import FeedbackButtons from "@/components/FeedbackButtons";

/**
 * Get color based on score value
 */
const getScoreColor = (score: number) => {
  if (score >= 80) return "text-green-500";
  if (score >= 60) return "text-yellow-500";
  if (score >= 40) return "text-orange-500";
  return "text-red-500";
};

/**
 * Get background color for progress bar based on score
 */
const getProgressColor = (score: number) => {
  if (score >= 80) return "bg-green-500";
  if (score >= 60) return "bg-yellow-500";
  if (score >= 40) return "bg-orange-500";
  return "bg-red-500";
};

/**
 * Feedback Page Component
 * 
 * Fetches and displays detailed feedback for a specific interview.
 * 
 * @param params - Contains the interview ID from the URL
 */
const Feedback = async ({ params }: RouteParams) => {
  // Extract interview ID from URL parameters
  const { id } = await params;
  
  // Get current authenticated user
  const user = await getCurrentUser();

  // Fetch interview data to display the role
  const interview = await getInterviewById(id);
  
  // Redirect to home if interview doesn't exist
  if (!interview) redirect("/");

  // Fetch feedback for this interview and user
  const feedback = await getFeedbackByInterviewId({
    interviewId: id,
    userId: user?.id!,
  });

  return (
    <section className="section-feedback max-w-4xl mx-auto">
      {/* Header with interview role */}
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary-200 to-primary-100 bg-clip-text text-transparent">
          Interview Feedback
        </h1>
        <p className="text-lg text-gray-400 mt-2 capitalize">
          {interview.role} Interview
        </p>
      </div>

      {/* Score and date summary card */}
      <div className="bg-dark-200/50 border border-dark-300 rounded-2xl p-6 mb-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Overall Score Circle */}
          <div className="flex flex-col items-center">
            <div className="relative w-32 h-32">
              {/* Background circle */}
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  fill="none"
                  stroke="#1a1a2e"
                  strokeWidth="12"
                />
                {/* Progress circle */}
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  fill="none"
                  stroke="url(#gradient)"
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray={`${(feedback?.totalScore || 0) * 3.52} 352`}
                  className="transition-all duration-1000 ease-out"
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#CAC5FE" />
                    <stop offset="100%" stopColor="#8B5CF6" />
                  </linearGradient>
                </defs>
              </svg>
              {/* Score number */}
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className={`text-3xl font-bold ${getScoreColor(feedback?.totalScore || 0)}`}>
                  {feedback?.totalScore}
                </span>
                <span className="text-xs text-gray-400">/ 100</span>
              </div>
            </div>
            <p className="text-gray-300 mt-2 font-medium">Overall Score</p>
          </div>

          {/* Date and quick stats */}
          <div className="flex flex-col gap-3 text-center md:text-left">
            <div className="flex items-center gap-2 justify-center md:justify-start">
              <Image src="/calendar.svg" width={20} height={20} alt="calendar" />
              <span className="text-gray-300">
                {feedback?.createdAt
                  ? dayjs(feedback.createdAt).format("MMM D, YYYY h:mm A")
                  : "N/A"}
              </span>
            </div>
            <div className="flex items-center gap-2 justify-center md:justify-start">
              <Image src="/star.svg" width={20} height={20} alt="star" />
              <span className="text-gray-300">
                {feedback?.categoryScores?.length || 0} Categories Evaluated
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Final Assessment */}
      <div className="bg-dark-200/50 border border-dark-300 rounded-2xl p-6 mb-8">
        <h2 className="text-xl font-semibold text-primary-200 mb-3">Summary</h2>
        <p className="text-gray-300 leading-relaxed">{feedback?.finalAssessment}</p>
      </div>

      {/* Category-by-category breakdown */}
      <div className="bg-dark-200/50 border border-dark-300 rounded-2xl p-6 mb-8">
        <h2 className="text-xl font-semibold text-primary-200 mb-6">Performance Breakdown</h2>
        <div className="space-y-6">
          {feedback?.categoryScores?.map((category, index) => (
            <div key={index} className="space-y-2">
              {/* Category header with score */}
              <div className="flex justify-between items-center">
                <span className="font-medium text-white">{category.name}</span>
                <span className={`font-bold ${getScoreColor(category.score)}`}>
                  {category.score}/100
                </span>
              </div>
              {/* Progress bar */}
              <div className="h-2 bg-dark-300 rounded-full overflow-hidden">
                <div
                  className={`h-full ${getProgressColor(category.score)} rounded-full transition-all duration-1000 ease-out`}
                  style={{ width: `${category.score}%` }}
                />
              </div>
              {/* Comment */}
              <p className="text-gray-400 text-sm">{category.comment}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Strengths and Improvements Grid */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Strengths section */}
        <div className="bg-dark-200/50 border border-green-500/30 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">💪</span>
            <h3 className="text-lg font-semibold text-green-400">Strengths</h3>
          </div>
          <ul className="space-y-3">
            {feedback?.strengths?.map((strength, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✓</span>
                <span className="text-gray-300">{strength}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Areas for improvement section */}
        <div className="bg-dark-200/50 border border-orange-500/30 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">🎯</span>
            <h3 className="text-lg font-semibold text-orange-400">Areas to Improve</h3>
          </div>
          <ul className="space-y-3">
            {feedback?.areasForImprovement?.map((area, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-orange-500 mt-1">→</span>
                <span className="text-gray-300">{area}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Action buttons with loading states */}
      <FeedbackButtons interviewId={id} />
    </section>
  );
};

export default Feedback;
