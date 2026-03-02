/**
 * Agent Component
 * 
 * The core voice AI interaction component for PrepWise.
 * Handles two modes:
 * 1. "generate" - Collects interview requirements via voice conversation
 * 2. "interview" - Conducts the actual mock interview with questions
 * 
 * Uses Vapi for voice AI and manages the entire call lifecycle.
 */

"use client";

import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { vapi } from "@/lib/vapi.sdk";
import { interviewer } from "@/constants";
import { createFeedback } from "@/lib/actions/general.action";
import { interviewStore } from "@/store";

/**
 * Call status states for the voice interaction
 */
enum CallStatus {
  INACTIVE = "INACTIVE",     // No call in progress
  CONNECTING = "CONNECTING", // Call is being established
  ACTIVE = "ACTIVE",         // Call is ongoing
  FINISHED = "FINISHED",     // Call has ended
}

/**
 * Message structure for conversation transcript
 */
interface SavedMessage {
  role: "user" | "system" | "assistant";
  content: string;
}

/**
 * Interview variables extracted from the voice conversation
 * Used when generating a new interview
 */
interface InterviewVariables {
  type?: string;      // Interview type (Technical, Behavioral, Mixed)
  role?: string;      // Job role
  level?: string;     // Experience level
  techstack?: string; // Technologies
  amount?: number;    // Number of questions
}

/**
 * Agent Component
 * 
 * @param userName - User's display name for personalization
 * @param userId - User's ID for saving data
 * @param interviewId - Interview ID (for interview mode)
 * @param feedbackId - Existing feedback ID (for updates)
 * @param type - Mode: "generate" or "interview"
 * @param questions - Questions to ask (interview mode only)
 */
const Agent = ({
  userName,
  userId,
  interviewId,
  feedbackId,
  type,
  questions,
}: AgentProps) => {
  const router = useRouter();

  // State management
  const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
  const [messages, setMessages] = useState<SavedMessage[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [lastMessage, setLastMessage] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingFeedback, setIsGeneratingFeedback] = useState(false);

  // Ref to persist extracted variables across renders
  const extractedVariables = useRef<InterviewVariables>({});

  /**
   * Set up Vapi event listeners on component mount
   * Handles all voice call lifecycle events
   */
  useEffect(() => {
    // Called when the voice call starts
    const onCallStart = () => {
      setCallStatus(CallStatus.ACTIVE);
    };

    // Called when the voice call ends
    const onCallEnd = () => {
      setCallStatus(CallStatus.FINISHED);
    };

    // Called when a message is received (transcription or AI response)
    const onMessage = (message: Message) => {
      // Debug log for ALL messages
      console.log("Vapi Message Received:", message.type, message);

      // Only save final transcriptions (not partial ones)
      if (message.type === "transcript" && message.transcriptType === "final") {
        const newMessage = { role: message.role, content: message.transcript };
        setMessages((prev) => [...prev, newMessage]);
      }

      // Capture extracted variables from workflow nodes
      // This is how Vapi communicates gathered interview details
      const msg = message as any;
      if (msg.type === "workflow.node.started" || msg.type === "workflow.node.completed") {
        console.log("Workflow Node Event:", msg.type, msg.variables);
        const variables = (message as any).variables;
        if (variables) {
          // Merge new variables with existing ones
          extractedVariables.current = {
            ...extractedVariables.current,
            type: variables.type || extractedVariables.current.type,
            role: variables.role || extractedVariables.current.role,
            level: variables.level || extractedVariables.current.level,
            techstack: variables.techstack || extractedVariables.current.techstack,
            amount: variables.amount || extractedVariables.current.amount || 5,
          };
          console.log("Updated extracted variables:", extractedVariables.current);
        }
      }
    };

    // Called when the AI starts speaking
    const onSpeechStart = () => {
      console.log("speech start");
      setIsSpeaking(true);
    };

    // Called when the AI stops speaking
    const onSpeechEnd = () => {
      console.log("speech end");
      setIsSpeaking(false);
    };

    // Called when an error occurs
    const onError = (error: Error) => {
      console.log("Error:", error);
      toast.error(`Error: ${error.message || "Something went wrong"}`);
    };

    // Register all event listeners
    vapi.on("call-start", onCallStart);
    vapi.on("call-end", onCallEnd);
    vapi.on("message", onMessage);
    vapi.on("speech-start", onSpeechStart);
    vapi.on("speech-end", onSpeechEnd);
    vapi.on("error", onError);

    // Cleanup: remove event listeners on unmount
    return () => {
      vapi.off("call-start", onCallStart);
      vapi.off("call-end", onCallEnd);
      vapi.off("message", onMessage);
      vapi.off("speech-start", onSpeechStart);
      vapi.off("speech-end", onSpeechEnd);
      vapi.off("error", onError);
    };
  }, []);

  /**
   * Handle call completion - generate feedback or save interview
   */
  useEffect(() => {
    // Update last message for display
    if (messages.length > 0) {
      setLastMessage(messages[messages.length - 1].content);
    }

    /**
     * Generate AI feedback for the completed interview
     * Analyzes the transcript and saves feedback to Firestore
     */
    const handleGenerateFeedback = async (messages: SavedMessage[]) => {
      console.log("handleGenerateFeedback - Starting feedback generation");
      setIsGeneratingFeedback(true);

      try {
        const { success, feedbackId: id } = await createFeedback({
          interviewId: interviewId!,
          userId: userId!,
          transcript: messages,
          feedbackId,
        });

        if (success && id) {
          // Navigate to feedback page on success
          router.push(`/interview/${interviewId}/feedback`);
        } else {
          console.log("Error saving feedback");
          toast.error("Failed to generate feedback");
          setIsGeneratingFeedback(false);
          router.push("/");
        }
      } catch (error) {
        console.error("Error generating feedback:", error);
        toast.error("Error generating feedback");
        setIsGeneratingFeedback(false);
        router.push("/");
      }
    };

    /**
     * Generate a new interview from the voice conversation
     * Sends collected details to API which uses GROQ to generate questions
     */
    const handleGenerateInterview = async () => {
      console.log("handleGenerateInterview - Saving interview data");
      setIsGenerating(true);

      // Use extracted variables or fall back to defaults
      const currentVars = extractedVariables.current;
      const payload = {
        type: currentVars.type || "Mixed",
        role: currentVars.role || "Software Developer",
        level: currentVars.level || "Mid-level",
        techstack: currentVars.techstack || "JavaScript, React",
        amount: currentVars.amount || 5,
        userid: userId,
        // Include transcript for AI to extract more accurate details
        transcript: messages.map(m => `${m.role}: ${m.content}`).join("\n"),
      };

      console.log("Sending payload to /api/vapi/generate:", payload);

      try {
        // Call the interview generation API
        const response = await fetch("/api/vapi/generate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        const data = await response.json();
        if (data.success) {
          console.log("Interview saved successfully", data.interview);

          // Update global store for immediate UI refresh
          if (data.interview) {
            const { interviewStore } = await import("@/store");
            interviewStore.addInterview(data.interview);
          }

          toast.success("Interview generated!");
          router.refresh();
          router.push("/");
        } else {
          console.error("Error saving interview:", data.error);
          toast.error("Failed to save interview");
          setIsGenerating(false);
        }
      } catch (error) {
        console.error("Error calling generate API:", error);
        toast.error("Error saving interview");
        setIsGenerating(false);
      }
    };

    // When call finishes, trigger the appropriate handler
    if (callStatus === CallStatus.FINISHED) {
      if (type === "generate") {
        handleGenerateInterview();
      } else {
        handleGenerateFeedback(messages);
      }
    }
  }, [messages, callStatus, feedbackId, interviewId, router, type, userId]);

  /**
   * Start a voice call with the AI
   * Initiates either workflow (for generation) or interview assistant
   */
  const handleCall = async () => {
    setCallStatus(CallStatus.CONNECTING);

    try {
      if (type === "generate") {
        // Start the interview generation workflow
        console.log("Starting workflow with ID:", process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID);
        await vapi.start(process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID!, {
          variableValues: {
            username: userName,
            userid: userId,
          },
        });
      } else {
        // Start the interview with provided questions
        let formattedQuestions = "";
        if (questions) {
          formattedQuestions = questions
            .map((question) => `- ${question}`)
            .join("\n");
        }

        await vapi.start(interviewer, {
          variableValues: {
            questions: formattedQuestions,
          },
        });
      }
    } catch (error) {
      console.error("Failed to start Vapi call:", JSON.stringify(error, null, 2));
      toast.error("Failed to start call. Check console/keys.");
      setCallStatus(CallStatus.INACTIVE);
    }
  };

  /**
   * End the voice call
   */
  const handleDisconnect = () => {
    setCallStatus(CallStatus.FINISHED);
    vapi.stop();
  };

  return (
    <>
      {/* Loading overlay while generating interview */}
      {isGenerating && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center flex-col gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          <h2 className="text-white text-xl font-semibold">Creating your Interview...</h2>
          <p className="text-gray-400">Please wait while we generate your questions.</p>
        </div>
      )}

      {/* Loading overlay while generating feedback */}
      {isGeneratingFeedback && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center flex-col gap-4">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-200"></div>
          <h2 className="text-white text-2xl font-semibold">Generating Feedback...</h2>
          <p className="text-gray-400">Analyzing your interview performance with AI</p>
          <div className="flex gap-2 mt-2">
            <span className="w-2 h-2 bg-primary-200 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
            <span className="w-2 h-2 bg-primary-200 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
            <span className="w-2 h-2 bg-primary-200 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
          </div>
        </div>
      )}

      {/* Voice call interface */}
      <div className="call-view">
        {/* AI Interviewer Card */}
        <div className="card-interviewer">
          <div className="avatar">
            <Image
              src="/ai-avatar.png"
              alt="profile-image"
              width={65}
              height={54}
              className="object-cover"
            />
            {/* Animated indicator when AI is speaking */}
            {isSpeaking && <span className="animate-speak" />}
          </div>
          <h3>AI Interviewer</h3>
        </div>

        {/* User Profile Card */}
        <div className="card-border">
          <div className="card-content">
            <Image
              src="/user-avatar.png"
              alt="profile-image"
              width={539}
              height={539}
              className="rounded-full object-cover size-[120px]"
            />
            <h3>{userName}</h3>
          </div>
        </div>
      </div>

      {/* Live transcript display */}
      {messages.length > 0 && (
        <div className="transcript-border">
          <div className="transcript">
            <p
              key={lastMessage}
              className={cn(
                "transition-opacity duration-500 opacity-0",
                "animate-fadeIn opacity-100"
              )}
            >
              {lastMessage}
            </p>
          </div>
        </div>
      )}

      {/* Call control buttons */}
      <div className="w-full flex justify-center">
        {callStatus !== "ACTIVE" ? (
          <button
            className="relative btn-call flex items-center justify-center gap-2"
            onClick={() => handleCall()}
            disabled={callStatus === "CONNECTING"}
          >
            {/* Pulsing animation during connection */}
            <span
              className={cn(
                "absolute animate-ping rounded-full opacity-75",
                callStatus !== "CONNECTING" && "hidden"
              )}
            />

            {callStatus === "CONNECTING" ? (
              <>
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                <span className="relative">Connecting...</span>
              </>
            ) : (
              <span className="relative">
                {callStatus === "INACTIVE" || callStatus === "FINISHED"
                  ? "Call"
                  : ". . ."}
              </span>
            )}
          </button>
        ) : (
          <button className="btn-disconnect" onClick={() => handleDisconnect()}>
            End
          </button>
        )}
      </div>
    </>
  );
};

export default Agent;
