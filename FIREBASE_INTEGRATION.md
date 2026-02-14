# Firebase Integration

This project integrates Firebase for Authentication and Database (Firestore) services, utilizing both Client and Admin SDKs for security and functionality.

## Architecture

### 1. Client-Side (`firebase/client.ts`)
- **Library**: `firebase` (Standard Web SDK).
- **Purpose**: 
  - Handles User Authentication (Sign In/Sign Up).
  - Provides direct access to Firestore where security rules allow (though most operations are routed through Server Actions).
- **Configuration**: Public keys are safe to expose in the browser.

### 2. Server-Side (`firebase/admin.ts`)
- **Library**: `firebase-admin` (Admin SDK).
- **Purpose**:
  - Bypasses client-side security rules for trusted server operations.
  - Verifies Session Cookies in Middleware/Actions.
  - Performs complex database writes (like creating an interview with AI-generated content).
- **Security**: Uses a Service Account with private keys stored in environment variables (`FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`).

## Authentication Flow

1. **Login**: User signs in on the client side using Firebase Auth (Google or Email).
2. **Token Exchange**:
   - The client obtains a short-lived **ID Token**.
   - This token is sent to a Server Action (`lib/actions/auth.action.ts`).
3. **Session Creation**:
   - The server verifies the ID Token using the Admin SDK.
   - It creates a **Session Cookie** (HTTP-only, Secure) valid for 1 week.
   - This cookie is set in the user's browser.
4. **Verification**:
   - Subsequent requests verify the Session Cookie on the server to authenticate the user.

## Data Flow & AI Integration

The Firebase database acts as the central storage for the AI-driven features:

1. **Interview Generation**:
   - **Input**: User provides role/tech stack OR speaks via voice (Vapi).
   - **Processing**: The server (`app/api/vapi/generate/route.ts`) uses **Groq AI** to generate questions.
   - **Storage**: The structured interview object is saved to the `interviews` collection via `firebase-admin`.

2. **Feedback Loop**:
   - **Input**: User completes an interview.
   - **Processing**: Transcript is analyzed by **Groq AI**.
   - **Storage**: Results (scores, strengths, weaknesses) are saved to the `feedback` collection.
