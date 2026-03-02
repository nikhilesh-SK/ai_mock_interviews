/**
 * Admin Sidebar Component
 * 
 * Navigation sidebar for admin dashboard with links to admin pages
 * and sign out functionality.
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/actions/auth.action";

interface NavItem {
  label: string;
  href: string;
  icon: string;
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/admin", icon: "📊" },
  { label: "Users", href: "/admin/users", icon: "👥" },
  { label: "Interviews", href: "/admin/interviews", icon: "🎤" },
];

const AdminSidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await signOut();
      toast.success("Signed out successfully");
      router.push("/sign-in");
    } catch (error) {
      console.error("Sign out error:", error);
      toast.error("Failed to sign out");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <aside className="admin-sidebar">
      {/* Logo and Title */}
      <div className="admin-sidebar-header">
        <Link href="/admin" className="flex items-center gap-2">
          <Image src="/logo.svg" alt="PrepWise Logo" width={32} height={28} />
          <h3 className="text-primary-100 text-xl font-bold">Admin</h3>
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="admin-sidebar-nav">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`admin-nav-item ${isActive ? "admin-nav-item-active" : ""}`}
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer with Sign Out */}
      <div className="admin-sidebar-footer">
        <Link href="/" className="admin-nav-item">
          <span className="text-lg">🏠</span>
          <span>Back to App</span>
        </Link>

        <Button
          className="admin-signout-btn"
          onClick={handleSignOut}
          isLoading={isLoading}
          loadingText="Signing out..."
        >
          <span className="text-lg">🚪</span>
          <span>Sign Out</span>
        </Button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
