/**
 * Interview Generation API Route
 * 
 * This API endpoint handles the creation of new mock interviews.
 * It processes interview parameters (role, level, tech stack, etc.),
 * optionally extracts details from a voice conversation transcript,
 * generates interview questions using GROQ API, and saves the
 * interview to Firebase.
 * 
 * Endpoint: POST /api/vapi/generate
 */

import axios from "axios";
import { db } from "@/firebase/admin";
import { getRandomInterviewCover } from "@/lib/utils";
import { generateQuestionsWithGroq } from "@/lib/groq";

// GROQ API endpoint for chat completions
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

/**
 * Extract interview details from a transcript using GROQ
 * 
 * @param transcript - The conversation transcript to analyze
 * @returns Extracted interview details (role, techstack, level, type, amount)
 */
async function extractDetailsFromTranscript(transcript: string) {
  const prompt = `Analyze the following conversation where a user describes the interview they want to practice. Extract the interview details and return ONLY valid JSON.

Transcript:
${transcript}

Return JSON in this exact format (no other text):
{
  "role": "the job role discussed, e.g. Frontend Developer",
  "techstack": "the tech stack discussed, e.g. React, Node.js",
  "level": "the experience level, e.g. Junior, Mid-level, Senior",
  "type": "the type of interview, e.g. Technical, Behavioral, Mixed",
  "amount": 5
}

If a value is not explicitly mentioned, use these defaults:
- role: "Software Developer"
- techstack: "JavaScript, React"
- level: "Mid-level"
- type: "Technical"
- amount: 5`;

  try {
    const response = await axios.post(
      GROQ_URL,
      {
        model: "llama-3.1-8b-instant", // Replacement for decommissioned llama3-8b-8192
        temperature: 0.1, // Very low temperature for consistent extraction
        messages: [
          { role: "system", content: "You extract interview details from conversations and return only valid JSON." },
          { role: "user", content: prompt }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_GENERATIVE_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const content = response.data.choices[0].message.content;
    
    // Try to parse the JSON response
    // Sometimes the model wraps it in markdown code blocks
    let jsonContent = content;
    if (content.includes("```json")) {
      jsonContent = content.replace(/```json\n?/g, "").replace(/```\n?/g, "");
    } else if (content.includes("```")) {
      jsonContent = content.replace(/```\n?/g, "");
    }
    
    return JSON.parse(jsonContent.trim());
  } catch (error) {
    console.error("Error extracting from transcript:", error);
    // Return defaults if extraction fails
    return {
      role: "Software Developer",
      techstack: "JavaScript, React",
      level: "Mid-level",
      type: "Technical",
      amount: 5
    };
  }
}

/**
 * POST handler for creating a new interview
 * 
 * This function:
 * 1. Receives interview parameters from the client
 * 2. If a transcript is provided, uses GROQ to extract/confirm interview details
 * 3. Generates interview questions using GROQ API with difficulty distribution
 * 4. Saves the complete interview to Firebase
 * 5. Returns the saved interview data to the client
 * 
 * @param request - The incoming HTTP request containing interview parameters
 * @returns JSON response with success status and interview data
 */
export async function POST(request: Request) {
  // Extract interview parameters from the request body
  // These may come from frontend form inputs or voice conversation
  const { type, role, level, techstack, amount, userid, transcript } = await request.json();

  try {
    // Initialize final values with the provided parameters
    // These may be overwritten if we extract better data from the transcript
    let finalRole = role;
    let finalType = type;
    let finalLevel = level;
    let finalTechstack = techstack;
    let finalAmount = amount;

    // ========================================
    // STEP 1: Transcript Analysis (if provided)
    // ========================================
    // If a voice conversation transcript is provided, analyze it to extract
    // interview details. This ensures we capture exactly what the user said
    // rather than relying on potentially default/fallback values.
    if (transcript) {
      // Use GROQ to extract structured data from the conversation
      const extractedData = await extractDetailsFromTranscript(transcript);
      
      // Log extracted data for debugging purposes
      console.log("Extracted data from transcript:", extractedData);
      
      // Override initial values with extracted data if available
      // This prioritizes what the user actually said in the conversation
      if (extractedData.role) finalRole = extractedData.role;
      if (extractedData.techstack) finalTechstack = extractedData.techstack;
      if (extractedData.level) finalLevel = extractedData.level;
      if (extractedData.type) finalType = extractedData.type;
      if (extractedData.amount) finalAmount = extractedData.amount;
    }

    // ========================================
    // STEP 2: Generate Interview Questions
    // ========================================
    // Convert techstack to array format if it's a comma-separated string
    // This handles both formats: "React, Node.js" and ["React", "Node.js"]
    const skillsArray = typeof finalTechstack === 'string' 
      ? finalTechstack.split(",").map((s: string) => s.trim()) 
      : finalTechstack;

    // Call GROQ API to generate interview questions
    // Questions are distributed: 40% Basic, 40% Intermediate, 20% Advanced
    const groqResult = await generateQuestionsWithGroq({
      role: finalRole,
      skills: skillsArray,
      experience: finalLevel,
      project: finalType, // Using interview type as project context
      count: finalAmount || 10, // Default to 10 questions if not specified
    });

    // Log generated questions for debugging
    console.log("GROQ generated questions:", groqResult);

    // Extract just the question text strings from the structured response
    // The interview format stores questions as a simple string array
    const questions = groqResult.questions.map(q => q.question);

    // ========================================
    // STEP 3: Create Interview Document
    // ========================================
    // Build the complete interview object to store in Firebase
    const interview = {
      role: finalRole,           // Job role (e.g., "Frontend Developer")
      type: finalType,           // Interview type (e.g., "Technical", "Behavioral")
      level: finalLevel,         // Experience level (e.g., "Junior", "Mid-level")
      techstack: skillsArray,    // Array of technologies/skills
      questions: questions,       // Array of generated question strings
      userId: userid,            // ID of the user who created this interview
      finalized: true,           // Mark interview as ready for use
      coverImage: getRandomInterviewCover(), // Random cover image for UI display
      createdAt: new Date().toISOString(),   // Timestamp for sorting/display
    };

    // Log the interview for debugging
    console.log("Interview saved to Firebase:", interview);

    // ========================================
    // STEP 4: Save to Firebase & Return
    // ========================================
    // Add the interview document to the "interviews" collection
    const docRef = await db.collection("interviews").add(interview);
    
    // Include the generated document ID with the interview data
    // This allows the frontend to update the UI immediately without refetching
    const savedInterview = { id: docRef.id, ...interview };
    
    // Return success response with the complete interview object
    return Response.json({ success: true, interview: savedInterview }, { status: 200 });
  } catch (error) {
    // Log and return any errors that occur during the process
    console.error("Error generating questions:", error);
    return Response.json({ success: false, error: String(error) }, { status: 500 });
  }
}

/**
 * GET handler for API health check
 * 
 * Simple endpoint to verify the API is running and accessible.
 * 
 * @returns JSON response with success status
 */
export async function GET() {
  return Response.json({ success: true, data: "Thank you!" }, { status: 200 });
}
