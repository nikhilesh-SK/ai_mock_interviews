/**
 * Application Constants
 * 
 * This module contains all constant values, configurations, and schemas
 * used throughout the PrepWise application including:
 * - Technology name mappings for icons
 * - AI interviewer configuration
 * - Feedback scoring schema
 * - Interview cover images
 * - Sample/dummy data for development
 */

import { CreateAssistantDTO } from "@vapi-ai/web/dist/api";
import { z } from "zod";

/**
 * Technology name mappings for DevIcons
 * 
 * Maps various technology name variations to their DevIcons identifier.
 * This handles cases like "React.js" -> "react", "Node.js" -> "nodejs"
 * to ensure consistent icon retrieval from the CDN.
 */
export const mappings = {
  // React ecosystem
  "react.js": "react",
  reactjs: "react",
  react: "react",
  
  // Next.js
  "next.js": "nextjs",
  nextjs: "nextjs",
  next: "nextjs",
  
  // Vue ecosystem
  "vue.js": "vuejs",
  vuejs: "vuejs",
  vue: "vuejs",
  
  // Express.js
  "express.js": "express",
  expressjs: "express",
  express: "express",
  
  // Node.js
  "node.js": "nodejs",
  nodejs: "nodejs",
  node: "nodejs",
  
  // Databases
  mongodb: "mongodb",
  mongo: "mongodb",
  mongoose: "mongoose",
  mysql: "mysql",
  postgresql: "postgresql",
  sqlite: "sqlite",
  firebase: "firebase",
  
  // DevOps & Cloud
  docker: "docker",
  kubernetes: "kubernetes",
  aws: "aws",
  azure: "azure",
  gcp: "gcp",
  digitalocean: "digitalocean",
  heroku: "heroku",
  
  // Design tools
  photoshop: "photoshop",
  "adobe photoshop": "photoshop",
  
  // Core web technologies
  html5: "html5",
  html: "html5",
  css3: "css3",
  css: "css3",
  sass: "sass",
  scss: "sass",
  less: "less",
  tailwindcss: "tailwindcss",
  tailwind: "tailwindcss",
  bootstrap: "bootstrap",
  jquery: "jquery",
  
  // Languages
  typescript: "typescript",
  ts: "typescript",
  javascript: "javascript",
  js: "javascript",
  
  // Other frameworks
  "angular.js": "angular",
  angularjs: "angular",
  angular: "angular",
  "ember.js": "ember",
  emberjs: "ember",
  ember: "ember",
  "backbone.js": "backbone",
  backbonejs: "backbone",
  backbone: "backbone",
  nestjs: "nestjs",
  
  // GraphQL & API
  graphql: "graphql",
  "graph ql": "graphql",
  apollo: "apollo",
  
  // Build tools
  webpack: "webpack",
  babel: "babel",
  "rollup.js": "rollup",
  rollupjs: "rollup",
  rollup: "rollup",
  "parcel.js": "parcel",
  parceljs: "parcel",
  npm: "npm",
  yarn: "yarn",
  
  // Version control
  git: "git",
  github: "github",
  gitlab: "gitlab",
  bitbucket: "bitbucket",
  
  // Other tools
  figma: "figma",
  prisma: "prisma",
  redux: "redux",
  flux: "flux",
  redis: "redis",
  
  // Testing
  selenium: "selenium",
  cypress: "cypress",
  jest: "jest",
  mocha: "mocha",
  chai: "chai",
  karma: "karma",
  
  // Vue ecosystem
  vuex: "vuex",
  "nuxt.js": "nuxt",
  nuxtjs: "nuxt",
  nuxt: "nuxt",
  
  // CMS & Hosting
  strapi: "strapi",
  wordpress: "wordpress",
  contentful: "contentful",
  netlify: "netlify",
  vercel: "vercel",
  "aws amplify": "amplify",
};

/**
 * AI Interviewer Assistant Configuration
 * 
 * This configuration defines the behavior of the Vapi voice AI assistant
 * that conducts mock interviews. It includes:
 * - Voice settings (ElevenLabs voice)
 * - Transcription settings (Deepgram)
 * - AI model settings (GPT-4)
 * - System prompt with interview guidelines
 */
export const interviewer: CreateAssistantDTO = {
  name: "Interviewer",
  
  // Initial greeting when the call starts
  firstMessage:
    "Hello! Thank you for taking the time to speak with me today. I'm excited to learn more about you and your experience.",
  
  // Speech-to-text configuration using Deepgram
  transcriber: {
    provider: "deepgram",
    model: "nova-2",      // Deepgram's latest model
    language: "en",        // English language
  },
  
  // Text-to-speech configuration using ElevenLabs
  voice: {
    provider: "11labs",
    voiceId: "21m00Tcm4TlvDq8ikWAM",  // Rachel voice
    stability: 0.5,           // Voice consistency
    similarityBoost: 0.75,    // How close to original voice
    speed: 0.9,               // Slightly slower for clarity
    style: 1,                 // Style enhancement
    useSpeakerBoost: true,    // Enhance voice clarity
  },
  
  // AI model configuration using OpenAI GPT-4
  model: {
    provider: "openai",
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: `You are a professional job interviewer conducting a real-time voice interview with a candidate. Your goal is to assess their qualifications, motivation, and fit for the role.

Interview Guidelines:
Follow the structured question flow:
{{questions}}

Engage naturally & react appropriately:
Listen actively to responses and acknowledge them before moving forward.
Ask brief follow-up questions if a response is vague or requires more detail.
Keep the conversation flowing smoothly while maintaining control.
Be professional, yet warm and welcoming:

Use official yet friendly language.
Keep responses concise and to the point (like in a real voice interview).
Avoid robotic phrasing—sound natural and conversational.
Answer the candidate's questions professionally:

If asked about the role, company, or expectations, provide a clear and relevant answer.
If unsure, redirect the candidate to HR for more details.

Conclude the interview properly:
Thank the candidate for their time.
Inform them that the company will reach out soon with feedback.
End the conversation on a polite and positive note.


- Be sure to be professional and polite.
- Keep all your responses short and simple. Use official language, but be kind and welcoming.
- This is a voice conversation, so keep your responses short, like in a real conversation. Don't ramble for too long.`,
      },
    ],
  },
};

/**
 * Feedback Schema (Zod)
 * 
 * Defines the structure of AI-generated interview feedback.
 * Used to validate and type the output from Google Gemini.
 * 
 * Categories scored from 0-100:
 * 1. Communication Skills
 * 2. Technical Knowledge
 * 3. Problem Solving
 * 4. Cultural Fit
 * 5. Confidence and Clarity
 */
export const feedbackSchema = z.object({
  /** Overall interview score (0-100) */
  totalScore: z.number(),
  
  /** Individual category scores with comments */
  categoryScores: z.tuple([
    z.object({
      name: z.literal("Communication Skills"),
      score: z.number(),
      comment: z.string(),
    }),
    z.object({
      name: z.literal("Technical Knowledge"),
      score: z.number(),
      comment: z.string(),
    }),
    z.object({
      name: z.literal("Problem Solving"),
      score: z.number(),
      comment: z.string(),
    }),
    z.object({
      name: z.literal("Cultural Fit"),
      score: z.number(),
      comment: z.string(),
    }),
    z.object({
      name: z.literal("Confidence and Clarity"),
      score: z.number(),
      comment: z.string(),
    }),
  ]),
  
  /** Array of candidate's strong points */
  strengths: z.array(z.string()),
  
  /** Array of areas where the candidate can improve */
  areasForImprovement: z.array(z.string()),
  
  /** Overall summary and recommendation */
  finalAssessment: z.string(),
});

/**
 * Interview Cover Images
 * 
 * List of cover image filenames for interviews.
 * A random cover is assigned to each new interview.
 */
export const interviewCovers = [
  "/adobe.png",
  "/amazon.png",
  "/facebook.png",
  "/hostinger.png",
  "/pinterest.png",
  "/quora.png",
  "/reddit.png",
  "/skype.png",
  "/spotify.png",
  "/telegram.png",
  "/tiktok.png",
  "/yahoo.png",
];

/**
 * Dummy Interview Data
 * 
 * Sample interviews for development and testing purposes.
 * Not used in production - real data comes from Firestore.
 */
export const dummyInterviews: Interview[] = [
  {
    id: "1",
    userId: "user1",
    role: "Frontend Developer",
    type: "Technical",
    techstack: ["React", "TypeScript", "Next.js", "Tailwind CSS"],
    level: "Junior",
    questions: ["What is React?"],
    finalized: false,
    createdAt: "2024-03-15T10:00:00Z",
  },
  {
    id: "2",
    userId: "user1",
    role: "Full Stack Developer",
    type: "Mixed",
    techstack: ["Node.js", "Express", "MongoDB", "React"],
    level: "Senior",
    questions: ["What is Node.js?"],
    finalized: false,
    createdAt: "2024-03-14T15:30:00Z",
  },
];
