import { Search, Users, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import LogoutButton from "./logout-button";

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

interface ChatSidebarProps {
  conversations: Chat[];
  selectedChat: number | null;
  setSelectedChat: (id: number) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export default function ChatSidebar({
  conversations,
  selectedChat,
  setSelectedChat,
  searchQuery,
  setSearchQuery,
}: ChatSidebarProps) {
  return (
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
            {conversations.map((chat, index) => (
              <motion.div
                key={chat.id}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02, backgroundColor: "var(--accent)" }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedChat(chat.id)}
                className={`flex cursor-pointer items-center space-x-3 rounded-xl p-3 transition-all ${
                  selectedChat === chat.id
                    ? "bg-accent shadow-sm"
                    : "hover:bg-accent/50"
                }`}
              >
                <div className="relative">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 ring-2 ring-background overflow-hidden flex items-center justify-center">
                    {chat.isGroup ? (
                      <Users className="h-6 w-6 text-primary" />
                    ) : (
                      <div className="h-full w-full bg-primary/10 flex items-center justify-center">
                        <span className="text-lg font-medium text-primary">
                          {chat.name.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>
                  {chat.online && (
                    <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background bg-emerald-500 shadow-sm" />
                  )}
                </div>
                <div className="flex-1 overflow-hidden">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <p className="font-medium truncate">{chat.name}</p>
                      {chat.isGroup && (
                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                          {chat.memberCount}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {chat.time}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {chat.lastMessage}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
