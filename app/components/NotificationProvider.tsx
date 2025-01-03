"use client";

import { useNotifications } from "@/lib/hooks/useNotifications";

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useNotifications();
  return <>{children}</>;
}
