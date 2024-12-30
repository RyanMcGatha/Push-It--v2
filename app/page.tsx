"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      redirect("/login");
    } else {
      // Check if user has completed onboarding
      // For now, we'll always redirect to onboarding
      // In a real app, you'd check a user preference or database flag
      redirect("/onboarding");
    }
  }, [session, status]);

  // Show loading state while checking session
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500" />
    </div>
  );
}
