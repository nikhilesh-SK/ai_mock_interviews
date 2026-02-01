/**
 * Interview Generation Page
 * 
 * This page allows users to create a new interview via voice conversation.
 * The Agent component collects interview requirements (role, tech stack,
 * experience level, etc.) through natural conversation with an AI assistant.
 * 
 * After the conversation ends, the interview questions are generated using
 * GROQ API and saved to Firestore.
 */

import Agent from "@/components/Agent";
import { getCurrentUser } from "@/lib/actions/auth.action";

/**
 * Interview Generation Page Component
 * 
 * Fetches the current user and renders the Agent in "generate" mode.
 * This mode starts a Vapi workflow to gather interview requirements.
 */
const Page = async () => {
  // Get current authenticated user
  const user = await getCurrentUser();

  return (
    <>
      <h3>Interview generation</h3>

      {/* 
        Agent component in "generate" mode
        Will start a voice conversation to collect interview details
        then generate questions using GROQ API
      */}
      <Agent
        userName={user?.name!}
        userId={user?.id}
        type="generate"
      />
    </>
  );
};

export default Page;
