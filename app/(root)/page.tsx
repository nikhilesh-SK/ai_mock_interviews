/**
 * Dashboard (Home) Page
 * 
 * The main dashboard of PrepWise that displays:
 * 1. Hero section with CTA to start new interview
 * 2. User's own interviews that they've created
 * 3. Available interviews from other users to practice with
 * 
 * This is a Server Component that fetches data directly.
 */

import Link from "next/link";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import InterviewCard from "@/components/InterviewCard";
import InterviewList from "@/components/InterviewList";

import { getCurrentUser } from "@/lib/actions/auth.action";
import {
  getInterviewsByUserId,
  getLatestInterviews,
} from "@/lib/actions/general.action";

/**
 * Home Page Component
 * 
 * Fetches and displays interviews for the authenticated user.
 * Uses parallel data fetching for optimal performance.
 */
async function Home() {
  // Get current authenticated user
  const user = await getCurrentUser();

  // Fetch user's interviews and available interviews in parallel
  const [userInterviews, allInterview] = await Promise.all([
    getInterviewsByUserId(user?.id!),
    getLatestInterviews({ userId: user?.id! }),
  ]);

  const hasPastInterviews = userInterviews?.length! > 0;
  const hasUpcomingInterviews = allInterview?.length! > 0;

  return (
    <>
      {/* Hero Section - Call to Action */}
      <section className="card-cta">
        <div className="flex flex-col gap-6 max-w-lg">
          <h2>Get Interview-Ready with AI-Powered Practice & Feedback</h2>
          <p className="text-lg">
            Practice real interview questions & get instant feedback
          </p>

          {/* Start Interview Button */}
          <Button asChild className="btn-primary max-sm:w-full">
            <Link href="/interview">Start an Interview</Link>
          </Button>
        </div>

        {/* Robot mascot image (hidden on mobile) */}
        <Image
          src="/robot.png"
          alt="robo-dude"
          width={400}
          height={400}
          className="max-sm:hidden"
        />
      </section>

      {/* User's Interviews Section */}
      <section className="flex flex-col gap-6 mt-8">
        <h2>Your Interviews</h2>

        <div className="interviews-section">
          {hasPastInterviews ? (
            // Display user's created interviews
            userInterviews?.map((interview) => (
              <InterviewCard
                key={interview.id}
                userId={user?.id}
                interviewId={interview.id}
                role={interview.role}
                type={interview.type}
                techstack={interview.techstack}
                createdAt={interview.createdAt}
                coverImage={interview.coverImage}
              />
            ))
          ) : (
            // Empty state message
            <p>You haven&apos;t taken any interviews yet</p>
          )}
        </div>
      </section>

      {/* Available Interviews Section */}
      <section className="flex flex-col gap-6 mt-8">
        <h2>Take Interviews</h2>

        <div className="interviews-section">
           {/* InterviewList uses Valtio for real-time updates */}
           <InterviewList initialInterviews={allInterview ?? []} userId={user?.id!} />
        </div>
      </section>
    </>
  );
}

export default Home;
