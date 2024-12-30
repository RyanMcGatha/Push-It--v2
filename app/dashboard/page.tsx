"use client";

import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import ChatSidebar from "./components/ChatSidebar";
import ChatArea from "./components/ChatArea";
import { Chat } from "./types";

export default function DashboardPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [message, setMessage] = useState("");
  const [selectedChat, setSelectedChat] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/onboarding/progress")
      .then((res) => res.json())
      .then((data) => {
        if (!data.onboardingComplete) {
          toast({
            title: "Complete your setup",
            description: "Would you like to finish setting up your account?",
            action: (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push("/onboarding")}
                className="rounded-full bg-primary/90 px-4 py-2 text-sm font-medium text-white hover:bg-primary transition-all"
              >
                Continue Setup
              </motion.button>
            ),
            duration: 0,
          });
        }
      });
  }, []);

  const conversations: Chat[] = [
    {
      id: 1,
      name: "Sarah Johnson",
      avatar: "/avatars/sarah.jpg",
      lastMessage: "That sounds great! Let's do it 😊",
      time: "2m ago",
      online: true,
    },
    {
      id: 2,
      name: "Dev Team",
      avatar: "/avatars/team.jpg",
      lastMessage: "New PR is ready for review",
      time: "1h ago",
      online: true,
      isGroup: true,
      memberCount: 8,
    },
    {
      id: 3,
      name: "Alex Chen",
      avatar: "/avatars/alex.jpg",
      lastMessage: "Thanks for your help yesterday!",
      time: "3h ago",
      online: false,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="grid h-full grid-cols-[320px_1fr] gap-0 bg-background/50"
    >
      <ChatSidebar
        conversations={conversations}
        selectedChat={selectedChat}
        setSelectedChat={setSelectedChat}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />
      <ChatArea
        selectedChat={selectedChat}
        conversations={conversations}
        message={message}
        setMessage={setMessage}
      />
    </motion.div>
  );
}
