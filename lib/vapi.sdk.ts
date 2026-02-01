/**
 * VAPI SDK Configuration
 * 
 * This module initializes and exports the Vapi client for voice AI interactions.
 * Vapi is used for conducting voice-based mock interviews and gathering user
 * requirements through natural conversation.
 * 
 * @see https://vapi.ai/docs
 */

import Vapi from "@vapi-ai/web";

/**
 * Vapi client instance configured with the web token from environment variables.
 * This client is used throughout the application to:
 * - Start voice calls with AI interviewers
 * - Handle real-time transcription
 * - Manage call lifecycle events
 */
export const vapi = new Vapi(process.env.NEXT_PUBLIC_VAPI_WEB_TOKEN!);
