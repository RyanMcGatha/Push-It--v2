"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MessageSquare, Eye, EyeOff } from "lucide-react";
import { toast } from "react-hot-toast";
import { signIn } from "next-auth/react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

interface FormProps {
  signup?: boolean;
}

const formSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(
      /[^A-Za-z0-9]/,
      "Password must contain at least one special character"
    ),
});

export function AuthForm({ signup = false }: FormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsLoading(true);

      if (signup) {
        // Handle signup

        // Sign in the user after successful signup
        const result = await signIn("credentials", {
          email: values.email,
          password: values.password,
          action: "register",
          callbackUrl: "/dashboard",
          redirect: false,
        });

        if (result?.error) {
          toast.error(result.error);
          return;
        }

        if (result?.url) {
          router.push(result.url);
          toast.success("Account created successfully!");
        }
      } else {
        // Handle login
        const result = await signIn("credentials", {
          email: values.email,
          password: values.password,
          redirect: false,
          callbackUrl: "/dashboard",
        });

        if (result?.error) {
          toast.error(result.error);
          return;
        }

        if (result?.url) {
          router.push(result.url);
          toast.success("Logged in successfully!");
        }
      }
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error("An unexpected error occurred. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      await signIn("google", { callbackUrl: "/dashboard" });
    } catch (error) {
      console.error("Google sign in error:", error);
      toast.error("An error occurred with Google sign in");
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1 text-center">
        <div className="flex justify-center">
          <MessageSquare
            className="h-12 w-12 text-primary"
            aria-hidden="true"
          />
        </div>
        <h1 className="text-3xl font-bold">Push It!</h1>
        <p className="text-muted-foreground">
          {signup
            ? "Sign up to start messaging instantly"
            : "Sign in with your account"}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          type="button"
          className="w-full"
          variant="outline"
          disabled={isLoading}
          onClick={handleGoogleSignIn}
        >
          <svg
            className="mr-2 h-4 w-4"
            aria-hidden="true"
            focusable="false"
            data-prefix="fab"
            data-icon="google"
            role="img"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 488 512"
          >
            <path
              fill="currentColor"
              d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
            ></path>
          </svg>
          Continue with Google
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="email">Email</FormLabel>
                  <FormControl>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      autoComplete={signup ? "email" : "username"}
                      disabled={isLoading}
                      aria-required="true"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="password">Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder={
                          signup
                            ? "Create a strong password"
                            : "Enter your password"
                        }
                        autoComplete={
                          signup ? "new-password" : "current-password"
                        }
                        disabled={isLoading}
                        aria-required="true"
                        {...field}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={togglePasswordVisibility}
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                      >
                        {showPassword ? (
                          <EyeOff
                            className="h-4 w-4 text-gray-500"
                            aria-hidden="true"
                          />
                        ) : (
                          <Eye
                            className="h-4 w-4 text-gray-500"
                            aria-hidden="true"
                          />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                  {signup && (
                    <FormDescription>
                      Password must be at least 8 characters and contain
                      uppercase, lowercase, numbers, and special characters.
                    </FormDescription>
                  )}
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <span className="loading loading-spinner loading-sm mr-2"></span>
                  {signup ? "Creating Account..." : "Signing In..."}
                </>
              ) : signup ? (
                "Sign Up"
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter>
        <p className="text-center text-sm text-muted-foreground w-full">
          {signup ? "Already have an account?" : "Don't have an account?"}{" "}
          <Link
            href={signup ? "/login" : "/sign-up"}
            className="text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary rounded"
          >
            {signup ? "Log in" : "Sign up"}
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
