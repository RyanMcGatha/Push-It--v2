"use client";

import { useEffect, useState } from "react";
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
  createdAt: string;
}

export default function NotificationsList() {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (!session?.user?.id) return;

    // Initialize Pusher
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });

    // Subscribe to user's notification channel
    const channel = pusher.subscribe(`user-${session.user.id}`);

    // Listen for new notifications
    channel.bind("new-notification", (notification: Notification) => {
      setNotifications((prev) => [notification, ...prev]);
      toast({
        title: notification.title,
        description: notification.message,
      });
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
      pusher.disconnect();
    };
  }, [session?.user?.id]);

  const markAsRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}/read`, {
        method: "POST",
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark notification as read",
      });
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}`, {
        method: "DELETE",
      });
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete notification",
      });
    }
  };

  if (notifications.length === 0) {
    return (
      <Card className="p-6 text-center text-muted-foreground">
        <Bell className="mx-auto h-12 w-12 mb-4" />
        <h3 className="text-lg font-semibold">No notifications</h3>
        <p>You're all caught up!</p>
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
              <p className="text-muted-foreground">{notification.message}</p>
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
