/**
 * Sign Up Page
 * 
 * Renders the authentication form in "sign-up" mode.
 * This is a server component wrapper around the client-side AuthForm.
 */

import AuthForm from "@/components/AuthForm";

/**
 * Sign Up Page Component
 */
const Page = () => {
  return <AuthForm type="sign-up" />;
};

export default Page;
