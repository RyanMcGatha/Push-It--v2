"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Pusher from "pusher-js";
import { toast } from "react-hot-toast";
import { User } from "@prisma/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface Friend extends User {
  profile: {
    displayName: string | null;
  } | null;
}

interface FriendRequest {
  id: string;
  status: string;
  sender: Friend;
  receiver: Friend;
}

export default function FriendsList() {
  const { data: session } = useSession();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);

  // Add effect to fetch friends
  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const response = await fetch("/api/friends");
        if (!response.ok) throw new Error("Failed to fetch friends");
        const data = await response.json();
        setFriends(data);
      } catch (error) {
        console.error("Error fetching friends:", error);
        toast.error("Failed to load friends");
      }
    };

    const fetchFriendRequests = async () => {
      try {
        const response = await fetch("/api/friends/requests");
        if (!response.ok) throw new Error("Failed to fetch friend requests");
        const data = await response.json();
        setFriendRequests(data);
      } catch (error) {
        console.error("Error fetching friend requests:", error);
        toast.error("Failed to load friend requests");
      }
    };

    if (session?.user?.id) {
      fetchFriends();
      fetchFriendRequests();
    }
  }, [session?.user?.id]);

  useEffect(() => {
    if (!session?.user?.id) return;

    // Initialize Pusher
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });

    // Subscribe to user's channel
    const channel = pusher.subscribe(`user-${session.user.id}`);

    // Listen for friend request events
    channel.bind("friend-request-sent", (friendship: FriendRequest) => {
      toast.success(
        `Friend request sent to ${
          friendship.receiver.name || friendship.receiver.email
        }`
      );
    });

    channel.bind("friend-request-received", (friendship: FriendRequest) => {
      setFriendRequests((prev) => [...prev, friendship]);
      toast.success(
        `New friend request from ${
          friendship.sender.name || friendship.sender.email
        }`
      );
    });

    channel.bind("friendship-updated", (friendship: FriendRequest) => {
      if (friendship.status === "ACCEPTED") {
        const newFriend =
          session.user.id === friendship.sender.id
            ? friendship.receiver
            : friendship.sender;
        setFriends((prev) => [...prev, newFriend]);
        toast.success(
          `${newFriend.name || newFriend.email} accepted your friend request`
        );
      }
      setFriendRequests((prev) =>
        prev.filter((req) => req.id !== friendship.id)
      );
    });

    channel.bind("friendship-removed", (data: { friendId: string }) => {
      setFriends((prev) =>
        prev.filter((friend) => friend.id !== data.friendId)
      );
      toast.success("Friend removed successfully");
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
      pusher.disconnect();
    };
  }, [session?.user?.id]);

  const handleRemoveFriend = async (friendId: string) => {
    try {
      const response = await fetch(`/api/friends/${friendId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to remove friend");
      setFriends(friends.filter((friend) => friend.id !== friendId));
      toast.success("Friend removed successfully");
    } catch (error) {
      console.error("Error removing friend:", error);
      toast.error("Failed to remove friend");
    }
  };

  if (friends.length === 0 && friendRequests.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">You haven&apos;t added any friends yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {friends.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Friends</h2>
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {friends.map((friend) => (
              <Card key={friend.id}>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarImage src={friend.image || undefined} />
                      <AvatarFallback>
                        {friend.profile?.displayName?.[0] ||
                          friend.name?.[0] ||
                          "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-semibold">
                        {friend.profile?.displayName ||
                          friend.name ||
                          "Anonymous"}
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
        </div>
      )}
    </div>
  );
}
