"use client";

import { useEffect, useState } from "react";
import { User } from "@prisma/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface Friend extends User {
  profile: {
    displayName: string | null;
  } | null;
}

export default function FriendsList() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const response = await fetch("/api/friends");
        const data = await response.json();
        setFriends(data);
      } catch (error) {
        console.error("Error fetching friends:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFriends();
  }, []);

  const handleRemoveFriend = async (friendId: string) => {
    try {
      await fetch(`/api/friends/${friendId}`, {
        method: "DELETE",
      });
      setFriends(friends.filter((friend) => friend.id !== friendId));
    } catch (error) {
      console.error("Error removing friend:", error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (friends.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">You haven't added any friends yet.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {friends.map((friend) => (
        <Card key={friend.id}>
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <Avatar>
                <AvatarImage src={friend.image || undefined} />
                <AvatarFallback>
                  {friend.profile?.displayName?.[0] || friend.name?.[0] || "?"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="font-semibold">
                  {friend.profile?.displayName || friend.name || "Anonymous"}
                </h3>
                <p className="text-sm text-gray-500">{friend.email}</p>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleRemoveFriend(friend.id)}
              >
                Remove
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
