"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Users, MessageSquare, Search } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";

interface User {
  id: string;
  name: string | null;
  image: string | null;
}

interface CreateChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateChat: (name: string | null, participantIds: string[]) => void;
}

export default function CreateChatModal({
  isOpen,
  onClose,
  onCreateChat,
}: CreateChatModalProps) {
  const [selectedTab, setSelectedTab] = useState<"direct" | "group">("direct");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [groupName, setGroupName] = useState("");
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);

  // Fetch users when modal opens
  const fetchUsers = async () => {
    try {
      const endpoint = searchQuery
        ? `/api/friends/search/added?query=${searchQuery}`
        : "/api/friends";
      const response = await fetch(endpoint);
      if (!response.ok) throw new Error("Failed to fetch users");
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const handleUserSelect = (user: User) => {
    if (selectedTab === "direct" && selectedUsers.length >= 1) {
      setSelectedUsers([user]);
    } else {
      setSelectedUsers((prev) => {
        const isSelected = prev.some((u) => u.id === user.id);
        if (isSelected) {
          return prev.filter((u) => u.id !== user.id);
        }
        return [...prev, user];
      });
    }
  };

  const handleCreateChat = () => {
    if (selectedTab === "direct" && selectedUsers.length === 1) {
      onCreateChat(
        null,
        selectedUsers.map((u) => u.id)
      );
    } else if (
      selectedTab === "group" &&
      selectedUsers.length >= 2 &&
      groupName.trim()
    ) {
      onCreateChat(
        groupName.trim(),
        selectedUsers.map((u) => u.id)
      );
    }
  };

  const isCreateDisabled =
    (selectedTab === "direct" && selectedUsers.length !== 1) ||
    (selectedTab === "group" &&
      (selectedUsers.length < 2 || !groupName.trim()));

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
    >
      <div className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%]">
        <Card className="w-[90vw] max-w-[500px] max-h-[80vh] overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-xl font-semibold">New Chat</h2>
            <button
              onClick={onClose}
              className="rounded-full p-2 hover:bg-accent/80 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <Tabs
            defaultValue="direct"
            value={selectedTab}
            onValueChange={(value) => {
              setSelectedTab(value as "direct" | "group");
              setSelectedUsers([]);
              setGroupName("");
            }}
            className="p-6"
          >
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="direct" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Direct Message
              </TabsTrigger>
              <TabsTrigger value="group" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Group Chat
              </TabsTrigger>
            </TabsList>

            <div className="space-y-4">
              {selectedTab === "group" && (
                <input
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="Group chat name"
                  className="w-full rounded-lg border border-border/50 bg-card px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              )}

              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    fetchUsers();
                  }}
                  placeholder={`Search ${
                    selectedTab === "direct" ? "friends" : "participants"
                  }...`}
                  className="w-full rounded-lg border border-border/50 bg-card px-9 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {selectedTab === "group" && selectedUsers.length > 0 && (
                <div className="flex flex-wrap gap-2 min-h-[40px]">
                  {selectedUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center gap-1 bg-primary/20 text-primary rounded-full px-3 py-1 text-sm"
                    >
                      <span>{user.name}</span>
                      <button
                        onClick={() => handleUserSelect(user)}
                        className="hover:bg-primary/30 rounded-full p-1"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="h-[200px] overflow-y-auto space-y-2">
                {users.map((user) => (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedUsers.some((u) => u.id === user.id)
                        ? "bg-primary/20"
                        : "hover:bg-accent/80"
                    }`}
                    onClick={() => handleUserSelect(user)}
                  >
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                      <span className="text-sm font-medium text-primary">
                        {user.name?.charAt(0) || "?"}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{user.name}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </Tabs>

          <div className="p-6 border-t">
            <button
              onClick={handleCreateChat}
              disabled={isCreateDisabled}
              className="w-full bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create {selectedTab === "direct" ? "Chat" : "Group"}
            </button>
          </div>
        </Card>
      </div>
    </motion.div>
  );
}
