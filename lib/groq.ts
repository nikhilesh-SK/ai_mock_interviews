/**
 * GROQ API Integration Module
 * 
 * This module provides functionality to generate interview questions using the GROQ API.
 * It uses the llama-3.1-8b-instant model to create structured, level-based interview questions
 * based on the provided job details.
 */

import axios from "axios";

// GROQ API endpoint for chat completions (OpenAI-compatible API)
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

/**
 * Input parameters for generating interview questions
 * @property role - The job role for which questions are being generated (e.g., "Frontend Developer")
 * @property skills - Array of technical skills relevant to the role (e.g., ["React", "TypeScript"])
 * @property experience - The experience level of the candidate (e.g., "Junior", "Mid-level", "Senior")
 * @property project - Project context or interview type (e.g., "Technical", "Behavioral")
 * @property count - Total number of questions to generate
 */
interface QuestionDetails {
  role: string;
  skills: string[];
  experience: string;
  project: string;
  count: number;
}

/**
 * Structure of a single generated question
 * @property id - Unique identifier for the question (1-based index)
 * @property level - Difficulty level: "basic", "intermediate", or "advanced"
 * @property question - The actual interview question text
 */
interface GeneratedQuestion {
  id: number;
  level: string;
  question: string;
}

/**
 * Response structure from the GROQ question generation
 * @property questions - Array of generated interview questions
 */
interface GroqResponse {
  questions: GeneratedQuestion[];
}

/**
 * Generates interview questions using the GROQ API with llama-3.1-8b-instant model.
 * 
 * The function creates a structured prompt and sends it to the GROQ API,
 * which returns interview questions distributed across difficulty levels:
 * - Basic questions: 40% of total
 * - Intermediate questions: 40% of total
 * - Advanced questions: 20% of total
 * 
 * @param details - The interview details including role, skills, experience, project context, and question count
 * @returns A promise that resolves to an object containing an array of generated questions
 * @throws Will throw an error if the GROQ API request fails or returns invalid JSON
 * 
 * @example
 * const result = await generateQuestionsWithGroq({
 *   role: "Frontend Developer",
 *   skills: ["React", "JavaScript", "Redux"],
 *   experience: "2 years",
 *   project: "Technical",
 *   count: 10
 * });
 * // result.questions will contain 10 questions with varying difficulty levels
 */
export async function generateQuestionsWithGroq(details: QuestionDetails): Promise<GroqResponse> {
  const { role, skills, experience, project, count } = details;

  // Construct the prompt for the GROQ model
  // The prompt includes strict formatting rules to ensure consistent JSON output
  const prompt = `
You are a professional AI interviewer.

INPUT DETAILS:
- Role: ${role}
- Skills: ${skills.join(", ")}
- Experience Level: ${experience}
- Project Context: ${project}
- Total Questions Required: ${count}

RULES:
1. Generate EXACTLY ${count} questions.
2. Basic (40%), Intermediate (40%), Advanced (20%).
3. No repeated questions.
4. Return ONLY valid JSON.
5. No explanations.
6. Questions should NOT contain special characters like "/" or "*" that might break a voice assistant.

OUTPUT FORMAT:
{
  "questions": [
    { "id": 1, "level": "basic", "question": "" }
  ]
}
`;

  console.log("Calling GROQ API with key:", process.env.GROQ_GENERATIVE_API_KEY?.substring(0, 10) + "...");

  try {
    // Make the API request to GROQ
    // Using llama-3.1-8b-instant model (updated model name)
    const response = await axios.post(
      GROQ_URL,
      {
        model: "llama-3.1-8b-instant", // Replacement for decommissioned llama3-8b-8192
        temperature: 0.3, // Low temperature for more deterministic, consistent output
        messages: [
          // System message sets the context and role for the AI
          { role: "system", content: "You generate interview questions only. Always respond with valid JSON." },
          // User message contains the actual prompt with interview details
          { role: "user", content: prompt }
        ]
      },
      {
        headers: {
          // Authentication using the GROQ API key from environment variables
          Authorization: `Bearer ${process.env.GROQ_GENERATIVE_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    // Parse and return the JSON response from the model
    // The model returns the questions as a JSON string in the message content
    const content = response.data.choices[0].message.content;
    console.log("GROQ response:", content);
    
    // Handle potential markdown code blocks in response
    let jsonContent = content;
    if (content.includes("```json")) {
      jsonContent = content.replace(/```json\n?/g, "").replace(/```\n?/g, "");
    } else if (content.includes("```")) {
      jsonContent = content.replace(/```\n?/g, "");
    }
    
    return JSON.parse(jsonContent.trim());
  } catch (error: any) {
    console.error("GROQ API Error:", error.response?.data || error.message);
    throw error;
  }
}

/**
 * Structure of a single category score in feedback
 */
interface CategoryScore {
  name: string;
  score: number;
  comment: string;
}

/**
 * Structure of generated feedback
 */
export interface FeedbackResponse {
  totalScore: number;
  categoryScores: CategoryScore[];
  strengths: string[];
  areasForImprovement: string[];
  finalAssessment: string;
}

/**
 * Generates interview feedback using the GROQ API.
 * 
 * Analyzes the interview transcript and scores the candidate across
 * multiple categories, providing detailed feedback and improvement suggestions.
 * 
 * Categories scored (0-100):
 * - Communication Skills: Clarity, articulation, structured responses
 * - Technical Knowledge: Understanding of key concepts for the role
 * - Problem Solving: Ability to analyze problems and propose solutions
 * - Cultural & Role Fit: Alignment with company values and job role
 * - Confidence & Clarity: Confidence in responses, engagement, and clarity
 * 
 * @param transcript - Array of conversation messages with role and content
 * @returns A promise that resolves to structured feedback
 * @throws Will throw an error if the GROQ API request fails
 */
export async function generateFeedbackWithGroq(
  transcript: { role: string; content: string }[]
): Promise<FeedbackResponse> {
  // Format transcript into readable string
  const formattedTranscript = transcript
    .map((msg) => `- ${msg.role}: ${msg.content}`)
    .join("\n");

  const prompt = `
You are an expert interview evaluator. Analyze the following mock interview transcript and provide comprehensive feedback.

TRANSCRIPT:
${formattedTranscript}

EVALUATION CRITERIA:
Score the candidate from 0 to 100 in each category. Be thorough and critical - point out mistakes and areas for improvement.

REQUIRED OUTPUT FORMAT (JSON only, no other text):
{
  "totalScore": <number 0-100>,
  "categoryScores": [
    {
      "name": "Communication Skills",
      "score": <number 0-100>,
      "comment": "<specific feedback on clarity, articulation, and response structure>"
    },
    {
      "name": "Technical Knowledge",
      "score": <number 0-100>,
      "comment": "<specific feedback on understanding of technical concepts>"
    },
    {
      "name": "Problem Solving",
      "score": <number 0-100>,
      "comment": "<specific feedback on analytical thinking and solution approach>"
    },
    {
      "name": "Cultural & Role Fit",
      "score": <number 0-100>,
      "comment": "<specific feedback on alignment with role expectations>"
    },
    {
      "name": "Confidence & Clarity",
      "score": <number 0-100>,
      "comment": "<specific feedback on confidence level and clarity of responses>"
    }
  ],
  "strengths": [
    "<strength 1>",
    "<strength 2>",
    "<strength 3>"
  ],
  "areasForImprovement": [
    "<improvement area 1>",
    "<improvement area 2>",
    "<improvement area 3>"
  ],
  "finalAssessment": "<2-3 sentence overall summary of the candidate's performance>"
}
`;

  console.log("Generating feedback with GROQ...");

  try {
    const response = await axios.post(
      GROQ_URL,
      {
        model: "llama-3.1-8b-instant",
        temperature: 0.3,
        max_tokens: 2048,
        messages: [
          { 
            role: "system", 
            content: "You are an expert interview evaluator. Provide detailed, constructive feedback. Always respond with valid JSON only." 
          },
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
    console.log("GROQ Feedback response:", content);

    // Handle potential markdown code blocks in response
    let jsonContent = content;
    if (content.includes("```json")) {
      jsonContent = content.replace(/```json\n?/g, "").replace(/```\n?/g, "");
    } else if (content.includes("```")) {
      jsonContent = content.replace(/```\n?/g, "");
    }

    return JSON.parse(jsonContent.trim());
  } catch (error: any) {
    console.error("GROQ Feedback Error:", error.response?.data || error.message);
    throw error;
  }
}

