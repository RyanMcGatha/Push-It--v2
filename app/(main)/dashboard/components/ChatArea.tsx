"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import Pusher from "pusher-js";
import {
  Send,
  Users,
  Image as ImageIcon,
  Paperclip,
  Smile,
  Settings,
  MoreVertical,
  MessageSquare,
} from "lucide-react";

interface Message {
  id: string;
  content: string;
  createdAt: string;
  chatId: string;
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

interface ChatAreaProps {
  selectedChatId: string | null;
  selectedChatName: string | null;
  isGroup?: boolean;
  participants?: { user: { id: string; name: string | null } }[];
}

export default function ChatArea({
  selectedChatId,
  selectedChatName,
  isGroup,
  participants,
}: ChatAreaProps) {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pusherRef = useRef<Pusher | null>(null);

  // 1. Fetch existing messages when chat is selected
  useEffect(() => {
    if (!selectedChatId) return;

    (async () => {
      try {
        const response = await fetch(`/api/chats/${selectedChatId}/messages`);
        if (!response.ok) throw new Error("Failed to fetch messages");
        const data = await response.json();
        const adapted = data.map((msg: any) => ({
          ...msg,
          user: {
            id: msg.userId,
            name: "Unknown",
            image: null,
          },
        }));
        setMessages(adapted);
        scrollToBottom();
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    })();
  }, [selectedChatId]);

  // 2. Connect to Pusher on mount
  useEffect(() => {
    if (!selectedChatId) return;

    // Initialize Pusher
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });

    // Subscribe to the chat channel
    const channel = pusher.subscribe(`chat-${selectedChatId}`);

    // Listen for new messages
    channel.bind("new-message", (data: any) => {
      setMessages((prev) => [
        ...prev,
        {
          ...data,
          user: {
            id: data.userId,
            name: "Unknown",
            image: null,
          },
        },
      ]);
      scrollToBottom();
    });

    pusherRef.current = pusher;

    // Cleanup when unmounting or when selectedChatId changes
    return () => {
      channel.unbind_all();
      channel.unsubscribe();
      pusher.disconnect();
    };
  }, [selectedChatId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // 3. Send a message
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !selectedChatId || !session?.user?.id) {
      return;
    }

    try {
      const response = await fetch(`/api/chats/${selectedChatId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: message.trim(),
          userId: session.user.id,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      setMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div className="flex flex-col bg-gradient-to-b from-background to-background/95">
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex flex-col h-full"
      >
        {selectedChatId ? (
          <>
            {/* Header */}
            <div className="px-6 py-4 border-b border-border/50 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 ring-2 ring-background overflow-hidden flex items-center justify-center">
                    {isGroup ? (
                      <Users className="h-6 w-6 text-primary" />
                    ) : (
                      <div className="h-full w-full bg-primary/10 flex items-center justify-center">
                        <span className="text-lg font-medium text-primary">
                          {selectedChatName?.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <h2 className="text-lg font-semibold">{selectedChatName}</h2>
                  <p className="text-sm text-muted-foreground">
                    {participants?.length || 0} participants
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 rounded-full hover:bg-accent/80 transition-colors"
                >
                  <Settings className="h-5 w-5 text-muted-foreground" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 rounded-full hover:bg-accent/80 transition-colors"
                >
                  <MoreVertical className="h-5 w-5 text-muted-foreground" />
                </motion.button>
              </div>
            </div>

            {/* Chat messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <AnimatePresence>
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex items-start ${
                      msg.user.id === session?.user?.id
                        ? "justify-end"
                        : "space-x-3"
                    }`}
                  >
                    {msg.user.id !== session?.user?.id && (
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                        <span className="text-sm font-medium text-primary">
                          {msg.user.name?.charAt(0) || "A"}
                        </span>
                      </div>
                    )}
                    <div
                      className={`rounded-2xl p-4 max-w-[70%] shadow-sm ${
                        msg.user.id === session?.user?.id
                          ? "rounded-tr-none bg-primary/90 text-primary-foreground"
                          : "rounded-tl-none bg-accent/50"
                      }`}
                    >
                      <p>{msg.content}</p>
                      <span
                        className={`text-xs mt-2 block ${
                          msg.user.id === session?.user?.id
                            ? "text-primary-foreground/80"
                            : "text-muted-foreground"
                        }`}
                      >
                        {new Date(msg.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>

            {/* Input form */}
            <form
              onSubmit={sendMessage}
              className="p-4 border-t border-border/50"
            >
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="flex items-center space-x-2 px-2"
              >
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 rounded-full hover:bg-accent/80 transition-colors"
                >
                  <Paperclip className="h-5 w-5 text-muted-foreground" />
                </motion.button>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 rounded-full hover:bg-accent/80 transition-colors"
                >
                  <ImageIcon className="h-5 w-5 text-muted-foreground" />
                </motion.button>
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="w-full rounded-full border border-border/50 bg-card px-6 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 pr-12 placeholder:text-muted-foreground/70"
                  />
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full hover:bg-accent/80 transition-colors"
                  >
                    <Smile className="h-5 w-5 text-muted-foreground" />
                  </motion.button>
                </div>
                <motion.button
                  type="submit"
                  whileHover={{
                    scale: 1.05,
                    backgroundColor: "var(--primary)",
                  }}
                  whileTap={{ scale: 0.95 }}
                  className="p-3 rounded-full bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all"
                >
                  <Send className="h-5 w-5" />
                </motion.button>
              </motion.div>
            </form>
          </>
        ) : (
          // Fallback when no chat is selected
          <div className="flex-1 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 mx-auto mb-4 flex items-center justify-center">
                <MessageSquare className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No chat selected</h3>
              <p className="text-sm text-muted-foreground">
                Choose a conversation to start messaging
              </p>
            </motion.div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
