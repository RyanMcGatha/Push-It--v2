"use client";

import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";

export default function LogoutButton() {
  const router = useRouter();

  const onLogout = async () => {
    try {
      await signOut({ redirect: true, callbackUrl: "/login" });
      toast.success("Logged out successfully");
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("An unexpected error occurred");
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onLogout}
      className="text-muted-foreground hover:text-foreground"
    >
      <LogOut className="h-4 w-4" />
      <span className="sr-only">Logout</span>
    </Button>
  );
}
