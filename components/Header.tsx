/**
 * Header Component
 * 
 * Navigation header with logo and sign-out functionality.
 * Client component to handle interactive sign-out button.
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "./ui/button";
import { signOut } from "@/lib/actions/auth.action";

interface HeaderProps {
  userName?: string;
  isAdmin?: boolean;
}

const Header = ({ userName, isAdmin }: HeaderProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Handle sign out with loading state
   */
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
    <nav className="flex items-center justify-between w-full">
      {/* Logo and App Name */}
      <Link href="/" className="flex items-center gap-2">
        <Image src="/logo.svg" alt="PrepWise Logo" width={38} height={32} />
        <h2 className="text-primary-100">PrepWise</h2>
      </Link>

      {/* User Info and Sign Out */}
      <div className="flex items-center gap-4">
        {isAdmin && (
          <Link href="/admin" className="font-semibold text-primary-200 mr-2">
            Admin
          </Link>
        )}
        {userName && (
          <span className="text-gray-300 text-sm hidden sm:block">
            Hi, {userName}
          </span>
        )}
        <Button
          className="btn-secondary px-4 py-2"
          onClick={handleSignOut}
          isLoading={isLoading}
          loadingText="Signing out..."
        >
          <span className="text-sm font-semibold text-primary-200">Sign Out</span>
        </Button>
      </div>
    </nav>
  );
};

export default Header;
