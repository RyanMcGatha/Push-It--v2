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

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
      pusher.disconnect();
    };
  }, [session?.user?.id]);

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
