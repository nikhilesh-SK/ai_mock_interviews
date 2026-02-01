/**
 * Root Layout Component
 * 
 * The root layout for the entire PrepWise application.
 * This layout wraps all pages and provides:
 * - Custom font configuration (Mona Sans)
 * - Dark mode as default
 * - Toast notifications via Sonner
 * - Global CSS styles
 * 
 * @see https://nextjs.org/docs/app/building-your-application/routing/pages-and-layouts
 */

import { Toaster } from "sonner";
import type { Metadata } from "next";
import { Mona_Sans } from "next/font/google";

import "./globals.css";

/**
 * Configure Mona Sans font from Google Fonts
 * Creates a CSS variable for use throughout the app
 */
const monaSans = Mona_Sans({
  variable: "--font-mona-sans",
  subsets: ["latin"],
});

/**
 * Page metadata for SEO
 * Defines the default title and description for the app
 */
export const metadata: Metadata = {
  title: "PrepWise",
  description: "An AI-powered platform for preparing for mock interviews",
};

/**
 * RootLayout Component
 * 
 * The top-level layout component that wraps the entire application.
 * Sets up the HTML document structure with dark mode and font.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${monaSans.className} antialiased pattern`}>
        {/* Page content */}
        {children}

        {/* Toast notification container */}
        <Toaster />
      </body>
    </html>
  );
}
