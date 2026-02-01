/**
 * AuthForm Component
 * 
 * Reusable authentication form that handles both sign-in and sign-up flows.
 * Uses react-hook-form with Zod validation and Firebase Authentication.
 * 
 * Features:
 * - Dynamic form fields based on form type
 * - Client-side validation with Zod
 * - Firebase email/password authentication
 * - Session cookie creation for persistent auth
 */

"use client";

import { z } from "zod";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { auth } from "@/firebase/client";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";

import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";

import { signIn, signUp } from "@/lib/actions/auth.action";
import FormField from "./FormField";

/**
 * Creates a Zod validation schema based on the form type.
 * Sign-up requires name, sign-in only needs email and password.
 * 
 * @param type - "sign-in" or "sign-up"
 * @returns Zod schema for form validation
 */
const authFormSchema = (type: FormType) => {
  return z.object({
    // Name is required only for sign-up
    name: type === "sign-up" ? z.string().min(3) : z.string().optional(),
    email: z.string().email(),
    password: z.string().min(3), // Minimum 3 characters for password
  });
};

/**
 * AuthForm Component
 * 
 * @param type - "sign-in" or "sign-up" determines the form behavior
 */
const AuthForm = ({ type }: { type: FormType }) => {
  const router = useRouter();

  // Initialize form with dynamic schema based on type
  const formSchema = authFormSchema(type);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  /**
   * Handle form submission for both sign-in and sign-up
   * 
   * Sign-up flow:
   * 1. Create Firebase Auth user
   * 2. Save user data to Firestore
   * 3. Redirect to sign-in
   * 
   * Sign-in flow:
   * 1. Authenticate with Firebase
   * 2. Create session cookie
   * 3. Redirect to dashboard
   */
  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      if (type === "sign-up") {
        const { name, email, password } = data;

        // Create user in Firebase Authentication
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

        // Save additional user data to Firestore
        const result = await signUp({
          uid: userCredential.user.uid,
          name: name!,
          email,
          password,
        });

        if (!result.success) {
          toast.error(result.message);
          return;
        }

        toast.success("Account created successfully. Please sign in.");
        router.push("/sign-in");
      } else {
        // Sign-in flow
        const { email, password } = data;

        // Authenticate with Firebase
        const userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );

        // Get ID token for session creation
        const idToken = await userCredential.user.getIdToken();
        if (!idToken) {
          toast.error("Sign in Failed. Please try again.");
          return;
        }

        // Create server-side session cookie
        await signIn({
          email,
          idToken,
        });

        toast.success("Signed in successfully.");
        router.push("/");
      }
    } catch (error) {
      console.log(error);
      toast.error(`There was an error: ${error}`);
    }
  };

  const isSignIn = type === "sign-in";

  return (
    <div className="card-border lg:min-w-[566px]">
      <div className="flex flex-col gap-6 card py-14 px-10">
        {/* Logo and title */}
        <div className="flex flex-row gap-2 justify-center">
          <Image src="/logo.svg" alt="logo" height={32} width={38} />
          <h2 className="text-primary-100">PrepWise</h2>
        </div>

        <h3>Practice job interviews with AI</h3>

        {/* Form with react-hook-form */}
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="w-full space-y-6 mt-4 form"
          >
            {/* Name field only shown for sign-up */}
            {!isSignIn && (
              <FormField
                control={form.control}
                name="name"
                label="Name"
                placeholder="Your Name"
                type="text"
              />
            )}

            {/* Email field */}
            <FormField
              control={form.control}
              name="email"
              label="Email"
              placeholder="Your email address"
              type="email"
            />

            {/* Password field */}
            <FormField
              control={form.control}
              name="password"
              label="Password"
              placeholder="Enter your password"
              type="password"
            />

            {/* Submit button */}
            <Button className="btn" type="submit">
              {isSignIn ? "Sign In" : "Create an Account"}
            </Button>
          </form>
        </Form>

        {/* Toggle between sign-in and sign-up */}
        <p className="text-center">
          {isSignIn ? "No account yet?" : "Have an account already?"}
          <Link
            href={!isSignIn ? "/sign-in" : "/sign-up"}
            className="font-bold text-user-primary ml-1"
          >
            {!isSignIn ? "Sign In" : "Sign Up"}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default AuthForm;
