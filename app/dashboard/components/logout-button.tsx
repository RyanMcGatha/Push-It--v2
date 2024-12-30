"use client";

import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import handleLogout from "@/app/(auth)/helpers/handleLogout";

export default function LogoutButton() {
  const router = useRouter();

  const onLogout = async () => {
    try {
      const response = await handleLogout();
      if (response.success) {
        toast.success(response.message);
        router.push("/login");
      } else {
        toast.error(response.message);
      }
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
