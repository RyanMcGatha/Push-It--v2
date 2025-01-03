"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MessageSquare, Eye, EyeOff, Check, X } from "lucide-react";
import { toast } from "sonner";
import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
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
        const result = await signIn("credentials", {
          email: values.email,
          password: values.password,
          action: "register",
          callbackUrl: "/onboarding",
          redirect: false,
        });

        if (result?.error) {
          toast.error(result.error);
          return;
        }

        if (result?.url) {
          router.push("/onboarding");
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-lg mx-auto"
    >
      <Card className="w-full max-w-xl mx-auto border-2">
        <CardHeader className="space-y-3 text-center pb-8">
          <motion.div
            className="flex justify-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Image
              src="/pushitt.png"
              alt="Push It Logo"
              width={50}
              height={50}
              aria-hidden="true"
              className="drop-shadow-md"
            />
          </motion.div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Push It!
          </h1>
          <p className="text-muted-foreground text-sm">
            {signup
              ? "Create an account to start messaging instantly"
              : "Welcome back! Sign in to your account"}
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
            <Button
              type="button"
              className="w-full relative group hover:shadow-md transition-all duration-200"
              variant="outline"
              disabled={isLoading}
              onClick={handleGoogleSignIn}
            >
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                <svg
                  className="h-5 w-5"
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
              </div>
              <span className="ml-4">Continue with Google</span>
            </Button>
          </motion.div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-4 text-muted-foreground">
                Or continue with email
              </span>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="email" className="text-sm font-medium">
                      Email
                    </FormLabel>
                    <FormControl>
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        autoComplete={signup ? "email" : "username"}
                        disabled={isLoading}
                        aria-required="true"
                        className="h-11"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel
                      htmlFor="password"
                      className="text-sm font-medium"
                    >
                      Password
                    </FormLabel>
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
                          className="h-11 pr-12"
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
                              className="h-4 w-4 text-muted-foreground transition-colors"
                              aria-hidden="true"
                            />
                          ) : (
                            <Eye
                              className="h-4 w-4 text-muted-foreground transition-colors"
                              aria-hidden="true"
                            />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage className="text-xs" />
                    {signup && (
                      <div className="mt-2 space-y-2">
                        <p className="text-xs text-muted-foreground mb-2">
                          Password requirements:
                        </p>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="flex items-center gap-1">
                            {field.value?.match(/[A-Z]/) ? (
                              <Check className="h-3 w-3 text-green-500" />
                            ) : (
                              <X className="h-3 w-3 text-muted-foreground" />
                            )}
                            <span className="text-muted-foreground">
                              Uppercase letter
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            {field.value?.match(/[a-z]/) ? (
                              <Check className="h-3 w-3 text-green-500" />
                            ) : (
                              <X className="h-3 w-3 text-muted-foreground" />
                            )}
                            <span className="text-muted-foreground">
                              Lowercase letter
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            {field.value?.match(/[0-9]/) ? (
                              <Check className="h-3 w-3 text-green-500" />
                            ) : (
                              <X className="h-3 w-3 text-muted-foreground" />
                            )}
                            <span className="text-muted-foreground">
                              Number
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            {field.value?.match(/[^A-Za-z0-9]/) ? (
                              <Check className="h-3 w-3 text-green-500" />
                            ) : (
                              <X className="h-3 w-3 text-muted-foreground" />
                            )}
                            <span className="text-muted-foreground">
                              Special character
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            {field.value?.length >= 8 ? (
                              <Check className="h-3 w-3 text-green-500" />
                            ) : (
                              <X className="h-3 w-3 text-muted-foreground" />
                            )}
                            <span className="text-muted-foreground">
                              8+ characters
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full h-11 font-medium"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                    <span>
                      {signup ? "Creating Account..." : "Signing In..."}
                    </span>
                  </div>
                ) : signup ? (
                  "Create Account"
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="pb-8">
          <p className="text-center text-sm text-muted-foreground w-full">
            {signup ? "Already have an account?" : "Don't have an account?"}{" "}
            <Link
              href={signup ? "/login" : "/sign-up"}
              className="text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary rounded font-medium"
            >
              {signup ? "Sign in" : "Create an account"}
            </Link>
          </p>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
