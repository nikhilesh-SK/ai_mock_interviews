/**
 * Interview Details Page
 * 
 * This page displays a specific interview and allows the user to
 * start a voice-based mock interview session. The AI interviewer
 * will ask the predefined questions and the user's responses are
 * recorded for feedback generation.
 * 
 * After the interview ends, AI-generated feedback is created and
 * stored in Firestore.
 */

import Image from "next/image";
import { redirect } from "next/navigation";

import Agent from "@/components/Agent";
import { getRandomInterviewCover } from "@/lib/utils";

import {
  getFeedbackByInterviewId,
  getInterviewById,
} from "@/lib/actions/general.action";
import { getCurrentUser } from "@/lib/actions/auth.action";
import DisplayTechIcons from "@/components/DisplayTechIcons";

/**
 * InterviewDetails Page Component
 * 
 * Displays interview information and starts the mock interview session.
 * 
 * @param params - Contains the interview ID from the URL
 */
const InterviewDetails = async ({ params }: RouteParams) => {
  // Extract interview ID from URL parameters
  const { id } = await params;

  // Get current authenticated user
  const user = await getCurrentUser();

  // Fetch interview data from Firestore
  const interview = await getInterviewById(id);
  
  // Redirect to home if interview doesn't exist
  if (!interview) redirect("/");

  // Check if user has already completed this interview
  const feedback = await getFeedbackByInterviewId({
    interviewId: id,
    userId: user?.id!,
  });

  return (
    <>
      {/* Interview Header */}
      <div className="flex flex-row gap-4 justify-between">
        <div className="flex flex-row gap-4 items-center max-sm:flex-col">
          {/* Interview cover and title */}
          <div className="flex flex-row gap-4 items-center">
            <Image
              src={getRandomInterviewCover()}
              alt="cover-image"
              width={40}
              height={40}
              className="rounded-full object-cover size-[40px]"
            />
            <h3 className="capitalize">{interview.role} Interview</h3>
          </div>

          {/* Tech stack badges */}
          <DisplayTechIcons techStack={interview.techstack} />
        </div>

        {/* Interview type badge */}
        <p className="bg-dark-200 px-4 py-2 rounded-lg h-fit">
          {interview.type}
        </p>
      </div>

      {/* 
        Agent component in "interview" mode
        Will conduct the actual mock interview with predefined questions
        If feedback exists, pass the ID for updates (retake scenario)
      */}
      <Agent
        userName={user?.name!}
        userId={user?.id}
        interviewId={id}
        type="interview"
        questions={interview.questions}
        feedbackId={feedback?.id}
      />
    </>
  );
};

export default InterviewDetails;
