"use client";

import { useEffect, useState, useCallback } from "react";
import { Bell, Check, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { useSession } from "next-auth/react";
import Pusher from "pusher-js";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  count: number;
  createdAt: string;
}

export default function NotificationsList() {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { toast } = useToast();

  // Memoize fetchNotifications to prevent unnecessary re-renders
  const fetchNotifications = useCallback(async () => {
    try {
      const response = await fetch("/api/notifications");
      if (!response.ok) throw new Error("Failed to fetch notifications");
      const data = await response.json();
      setNotifications(data);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      // Don't show toast here to break the dependency cycle
    }
  }, []); // Remove toast dependency

  // Memoize handlers to prevent unnecessary re-renders
  const markAsRead = useCallback(async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}/read`, {
        method: "POST",
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch {
      toast({
        title: "Error",
        description: "Failed to mark notification as read",
      });
    }
  }, []);

  const deleteNotification = useCallback(async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}`, {
        method: "DELETE",
      });
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch {
      toast({
        title: "Error",
        description: "Failed to delete notification",
      });
    }
  }, []);

  useEffect(() => {
    if (!session?.user?.id) return;

    let mounted = true; // Add mounted flag to prevent updates after unmount

    // Fetch existing notifications
    fetchNotifications().catch(console.error);

    // Track if we've already shown the notification permission toast
    let hasShownPermissionToast = false;

    // Request notification permission only once on mount
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().then((permission) => {
        if (!mounted) return;
        if (!hasShownPermissionToast) {
          hasShownPermissionToast = true;
          if (permission === "granted") {
            toast({
              title: "Notifications enabled",
              description: "You will now receive desktop notifications",
            });
          } else if (permission === "denied") {
            toast({
              title: "Notifications disabled",
              description:
                "Please enable notifications in your browser settings to receive alerts",
            });
          }
        }
      });
    }

    // Initialize Pusher
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
      forceTLS: true,
      enabledTransports: ["ws", "wss"],
    });

    // Track connection state to prevent duplicate error toasts
    let isConnected = false;
    let hasShownErrorToast = false;

    // Add connection state change logging
    pusher.connection.bind(
      "state_change",
      (states: { current: string; previous: string }) => {
        if (!mounted) return;
        console.log(
          "Pusher connection state changed from",
          states.previous,
          "to",
          states.current
        );

        if (states.current === "connected") {
          isConnected = true;
          hasShownErrorToast = false;
          // Only fetch if we were previously disconnected
          if (
            states.previous === "disconnected" ||
            states.previous === "failed"
          ) {
            fetchNotifications().catch(console.error);
          }
        } else if (
          states.current === "disconnected" ||
          states.current === "failed"
        ) {
          isConnected = false;
        }
      }
    );

    // Add connection error handling
    pusher.connection.bind("error", (err: any) => {
      console.error("Pusher connection error:", err);
      if (!hasShownErrorToast) {
        hasShownErrorToast = true;
        toast({
          title: "Connection Error",
          description:
            "Having trouble receiving real-time updates. Please check your connection.",
        });
      }
    });

    // Subscribe to user's notification channel
    const channel = pusher.subscribe(`user-${session.user.id}`);

    // Add subscription success handler
    channel.bind("pusher:subscription_succeeded", () => {
      console.log(
        "Successfully subscribed to notifications channel:",
        `user-${session.user.id}`
      );
    });

    // Listen for new notifications
    channel.bind("new-notification", (notification: Notification) => {
      console.log("Received new notification:", notification);
      setNotifications((prev) => {
        console.log("Previous notifications:", prev);
        const updated = [notification, ...prev];
        console.log("Updated notifications:", updated);
        return updated;
      });

      // Show desktop notification if enabled
      if (
        "Notification" in window &&
        Notification.permission === "granted" &&
        document.visibilityState !== "visible"
      ) {
        new Notification(notification.title, {
          body: notification.message,
          icon: "/pushitt.png",
        });
      }

      toast({
        title: notification.title,
        description: notification.message,
      });
    });

    // Listen for notification updates
    channel.bind("notification-updated", (notification: Notification) => {
      setNotifications((prev) =>
        prev.map((n) => (n.id === notification.id ? notification : n))
      );

      // Show desktop notification if enabled
      if (
        "Notification" in window &&
        Notification.permission === "granted" &&
        document.visibilityState !== "visible"
      ) {
        new Notification(notification.title, {
          body: `${notification.message} (${notification.count} updates)`,
          icon: "/pushitt.png",
        });
      }

      toast({
        title: notification.title,
        description: `${notification.message} (${notification.count} updates)`,
      });
    });

    return () => {
      mounted = false;
      channel.unbind_all();
      channel.unsubscribe();
      pusher.disconnect();
    };
  }, [session?.user?.id, fetchNotifications]); // fetchNotifications is now stable

  if (notifications.length === 0) {
    return (
      <Card className="p-6 text-center text-muted-foreground">
        <Bell className="mx-auto h-12 w-12 mb-4" />
        <h3 className="text-lg font-semibold">No notifications</h3>
        <p>You&apos;re all caught up!</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {notifications.map((notification) => (
        <Card
          key={notification.id}
          className={`p-4 transition-colors ${
            notification.read ? "bg-muted/50" : "bg-background"
          }`}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h3 className="font-semibold">{notification.title}</h3>
              <p className="text-muted-foreground">
                {notification.message}
                {notification.count > 1 && (
                  <span className="ml-2 text-sm text-muted-foreground">
                    ({notification.count} updates)
                  </span>
                )}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                {formatDistanceToNow(new Date(notification.createdAt), {
                  addSuffix: true,
                })}
              </p>
            </div>
            <div className="flex gap-2">
              {!notification.read && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => markAsRead(notification.id)}
                >
                  <Check className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => deleteNotification(notification.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
