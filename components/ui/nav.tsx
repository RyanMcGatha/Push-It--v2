"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { MessageSquare } from "lucide-react";

export function Nav() {
  const pathname = usePathname();
  const isAuthPage = pathname.startsWith("/(auth)");

  if (isAuthPage) return null;

  return (
    <nav className="border-b bg-white bg-opacity-50 fixed top-0 left-0 right-0 z-50">
      <div className="flex h-16 items-center px-4 container">
        <div className="flex items-center gap-2 mr-4">
          <MessageSquare className="h-6 w-6 text-primary" />
          <Link href="/" className="text-lg font-semibold">
            Push It!
          </Link>
        </div>

        <div className="flex items-center space-x-4 flex-1">
          <Link
            href="/messages"
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              pathname === "/messages"
                ? "text-primary"
                : "text-muted-foreground"
            )}
          >
            Messages
          </Link>
          <Link
            href="/contacts"
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              pathname === "/contacts"
                ? "text-primary"
                : "text-muted-foreground"
            )}
          >
            Contacts
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm">
            Settings
          </Button>
          <Button variant="outline" size="sm">
            Profile
          </Button>
        </div>
      </div>
    </nav>
  );
}
