/**
 * DisplayTechIcons Component
 * 
 * Displays technology names as styled badges.
 * Handles both array and comma-separated string inputs.
 * Used in InterviewCard to show the tech stack for each interview.
 */

import Image from "next/image";

import { cn, getTechLogos } from "@/lib/utils";

/**
 * DisplayTechIcons Component
 * 
 * Renders technology names as small badges with consistent styling.
 * Originally designed to show icons, now displays tech names as text badges
 * for better reliability and performance.
 * 
 * @param techStack - Array of tech names or comma-separated string
 * 
 * @example
 * // Array input
 * <DisplayTechIcons techStack={["React", "TypeScript", "Node.js"]} />
 * 
 * // String input
 * <DisplayTechIcons techStack="React, TypeScript, Node.js" />
 */
const DisplayTechIcons = ({ techStack }: TechIconProps) => {
  // Normalize input: convert comma-separated string to array if needed
  const techs = Array.isArray(techStack) ? techStack : (techStack as string).split(",");

  return (
    <div className="flex flex-row gap-2 flex-wrap">
       {/* Map through each technology and create a badge */}
       {techs.map((tech, index) => (
         <div
           key={index}
           className="px-3 py-1 bg-dark-300 rounded-md text-sm text-light-100 border border-dark-400/50"
         >
           {/* Trim whitespace from tech name */}
           {tech.trim()}
         </div>
       ))}
    </div>
  );
};

export default DisplayTechIcons;
