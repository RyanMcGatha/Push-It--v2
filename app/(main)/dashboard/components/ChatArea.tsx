"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
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
  Bell,
  LogOut,
  UserPlus,
  UserMinus,
  Trash,
  Volume2,
  VolumeX,
  Sun,
  Moon,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
  DropdownMenuSubContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { toast } from "react-hot-toast";
import { Switch } from "@/components/ui/switch";

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

interface ChatSettings {
  theme: "light" | "dark" | "system";
  fontSize: "small" | "medium" | "large";
  notifications: {
    sound: boolean;
    desktop: boolean;
    mentions: boolean;
  };
}

interface ChatAreaProps {
  selectedChatId: string | null;
  selectedChatName: string | null;
  isGroup?: boolean;
  participants?: { user: { id: string; name: string | null } }[];
}

const FONT_SIZES = {
  small: "0.875rem",
  medium: "1rem",
  large: "1.125rem",
};

interface MessageData {
  id?: string;
  userId: string;
  content: string;
  chatId: string;
  createdAt: string;
}

interface ChatParticipant {
  userId: string;
  userName: string;
}

interface ChatDeletionData {
  chatId: string;
  deletedBy: {
    userId: string;
    userName: string;
  };
}

export default function ChatArea({
  selectedChatId,
  selectedChatName,
  isGroup = false,
  participants,
}: ChatAreaProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState("");
  const [isMuted, setIsMuted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pusherRef = useRef<Pusher | null>(null);

  console.log(isGroup);
  // Chat settings state
  const [chatSettings, setChatSettings] = useState<ChatSettings>(() => {
    // Try to load settings from localStorage
    const savedSettings = localStorage.getItem("chatSettings");
    if (savedSettings) {
      return JSON.parse(savedSettings);
    }
    // Default settings
    return {
      theme: "system",
      fontSize: "medium",
      notifications: {
        sound: true,
        desktop: true,
        mentions: true,
      },
    };
  });

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("chatSettings", JSON.stringify(chatSettings));
  }, [chatSettings]);

  // Apply font size to messages container
  useEffect(() => {
    const messagesContainer = document.querySelector(".messages-container");
    if (messagesContainer) {
      (messagesContainer as HTMLElement).style.fontSize =
        FONT_SIZES[chatSettings.fontSize];
    }
  }, [chatSettings.fontSize]);

  const handleThemeChange = (theme: "light" | "dark" | "system") => {
    setChatSettings((prevSettings) => ({ ...prevSettings, theme }));
    // Apply theme class to the chat container
    document.documentElement.setAttribute("data-theme", theme);
    toast.success(`Theme changed to ${theme} mode`);
  };

  const handleFontSizeChange = (size: "small" | "medium" | "large") => {
    setChatSettings((prevSettings) => ({ ...prevSettings, fontSize: size }));
    toast.success(`Font size changed to ${size}`);
  };

  const handleNotificationChange = (
    type: keyof ChatSettings["notifications"]
  ) => {
    setChatSettings((prev) => {
      const newSettings = {
        ...prev,
        notifications: {
          ...prev.notifications,
          [type]: !prev.notifications[type],
        },
      };

      // If enabling desktop notifications, request permission
      if (type === "desktop" && !prev.notifications.desktop) {
        if ("Notification" in window) {
          Notification.requestPermission().then((permission) => {
            if (permission !== "granted") {
              // If permission denied, keep desktop notifications disabled
              setChatSettings((prev) => ({
                ...prev,
                notifications: {
                  ...prev.notifications,
                  desktop: false,
                },
              }));
            }
          });
        }
      }

      return newSettings;
    });
  };

  // 1. Fetch existing messages when chat is selected
  useEffect(() => {
    if (!selectedChatId) return;

    (async () => {
      try {
        const response = await fetch(`/api/chats/${selectedChatId}/messages`);
        if (!response.ok) throw new Error("Failed to fetch messages");
        const data = await response.json();
        const adapted = data.map((msg: MessageData) => ({
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
    channel.bind("new-message", (data: MessageData) => {
      setMessages((prev) => [
        ...prev,
        {
          ...data,
          id: data.id || `msg-${Date.now()}-${Math.random()}`,
          user: {
            id: data.userId,
            name: "Unknown",
            image: null,
          },
        },
      ]);

      // Only show notification if the message is from someone else and the chat settings allow it
      if (
        data.userId !== session?.user?.id &&
        chatSettings.notifications.desktop
      ) {
        // Show desktop notification if the window is not focused
        if (
          document.visibilityState !== "visible" &&
          "Notification" in window &&
          Notification.permission === "granted"
        ) {
          new Notification("New Message", {
            body: data.content,
            icon: "/pushitt.png",
          });
        }

        // Play notification sound if enabled
        if (chatSettings.notifications.sound) {
          const audio = new Audio("/notification-sound.mp3");
          audio.play().catch(console.error);
        }
      }

      scrollToBottom();
    });

    // Listen for chat mute events
    channel.bind("chat-muted", (data: { userId: string; muted: boolean }) => {
      if (data.userId === session?.user?.id) {
        setIsMuted(data.muted);
      }
    });

    // Listen for participant leave events
    channel.bind("participant-left", (data: ChatParticipant) => {
      toast.success(`${data.userName || "Someone"} left the chat`);
    });

    // Subscribe to global chats channel for deletion events
    const globalChannel = pusher.subscribe("chats");
    globalChannel.bind("chat-deleted", (data: ChatDeletionData) => {
      if (data.chatId === selectedChatId) {
        toast.success(
          data.deletedBy?.userId === session?.user?.id
            ? "You deleted the chat"
            : `${data.deletedBy?.userName || "Someone"} deleted the chat`
        );
        router.push("/dashboard");
      }
    });

    pusherRef.current = pusher;

    // Cleanup when unmounting or when selectedChatId changes
    return () => {
      channel.unbind_all();
      channel.unsubscribe();
      globalChannel.unbind_all();
      globalChannel.unsubscribe();
      pusher.disconnect();
    };
  }, [selectedChatId, session?.user?.id, router]);

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

  const handleLeaveChat = async () => {
    if (!selectedChatId) return;
    try {
      await fetch(`/api/chats/${selectedChatId}/leave`, {
        method: "POST",
      });
      router.push("/dashboard");
    } catch (error) {
      console.error("Error leaving chat:", error);
    }
  };

  const handleDeleteChat = async () => {
    if (!selectedChatId) return;
    try {
      await fetch(`/api/chats/${selectedChatId}`, {
        method: "DELETE",
      });
      router.push("/dashboard");
    } catch (error) {
      console.error("Error deleting chat:", error);
    }
  };

  const handleToggleMute = async () => {
    if (!selectedChatId) return;
    try {
      await fetch(`/api/chats/${selectedChatId}/mute`, {
        method: "POST",
        body: JSON.stringify({ muted: !isMuted }),
      });
      setIsMuted(!isMuted);
    } catch (error) {
      console.error("Error toggling mute:", error);
    }
  };

  return (
    <div className="flex flex-col">
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex flex-col h-full bg-background bg-texture"
      >
        {selectedChatId ? (
          <>
            {/* Header */}
            <div className="px-6 py-4 border-b border-border/50 flex items-center justify-between ">
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
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-2 rounded-full hover:bg-accent/80 transition-colors"
                    >
                      <Settings className="h-5 w-5 text-muted-foreground" />
                    </motion.button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>Chat Settings</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleToggleMute}>
                      {isMuted ? (
                        <>
                          <Volume2 className="mr-2" />
                          <span>Unmute Chat</span>
                        </>
                      ) : (
                        <>
                          <VolumeX className="mr-2" />
                          <span>Mute Chat</span>
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>Appearance</DropdownMenuLabel>
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger>
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Chat Theme</span>
                      </DropdownMenuSubTrigger>
                      <DropdownMenuPortal>
                        <DropdownMenuSubContent>
                          <DropdownMenuRadioGroup
                            value={chatSettings.theme}
                            onValueChange={(value) =>
                              handleThemeChange(
                                value as "light" | "dark" | "system"
                              )
                            }
                          >
                            <DropdownMenuRadioItem value="light">
                              <Sun className="mr-2 h-4 w-4" />
                              Light
                            </DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="dark">
                              <Moon className="mr-2 h-4 w-4" />
                              Dark
                            </DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="system">
                              <Settings className="mr-2 h-4 w-4" />
                              System
                            </DropdownMenuRadioItem>
                          </DropdownMenuRadioGroup>
                        </DropdownMenuSubContent>
                      </DropdownMenuPortal>
                    </DropdownMenuSub>
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger>
                        <span className="mr-2 text-lg">Aa</span>
                        <span>Font Size</span>
                      </DropdownMenuSubTrigger>
                      <DropdownMenuPortal>
                        <DropdownMenuSubContent>
                          <DropdownMenuRadioGroup
                            value={chatSettings.fontSize}
                            onValueChange={(value) =>
                              handleFontSizeChange(
                                value as "small" | "medium" | "large"
                              )
                            }
                          >
                            <DropdownMenuRadioItem value="small">
                              Small
                            </DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="medium">
                              Medium
                            </DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="large">
                              Large
                            </DropdownMenuRadioItem>
                          </DropdownMenuRadioGroup>
                        </DropdownMenuSubContent>
                      </DropdownMenuPortal>
                    </DropdownMenuSub>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger>
                        <Bell className="mr-2 h-4 w-4" />
                        <span>Custom Alerts</span>
                      </DropdownMenuSubTrigger>
                      <DropdownMenuPortal>
                        <DropdownMenuSubContent className="w-56">
                          <div className="p-2">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm">Sound</span>
                              <Switch
                                checked={chatSettings.notifications.sound}
                                onCheckedChange={() =>
                                  handleNotificationChange("sound")
                                }
                              />
                            </div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm">Desktop</span>
                              <Switch
                                checked={chatSettings.notifications.desktop}
                                onCheckedChange={() =>
                                  handleNotificationChange("desktop")
                                }
                              />
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Mentions</span>
                              <Switch
                                checked={chatSettings.notifications.mentions}
                                onCheckedChange={() =>
                                  handleNotificationChange("mentions")
                                }
                              />
                            </div>
                          </div>
                        </DropdownMenuSubContent>
                      </DropdownMenuPortal>
                    </DropdownMenuSub>
                    <DropdownMenuSeparator />
                    {isGroup === true && (
                      <DropdownMenuItem onClick={handleLeaveChat}>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Leave Chat</span>
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-2 rounded-full hover:bg-accent/80 transition-colors"
                    >
                      <MoreVertical className="h-5 w-5 text-muted-foreground" />
                    </motion.button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>More Options</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {isGroup ? (
                      <>
                        <DropdownMenuItem>
                          <UserPlus className="mr-2" />
                          <span>Add Participants</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={handleLeaveChat}
                          className="text-destructive focus:text-destructive"
                        >
                          <UserMinus className="mr-2" />
                          <span>Leave Chat</span>
                        </DropdownMenuItem>
                      </>
                    ) : null}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleDeleteChat}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash className="mr-2" />
                      <span>Delete Chat</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Chat messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 messages-container">
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
              className="p-4 border-t border-border/50 bg-background"
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
              <div className="w-16 h-16 rounded-full b mx-auto mb-4 flex items-center justify-center">
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
