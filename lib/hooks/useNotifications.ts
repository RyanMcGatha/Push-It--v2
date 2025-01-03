"use client";

import useSWR from "swr";
import { toast } from "sonner";
import { useCallback } from "react";

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  count: number;
  createdAt: string;
}

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch notifications");
  return res.json();
};

interface UseNotificationsProps {
  onNewMessage?: (chatId: string, message: any) => void;
  onChatUpdated?: (chat: any) => void;
}

export function useNotifications(props?: UseNotificationsProps) {
  const { data, error, mutate, isLoading } = useSWR<Notification[]>(
    "/api/notifications",
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000, // Increase deduping interval to 1 minute
      suspense: false, // Disable suspense mode since we're handling loading state manually
      revalidateOnMount: true, // Always revalidate on mount to ensure fresh data
      keepPreviousData: true, // Keep showing previous data while loading new data
      fallbackData: [], // Provide empty array as fallback
    }
  );

  const markAsRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}/read`, {
        method: "POST",
      });
      mutate(
        (prev) =>
          prev?.map((n) => (n.id === id ? { ...n, read: true } : n)) ?? [],
        false
      );
    } catch {
      toast.error("Failed to mark notification as read");
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}`, {
        method: "DELETE",
      });
      mutate((prev) => prev?.filter((n) => n.id !== id) ?? [], false);
    } catch {
      toast.error("Failed to delete notification");
    }
  };

  const subscribeToChatChannel = useCallback(
    (chatId: string) => {
      if (props?.onNewMessage) {
        // Implementation can be added based on your notification system
        console.log("Subscribing to chat:", chatId);
      }
    },
    [props?.onNewMessage]
  );

  return {
    notifications: data ?? [],
    isLoading,
    isError: error,
    mutate,
    markAsRead,
    deleteNotification,
    subscribeToChatChannel,
  };
}
