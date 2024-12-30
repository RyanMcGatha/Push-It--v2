import { motion, AnimatePresence } from "framer-motion";
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

interface Chat {
  id: number;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  online: boolean;
  isGroup?: boolean;
  memberCount?: number;
}

interface ChatAreaProps {
  selectedChat: number | null;
  conversations: Chat[];
  message: string;
  setMessage: (message: string) => void;
}

export default function ChatArea({
  selectedChat,
  conversations,
  message,
  setMessage,
}: ChatAreaProps) {
  const selectedChatData = conversations.find((c) => c.id === selectedChat);

  return (
    <div className="flex flex-col bg-gradient-to-b from-background to-background/95">
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex flex-col h-full"
      >
        {selectedChat ? (
          <>
            <div className="px-6 py-4 border-b border-border/50 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 ring-2 ring-background overflow-hidden flex items-center justify-center">
                    {selectedChatData?.isGroup ? (
                      <Users className="h-6 w-6 text-primary" />
                    ) : (
                      <div className="h-full w-full bg-primary/10 flex items-center justify-center">
                        <span className="text-lg font-medium text-primary">
                          {selectedChatData?.name.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>
                  {selectedChatData?.online && (
                    <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background bg-emerald-500 shadow-sm" />
                  )}
                </div>
                <div>
                  <h2 className="text-lg font-semibold">
                    {selectedChatData?.name}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {selectedChatData?.online ? "Active now" : "Offline"}
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

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <AnimatePresence>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start space-x-3"
                >
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                    <span className="text-sm font-medium text-primary">
                      {selectedChatData?.name.charAt(0)}
                    </span>
                  </div>
                  <div className="rounded-2xl rounded-tl-none bg-accent/50 p-4 max-w-[70%] shadow-sm">
                    <p>Hey, how are you?</p>
                    <span className="text-xs text-muted-foreground mt-2 block">
                      11:42 AM
                    </span>
                  </div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start justify-end space-x-3"
                >
                  <div className="rounded-2xl rounded-tr-none bg-primary/90 p-4 text-primary-foreground max-w-[70%] shadow-sm">
                    <p>I'm doing great, thanks! How about you?</p>
                    <span className="text-xs text-primary-foreground/80 mt-2 block">
                      11:43 AM
                    </span>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="p-4 border-t border-border/50">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="flex items-center space-x-2 px-2"
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 rounded-full hover:bg-accent/80 transition-colors"
                >
                  <Paperclip className="h-5 w-5 text-muted-foreground" />
                </motion.button>
                <motion.button
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
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full hover:bg-accent/80 transition-colors"
                  >
                    <Smile className="h-5 w-5 text-muted-foreground" />
                  </motion.button>
                </div>
                <motion.button
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
            </div>
          </>
        ) : (
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
