"use client";

import { useState, useEffect } from "react";
import { Search, Users, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import LogoutButton from "./logout-button";
import CreateChatModal from "./CreateChatModal";
import Pusher from "pusher-js";

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

interface ChatSidebarProps {
  selectedChatId: string | null;
  onSelectChat: (chat: Chat | null) => void;
}

export default function ChatSidebar({
  selectedChatId,
  onSelectChat,
}: ChatSidebarProps) {
  const { data: session } = useSession();
  const [chats, setChats] = useState<Chat[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Fetch chats on mount
  useEffect(() => {
    fetchChats();
  }, []);

  // Connect to Pusher
  useEffect(() => {
    if (!session?.user?.id) return;

    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });

    // Subscribe to global chats channel
    const channel = pusher.subscribe("chats");

    // Listen for new chats
    channel.bind("new-chat", (chat: Chat) => {
      setChats((prev) => [chat, ...prev]);
    });

    // Listen for chat deletions
    channel.bind("chat-deleted", (data: any) => {
      setChats((prev) => prev.filter((chat) => chat.id !== data.chatId));
      if (selectedChatId === data.chatId) {
        onSelectChat(null);
      }
    });

    // Subscribe to individual chat channels
    chats.forEach((chat) => {
      const chatChannel = pusher.subscribe(`chat-${chat.id}`);

      // Listen for new messages
      chatChannel.bind("new-message", (message: Message) => {
        setChats((prev) =>
          prev.map((c) => {
            if (c.id === chat.id) {
              return {
                ...c,
                messages: [message, ...(c.messages || [])],
              };
            }
            return c;
          })
        );
      });

      // Listen for participant leave events
      chatChannel.bind("participant-left", (data: any) => {
        setChats((prev) =>
          prev.map((c) => {
            if (c.id === chat.id) {
              return {
                ...c,
                participants: c.participants.filter(
                  (p) => p.user.id !== data.userId
                ),
              };
            }
            return c;
          })
        );
      });
    });

    return () => {
      // Unsubscribe from global channel
      channel.unbind_all();
      channel.unsubscribe();

      // Unsubscribe from individual chat channels
      chats.forEach((chat) => {
        const chatChannel = pusher.unsubscribe(`chat-${chat.id}`);
      });

      pusher.disconnect();
    };
  }, [session?.user?.id, chats, selectedChatId, onSelectChat]);

  const fetchChats = async () => {
    try {
      const response = await fetch("/api/chats");
      if (!response.ok) throw new Error("Failed to fetch chats");
      const data = await response.json();
      setChats(data);
    } catch (error) {
      console.error("Error fetching chats:", error);
    }
  };

  const handleCreateChat = async (
    name: string | null,
    participantIds: string[]
  ) => {
    try {
      const response = await fetch("/api/chats", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          participantIds,
        }),
      });

      if (!response.ok) throw new Error("Failed to create chat");

      const newChat = await response.json();
      onSelectChat(newChat);
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error("Error creating chat:", error);
    }
  };

  const getChatDisplayName = (chat: Chat) => {
    if (chat.name) return chat.name;

    const otherParticipants = chat.participants
      .filter((p) => p.user.id !== session?.user?.id)
      .map((p) => p.user.name || "Anonymous")
      .join(", ");

    return otherParticipants || "New Chat";
  };

  const getLastMessage = (chat: Chat) => {
    if (!chat.messages || chat.messages.length === 0) return "No messages yet";
    const lastMessage = chat.messages[0];
    return lastMessage.content;
  };

  const getLastMessageTime = (chat: Chat) => {
    if (!chat.messages || chat.messages.length === 0) return "";
    const lastMessage = chat.messages[0];
    return new Date(lastMessage.createdAt).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredChats = chats.filter((chat) =>
    getChatDisplayName(chat).toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <div className="flex flex-col border-r border-border/50 bg-card/50">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex flex-col h-full"
        >
          <div className="p-4 border-b border-border/50">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                Messages
              </h2>
              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsCreateModalOpen(true)}
                  className="p-2 rounded-full hover:bg-accent/80 transition-colors"
                >
                  <Plus className="h-5 w-5 text-primary" />
                </motion.button>
                <LogoutButton />
              </div>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search messages..."
                className="w-full rounded-2xl border border-border/50 bg-card px-9 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground/70"
              />
              <Users className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground cursor-pointer hover:text-primary transition-colors" />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-1 p-2">
            <AnimatePresence>
              {filteredChats.map((chat, index) => (
                <motion.div
                  key={chat.id}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -20, opacity: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02, backgroundColor: "var(--accent)" }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onSelectChat(chat)}
                  className={`flex cursor-pointer items-center space-x-3 rounded-xl p-3 transition-all ${
                    selectedChatId === chat.id
                      ? "bg-accent shadow-sm"
                      : "hover:bg-accent/50"
                  }`}
                >
                  <div className="relative">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 ring-2 ring-background overflow-hidden flex items-center justify-center">
                      {chat.participants.length > 2 ? (
                        <Users className="h-6 w-6 text-primary" />
                      ) : (
                        <div className="h-full w-full bg-primary/10 flex items-center justify-center">
                          <span className="text-lg font-medium text-primary">
                            {getChatDisplayName(chat).charAt(0)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <p className="font-medium truncate">
                          {getChatDisplayName(chat)}
                        </p>
                        {chat.participants.length > 2 && (
                          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                            {chat.participants.length}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {getLastMessageTime(chat)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {getLastMessage(chat)}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      <CreateChatModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateChat={handleCreateChat}
      />
    </>
  );
}
