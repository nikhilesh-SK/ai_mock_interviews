# PrepWise - How It Works & Technical Overview

## 1. Project Overview
**PrepWise** is an AI-powered mock interview platform that helps users prepare for job interviews. 
**Key Concept**: Instead of just reading questions, users have a **voice conversation** with an AI interviewer. The system understands their responses, generates dynamic questions, and provides detailed feedback on their performance.

---

## 2. Key Features
*   **Voice-First Interface**: Users talk to the AI naturally, just like a real interview.
*   **Dynamic Interview Generation**: The AI creates custom interviews based on what the user wants to practice (e.g., "I want a React interview for a Senior role").
*   **Real-time Interaction**: Uses **Vapi** for low-latency voice conversations.
*   **Smart Feedback**: Uses **GROQ** (Llama 3 model) to analyze the entire conversation and score the candidate.
*   **Live Dashboard**: Updates instantly when new interviews are created (using **Valtio**).
*   **Admin Panel**: For managing users and monitoring platform usage.

---

## 3. Technology Stack
*   **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS.
*   **Backend**: Next.js Server Actions, API Routes.
*   **Database**: Firebase Firestore (NoSQL).
*   **Authentication**: Firebase Auth (Google/Email) with HTTP-only session cookies.
*   **AI & Voice**: 
    *   **Vapi**: For handling the voice streaming and conversation flow.
    *   **GROQ**: For ultra-fast LLM inference (Generating questions & feedback).
*   **State Management**: Valtio (Proxy-based state).

---

## 4. Workflow & Technical Deep Dive

### Phase 1: Authentication (Secure Login)
**How it works**: 
We use a hybrid approach. Firebase handles the client-side login, but we create a secure HTTP-only cookie for the server-side session. This allows us to protect pages in `middleware` or Server Components.

**Key File**: `lib/actions/auth.action.ts`
```typescript
// When a user logs in on the client:
export async function signIn(params: SignInParams) {
  // 1. Verify user with Firebase Auth
  // 2. Create a session cookie
  await auth.createSessionCookie(idToken, { expiresIn: SESSION_DURATION });
  
  // 3. Set it as an HTTP-only cookie (secure from XSS attacks)
  cookies().set("session", sessionCookie, { httpOnly: true, ... });
}
```

---

### Phase 2: Generating an Interview
**How it works**: 
The user doesn't just fill a form. They **talk** to an AI Agent to describe what they want.

1.  **Voice Collection**: The `Agent` component (`components/Agent.tsx`) starts a "generate" mode call.
2.  **Extraction**: The conversation transcript is sent to our API.
3.  **Generation**: We use GROQ to generate questions based on the extracted details.

**Key File**: `app/api/vapi/generate/route.ts`
```typescript
// The API receives the transcript or manual inputs
export async function POST(request: Request) {
  // 1. Extract details (Role, Tech Stack) from transcript using AI
  const extractedData = await extractDetailsFromTranscript(transcript);

  // 2. Generate specific questions using GROQ
  const groqResult = await generateQuestionsWithGroq({
    role: extractedData.role,
    skills: extractedData.techstack,
    // ...
  });

  // 3. Save the interview to Firebase
  await db.collection("interviews").add({
    questions: groqResult.questions,
    // ...
  });
}
```

---

### Phase 3: Taking the Interview
**How it works**:
This is the core experience. We use **Vapi** to create a conversational AI that acts as the interviewer.

1.  **Initialization**: The `Agent` component starts in "interview" mode.
2.  **Context Loading**: We pass the generated questions to Vapi as context.
3.  **Conversation**: The user speaks, Vapi listens, transcribes, and responds using the AI model designated as the "Interviewer".
4.  **Recording**: We listen to the `message` event from Vapi to build a real-time transcript of the interview.

**Key File**: `components/Agent.tsx`
```typescript
// Inside the Agent component
useEffect(() => {
  vapi.on("message", (message) => {
    // We capture every message to build the transcript
    if (message.type === "transcript" && message.transcriptType === "final") {
      setMessages(prev => [...prev, { 
        role: message.role, 
        content: message.transcript 
      }]);
    }
  });
}, []);

// Starting the call with specific questions
const handleCall = async () => {
  await vapi.start(interviewer, {
    variableValues: {
      questions: formattedQuestions, // The AI knows what to ask!
    },
  });
};
```

---

### Phase 4: Feedback Generation
**How it works**:
Once the call ends, we don't just say "Good job". We send the *entire* conversation transcript to GROQ to analyze it like a human recruiter would.

1.  **Trigger**: When the user clicks "End Call" or the set time expires.
2.  **Analysis**: The transcript is sent to `generateFeedbackWithGroq`.
3.  **Scoring**: The AI scores the candidate on Communication, Technical Knowledge, Problem Solving, etc.

**Key File**: `lib/groq.ts`
```typescript
export async function generateFeedbackWithGroq(transcript) {
  // We constructs a strict prompt for the AI
  const prompt = `
    Role: Expert Interview Evaluator
    Task: Analyze this transcript: ${transcript}
    Output: JSON with scores (0-100), strengths, and improvements.
  `;

  // Call GROQ API (Llama 3 model)
  const response = await axios.post(GROQ_URL, { ... });
  
  return JSON.parse(response.data...); // Returns structured feedback object
}
```

---

## 5. Folder Structure Explained

*   **`app/`**: All the pages (Next.js App Router).
    *   `app/(auth)`: Sign-in/Sign-up pages.
    *   `app/(root)`: Dashboard and Interview pages.
    *   `app/api`: Backend API routes (like the interview generator).
*   **`components/`**: Reusable UI blocks.
    *   `Agent.tsx`: The most important component (Handles Voice AI).
    *   `InterviewCard.tsx`: Displays interview summaries.
*   **`lib/`**: Helper functions.
    *   `actions/`: Server actions for database and auth logic.
    *   `groq.ts`: All AI generation logic lives here.
    *   `vapi.sdk.ts`: Configuration for the voice AI.
*   **`store/`**: Global state management (Valtio) to keep the UI in sync.

---

## 6. How to Run It
1.  **Install Dependencies**: `npm install`
2.  **Environment Setup**: Configure `.env.local` with Firebase, Vapi, and GROQ keys.
3.  **Run Development Server**: `npm run dev`
4.  **Open**: Go to `http://localhost:3000`

---
