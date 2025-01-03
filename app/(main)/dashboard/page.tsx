"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import ChatSidebar from "./components/ChatSidebar";
import ChatArea from "./components/ChatArea";
import { useSession } from "next-auth/react";

interface User {
  id: string;
  name: string | null;
  image: string | null;
}

interface ChatParticipant {
  user: User;
}

interface Message {
  id: string;
  content: string;
  createdAt: string;
  user: User;
}

interface Chat {
  id: string;
  name: string | null;
  participants: ChatParticipant[];
  messages: Message[];
}

export default function DashboardPage() {
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const session = useSession();
  console.log(session);
  const handleSelectChat = (chat: Chat | null) => {
    setSelectedChat(chat);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="grid h-full grid-cols-[320px_1fr] gap-0 "
    >
      <ChatSidebar
        selectedChatId={selectedChat?.id || null}
        onSelectChat={handleSelectChat}
      />
      <ChatArea
        selectedChatId={selectedChat?.id || null}
        selectedChatName={selectedChat?.name || null}
        isGroup={
          (selectedChat?.participants?.length || 0) > 2 ||
          selectedChat?.name?.includes("Group")
        }
        participants={selectedChat?.participants}
      />
    </motion.div>
  );
}
