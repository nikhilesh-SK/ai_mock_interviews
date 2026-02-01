/**
 * Root Layout Component
 * 
 * Layout for the main authenticated section of the app.
 * Wraps pages like dashboard, interview, and feedback.
 * 
 * Features:
 * - Authentication guard (redirects to sign-in if not authenticated)
 * - Consistent navigation header with logo and sign-out
 */

import { ReactNode } from "react";
import { redirect } from "next/navigation";

import Header from "@/components/Header";
import { isAuthenticated, getCurrentUser } from "@/lib/actions/auth.action";

/**
 * RootLayout Component
 * 
 * Provides the layout structure for authenticated pages.
 * Checks authentication status and redirects if not logged in.
 * 
 * @param children - Page content to render inside the layout
 */
const Layout = async ({ children }: { children: ReactNode }) => {
  // Check if user is authenticated
  const isUserAuthenticated = await isAuthenticated();
  
  // Redirect to sign-in page if not authenticated
  if (!isUserAuthenticated) redirect("/sign-in");

  // Get current user for greeting
  const user = await getCurrentUser();

  return (
    <div className="root-layout">
      {/* Navigation Header with Sign Out */}
      <Header userName={user?.name} />

      {/* Page Content */}
      {children}
    </div>
  );
};

export default Layout;

