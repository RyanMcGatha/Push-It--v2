"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Search, ArrowLeft, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

interface User {
  id: string;
  name: string | null;
  image: string | null;
}

export default function AddParticipantsPage({
  params,
}: {
  params: { chatId: string };
}) {
  const router = useRouter();
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch available users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(
          `/api/users/available?chatId=${params.chatId}`
        );
        if (!response.ok) throw new Error("Failed to fetch users");
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error("Error fetching users:", error);
        toast.error("Failed to load available users");
      }
    };

    fetchUsers();
  }, [params.chatId]);

  // Handle user selection
  const toggleUserSelection = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  // Handle adding participants
  const handleAddParticipants = async () => {
    if (selectedUsers.length === 0) {
      toast.error("Please select at least one user");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/chats/${params.chatId}/participants`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userIds: selectedUsers }),
      });

      if (!response.ok) throw new Error("Failed to add participants");

      toast.success("Participants added successfully");
      router.push(`/dashboard`);
    } catch (error) {
      console.error("Error adding participants:", error);
      toast.error("Failed to add participants");
    } finally {
      setIsLoading(false);
    }
  };

  // Filter users based on search query
  const filteredUsers = users.filter((user) =>
    user.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full max-w-2xl mx-auto p-6">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="rounded-full"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-semibold">Add Participants</h1>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="flex-1 space-y-2 overflow-auto">
        {filteredUsers.map((user) => (
          <motion.div
            key={user.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4 p-4 rounded-lg hover:bg-accent/50 transition-colors"
          >
            <Checkbox
              id={user.id}
              checked={selectedUsers.includes(user.id)}
              onCheckedChange={() => toggleUserSelection(user.id)}
            />
            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
              {user.image ? (
                <img
                  src={user.image}
                  alt={user.name || "User"}
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                <span className="text-lg font-medium text-primary">
                  {user.name?.charAt(0) || "U"}
                </span>
              )}
            </div>
            <label htmlFor={user.id} className="flex-1 cursor-pointer">
              {user.name || "Unknown User"}
            </label>
          </motion.div>
        ))}
      </div>

      <Button
        className="mt-6"
        onClick={handleAddParticipants}
        disabled={selectedUsers.length === 0 || isLoading}
      >
        <UserPlus className="mr-2 h-4 w-4" />
        Add Selected Users
      </Button>
    </div>
  );
}
