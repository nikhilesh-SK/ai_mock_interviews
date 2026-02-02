/**
 * Admin Layout
 * 
 * Layout for admin dashboard pages with sidebar navigation.
 * Includes authentication guard to ensure only admin users can access.
 */

import { ReactNode } from "react";
import { redirect } from "next/navigation";

import AdminSidebar from "@/components/admin/AdminSidebar";
import { getCurrentUser } from "@/lib/actions/auth.action";
import { isAdmin } from "@/lib/actions/admin.action";

/**
 * Admin Layout Component
 * 
 * Wraps all admin pages with sidebar and content area.
 * Redirects non-admin users to home page.
 */
const AdminLayout = async ({ children }: { children: ReactNode }) => {
  // Check if user is authenticated
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  // Check if user is an admin
  const adminAccess = await isAdmin();
  if (!adminAccess) redirect("/");

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-content">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
