/**
 * Sign In Page
 * 
 * Renders the authentication form in "sign-in" mode.
 * This is a server component wrapper around the client-side AuthForm.
 */

import AuthForm from "@/components/AuthForm";

/**
 * Sign In Page Component
 */
const Page = () => {
  return <AuthForm type="sign-in" />;
};

export default Page;
