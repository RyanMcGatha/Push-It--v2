"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Users, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import LogoutButton from "./logout-button";
import CreateChatModal from "./CreateChatModal";
import { useNotifications } from "@/lib/hooks/useNotifications";
import { toast } from "sonner";

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

  const handleNewMessage = useCallback((chatId: string, message: any) => {
    setChats((prev) =>
      prev.map((c) => {
        if (c.id === chatId) {
          return {
            ...c,
            messages: [message, ...(c.messages || [])],
          };
        }
        return c;
      })
    );
  }, []);

  const handleChatUpdated = useCallback(
    (chat: any) => {
      if (chat.deleted) {
        setChats((prev) => prev.filter((c) => c.id !== chat.chatId));
        if (selectedChatId === chat.chatId) {
          onSelectChat(null);
        }
      } else {
        setChats((prev) => [chat, ...prev]);
      }
    },
    [selectedChatId, onSelectChat]
  );

  const { subscribeToChatChannel } = useNotifications({
    onNewMessage: handleNewMessage,
    onChatUpdated: handleChatUpdated,
  });

  // Fetch chats on mount
  useEffect(() => {
    let isMounted = true;

    const fetchChats = async () => {
      try {
        const response = await fetch("/api/chats");
        if (!response.ok) throw new Error("Failed to fetch chats");
        const data = await response.json();
        if (isMounted) {
          setChats(data);
          // Subscribe to each chat channel
          data.forEach((chat: Chat) => {
            subscribeToChatChannel(chat.id);
          });
        }
      } catch (error) {
        console.error("Error fetching chats:", error);
      }
    };

    fetchChats();

    return () => {
      isMounted = false;
    };
  }, [subscribeToChatChannel]);

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

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create chat");
      }

      onSelectChat(data);
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error("Error creating chat:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to create chat"
      );
    }
  };

  const getChatDisplayName = useCallback(
    (chat: Chat) => {
      if (chat.name) return chat.name;

      const otherParticipants = chat.participants
        .filter((p) => p.user.id !== session?.user?.id)
        .map((p) => p.user.name || "Anonymous")
        .join(", ");

      return otherParticipants || "New Chat";
    },
    [session?.user?.id]
  );

  const getLastMessage = useCallback((chat: Chat) => {
    if (!chat.messages || chat.messages.length === 0) return "No messages yet";
    const lastMessage = chat.messages[0];
    return lastMessage.content;
  }, []);

  const getLastMessageTime = useCallback((chat: Chat) => {
    if (!chat.messages || chat.messages.length === 0) return "";
    const lastMessage = chat.messages[0];
    return new Date(lastMessage.createdAt).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }, []);

  const filteredChats = chats.filter((chat) =>
    getChatDisplayName(chat).toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <div className="flex flex-col border-r border-border/50 bg-background">
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
      {isCreateModalOpen && (
        <CreateChatModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onCreateChat={handleCreateChat}
        />
      )}
    </>
  );
}
