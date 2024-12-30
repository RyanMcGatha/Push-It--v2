"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageSquare } from "lucide-react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import React from "react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import handleSignUp from "../helpers/handleSignUp";
import handleLogin from "../helpers/handleLogin";
import toast from "react-hot-toast";

interface FormProps {
  signup: boolean;
}

export function AuthForm({ signup = false }: FormProps) {
  const formSchema = z.object({
    email: z
      .string()
      .min(1, "Email is required")
      .email("Invalid email address"),
    password: z
      .string()
      .min(1, "Password is required")
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
  });

  const [isLoading, setIsLoading] = React.useState(false);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsLoading(true);
      if (signup) {
        const response = await handleSignUp(values.email, values.password);
        if (response.success) {
          toast.success("Account created successfully!");
          window.location.href = "/login";
        } else {
          toast.error(response.message || "Failed to create account");
        }
      } else {
        const response = await handleLogin(values.email, values.password);
        if (response.success) {
          toast.success("Logged in successfully!");
          window.location.href = "/messages";
        } else {
          toast.error(response.message || "Failed to login");
        }
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  return (
    <div className="m-auto w-full max-w-md p-8 bg-white rounded-xl shadow-md dark:bg-gray-800">
      <div className="flex flex-col items-center space-y-4 mb-6">
        <MessageSquare className="h-12 w-12 text-primary" aria-hidden="true" />
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
          Push It!
        </h1>
        <p className="text-muted-foreground text-center">
          {signup
            ? "Sign up to start messaging instantly"
            : "Sign in with your account"}
        </p>
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
                  <Input
                    id="password"
                    type="password"
                    placeholder={
                      signup
                        ? "Create a strong password"
                        : "Enter your password"
                    }
                    autoComplete={signup ? "new-password" : "current-password"}
                    disabled={isLoading}
                    aria-required="true"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
                {signup && (
                  <FormDescription>
                    Password must be at least 8 characters and contain
                    uppercase, lowercase, and numbers
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
      <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
        {signup ? "Already have an account?" : "Don't have an account?"}{" "}
        <a
          href={signup ? "/login" : "/sign-up"}
          className="text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary rounded"
        >
          {signup ? "Log in" : "Sign up"}
        </a>
      </p>
    </div>
  );
}
