/**
 * Utility Functions Module
 * 
 * This module contains helper utilities used throughout the PrepWise application
 * including class name merging, tech logo fetching, and interview cover generation.
 */

import { interviewCovers, mappings } from "@/constants";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines class names using clsx and merges Tailwind CSS classes intelligently.
 * This prevents conflicting Tailwind classes from both being applied.
 * 
 * @param inputs - Array of class values (strings, objects, or arrays)
 * @returns Merged class name string
 * 
 * @example
 * cn("p-4", "p-2") // Returns "p-2" (last one wins)
 * cn("text-red-500", condition && "text-blue-500")
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Base URL for fetching tech icons from the DevIcons CDN */
const techIconBaseURL = "https://cdn.jsdelivr.net/gh/devicons/devicon/icons";

/**
 * Normalizes a technology name to match the DevIcons naming convention.
 * Handles common variations like "React.js" -> "react", "Node.js" -> "nodejs"
 * 
 * @param tech - The technology name to normalize (e.g., "React.js", "Vue.js")
 * @returns The normalized icon name from the mappings object
 */
const normalizeTechName = (tech: string) => {
  // Convert to lowercase and remove ".js" suffix and whitespace
  const key = tech.toLowerCase().replace(/\.js$/, "").replace(/\s+/g, "");
  return mappings[key as keyof typeof mappings];
};

/**
 * Checks if an icon exists at the given URL by making a HEAD request.
 * 
 * @param url - The URL to check for icon existence
 * @returns Promise<boolean> - true if the icon exists, false otherwise
 */
const checkIconExists = async (url: string) => {
  try {
    const response = await fetch(url, { method: "HEAD" });
    return response.ok; // Returns true if the icon exists (status 200-299)
  } catch {
    return false; // Return false if request fails (network error, etc.)
  }
};

/**
 * Fetches logo URLs for an array of technology names.
 * For each tech, it attempts to find the corresponding DevIcon.
 * Falls back to a generic tech icon if the specific icon doesn't exist.
 * 
 * @param techArray - Array of technology names (e.g., ["React", "Node.js", "MongoDB"])
 * @returns Promise with array of objects containing tech name and icon URL
 * 
 * @example
 * const logos = await getTechLogos(["React", "TypeScript"]);
 * // Returns: [{ tech: "React", url: "https://..." }, { tech: "TypeScript", url: "https://..." }]
 */
export const getTechLogos = async (techArray: string[]) => {
  // Map each tech name to its potential icon URL
  const logoURLs = techArray.map((tech) => {
    const normalized = normalizeTechName(tech);
    return {
      tech,
      url: `${techIconBaseURL}/${normalized}/${normalized}-original.svg`,
    };
  });

  // Check if each icon exists and fallback to generic icon if not
  const results = await Promise.all(
    logoURLs.map(async ({ tech, url }) => ({
      tech,
      url: (await checkIconExists(url)) ? url : "/tech.svg",
    }))
  );

  return results;
};

/**
 * Returns a random interview cover image path from the predefined list.
 * Used to assign a random visual theme to newly created interviews.
 * 
 * @returns A random cover image path (e.g., "/covers/adobe.png")
 */
export const getRandomInterviewCover = () => {
  const randomIndex = Math.floor(Math.random() * interviewCovers.length);
  return `/covers${interviewCovers[randomIndex]}`;
};
