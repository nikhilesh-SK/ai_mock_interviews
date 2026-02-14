# How the AI Agent Works (Technical Deep Dive)

This document explains the internal architecture of the AI Agent in **PrepWise**. It is designed for developers who want to understand how the Voice AI, LLM (Large Language Model), and Backend systems interact.

---

## 1. High-Level Architecture

The system is built on a **Voice-First** architecture. The user speaks to the browser, which streams audio to **Vapi**. Vapi handles the Speech-to-Text (STT), orchestrates the conversation, and uses Text-to-Speech (TTS) to respond. For intelligence (generating specific questions or feedback), we use **Groq** (hosting Llama 3 models) via our Next.js backend.

```mermaid
graph TD
    User((User)) <-->|Voice Stream| Vapi[Vapi Voice AI]
    
    subgraph "Frontend (Next.js)"
        Agent[Agent.tsx Component]
    end
    
    subgraph "Backend (Next.js API)"
        GenAPI[/api/vapi/generate]
        FeedbackAction[createFeedback Action]
    end
    
    subgraph "Intelligence (Groq)"
        Llama[Llama 3.1 8b Instant]
    end

    Vapi <-->|Events & Transcripts| Agent
    Agent -->|Transcript| GenAPI
    Agent -->|Transcript| FeedbackAction
    
    GenAPI -->|Prompt| Llama
    FeedbackAction -->|Prompt| Llama
```

---

## 2. The Voice Layer (Vapi)

The core voice interaction is handled by **Vapi** (Voice AI Platform). We use the `@vapi-ai/web` SDK in the client-side `Agent.tsx` component.

### Key Responsibilities:
1.  **Speech-to-Text**: Transcribes user audio in real-time.
2.  **Turn Taking**: Detects when the user finishes speaking.
3.  **Text-to-Speech**: Streams the AI's audio response back to the user.
4.  **State Management**: Tracks connection status (`CONNECTING`, `ACTIVE`, `FINISHED`).

### Implementation Details (`components/Agent.tsx`):
-   **Initialization**: We initialize Vapi with a public key and attach event listeners (`call-start`, `message`, `call-end`).
-   **Context Injection**: When an interview starts, we pass the generated questions to Vapi as "context" so the AI knows what to ask.
    ```typescript
    await vapi.start(interviewer, {
      variableValues: {
        questions: formattedQuestions, // The AI reads this list
      },
    });
    ```
-   **Transcript Handling**: We listen to the `message` event. When `message.type === "transcript"` and `transcriptType === "final"`, we append it to our local chat history.

---

## 3. The Intelligence Layer (Groq & Llama 3)

While Vapi handles the *conversation flow*, the *deep thinking* (generating questions and analyzing performance) is done by **Llama 3.1 8b Instant** hosted on **Groq**. Groq is chosen for its ultra-low latency.

### A. Interview Generation
When a user asks for an interview (e.g., *"I want a React technical interview"*):
1.  **Extraction**: The conversation transcript is sent to `/api/vapi/generate`.
2.  **Parsing**: Groq analyzes the text to extract structured data: `Role`, `Tech Stack`, `Experience Level`.
3.  **Generation**: Groq generates a list of 5-10 questions with varying difficulty (Basic, Intermediate, Advanced).
4.  **Format**: The output is strictly enforced JSON.

### B. Feedback & Scoring
After the interview ends:
1.  **Analysis**: The full transcript is sent to `generateFeedbackWithGroq` in `lib/groq.ts`.
2.  **Grading**: The AI evaluates the candidate on 5 criteria:
    -   Communication
    -   Technical Accuracy
    -   Problem Solving
    -   Cultural Fit
    -   Confidence
3.  **Output**: A detailed JSON object with scores (0-100), functionality, and specific improvement tips.

---

## 4. Key Workflows

### Workflow 1: Creating an Interview
1.  **User**: *"I need to practice for a Senior Node.js role."*
2.  **Vapi**: Transcribes and extracts variables (Role: Node.js, Level: Senior).
3.  **Agent.tsx**: Detects `call-end` and calls `/api/vapi/generate`.
4.  **Backend**: 
    -   Calls Groq to generate 10 Node.js questions.
    -   Saves interview to Firebase (`interviews` collection).
5.  **Frontend**: Redirects user to the new interview page.

### Workflow 2: Conducting the Interview
1.  **Frontend**: Loads the derived questions from Firebase.
2.  **Vapi**: Starts the call with the System Prompt: *"You are a technical interviewer. Ask these questions: [List]..."*
3.  **User**: Answers questions via voice.
4.  **Vapi**: Validates answers conversationally (handled by Vapi's internal LLM logic).
5.  **Agent.tsx**: Accumulates the transcript array `[{role: 'user', content: '...'}, {role: 'ai', content: '...'}]`.

### Workflow 3: Generating Feedback
1.  **Frontend**: User clicks "End Interview".
2.  **Action**: `createFeedback(transcript)` server action is called.
3.  **Groq**: Analyzes the transcript against the "Expert Interviewer" system prompt.
4.  **Database**: Saves the score and feedback to Firebase (`feedback` collection).
5.  **UI**: Shows the feedback dashboard.

---

## 5. File Structure Reference

| File | Purpose |
| :--- | :--- |
| `components/Agent.tsx` | **The Brain.** Manages Vapi connection, state, and event handling. |
| `lib/vapi.sdk.ts` | **Configuration.** Initializes the Vapi web client. |
| `lib/groq.ts` | **Intelligence.** Functions to call Llama 3 for generation and feedback. |
| `app/api/vapi/generate/route.ts` | **API Endpoint.** Handles new interview creation requests. |
| `lib/actions/general.action.ts` | **Server Actions.** Handles database operations and feedback triggering. |

---

## 6. Customization Guide

### Changing the AI Personality
Edit the `interviewer` constant in `constants/index.ts` (or mapped file) to change the System Prompt passed to Vapi.

### Adjusting Question Difficulty
Modify the prompt in `lib/groq.ts` inside `generateQuestionsWithGroq`. You can change the distribution (e.g., from 40% Basic to 20% Basic).

### Changing the Model
We currently use `llama-3.1-8b-instant`. To use a different model (e.g., Mixtral), update the `model` parameter in `lib/groq.ts`.
