"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageSquare } from "lucide-react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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

interface FormProps {
  signup: boolean;
}

export function AuthForm({ signup = false }: FormProps) {
  const formSchema = z.object({
    email: z.string().min(5),
    password: z.string(),
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (signup) {
      const response = await handleSignUp(values.email, values.password);
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
    <div className="m-auto w-full max-w-md p-8 bg-white rounded-xl shadow-md">
      <div className="flex flex-col items-center space-y-4 mb-6">
        <MessageSquare className="h-12 w-12 text-primary" />
        <h1 className="text-3xl font-bold text-gray-800">Push It!</h1>
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
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          ></FormField>
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
                    placeholder="password123"
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          ></FormField>

          <Button type="submit" className="w-full">
            Sign Up
          </Button>
        </form>
      </Form>
      <p className="mt-4 text-center text-sm text-gray-600">
        Already have an account?{" "}
        <a href="/login" className="text-primary hover:underline">
          Log in
        </a>
      </p>
    </div>
  );
}
