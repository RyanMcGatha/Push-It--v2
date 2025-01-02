"use client";

import { useState, useEffect } from "react";
import { User } from "@prisma/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/lib/hooks/use-debounce";

interface UserWithProfile extends User {
  profile: {
    displayName: string | null;
  } | null;
}

export default function AddFriend() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UserWithProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const debouncedSearch = useDebounce(searchQuery, 500);

  const searchUsers = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `/api/friends/search?q=${encodeURIComponent(query)}`
      );
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error("Error searching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendRequest = async (userId: string) => {
    try {
      await fetch("/api/friends/requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ receiverId: userId }),
      });
      // Remove the user from search results after sending request
      setSearchResults((results) =>
        results.filter((user) => user.id !== userId)
      );
    } catch (error) {
      console.error("Error sending friend request:", error);
    }
  };

  // Effect to handle debounced search
  useEffect(() => {
    searchUsers(debouncedSearch);
  }, [debouncedSearch]);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Input
          type="text"
          placeholder="Search users by name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {loading && <p className="text-sm text-gray-500">Searching...</p>}
      </div>

      <div className="grid gap-4">
        {searchResults.map((user) => (
          <Card key={user.id}>
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                <Avatar>
                  <AvatarImage src={user.image || undefined} />
                  <AvatarFallback>
                    {user.profile?.displayName?.[0] || user.name?.[0] || "?"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-semibold">
                    {user.profile?.displayName || user.name || "Anonymous"}
                  </h3>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => handleSendRequest(user.id)}
                >
                  Add Friend
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {!loading && searchQuery && searchResults.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No users found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
