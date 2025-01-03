"use client";

import { useEffect, useState } from "react";
import { User } from "@prisma/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSession } from "next-auth/react";
import Pusher from "pusher-js";

interface FriendRequest {
  id: string;
  sender: User & {
    profile: {
      displayName: string | null;
    } | null;
  };
  receiver: User & {
    profile: {
      displayName: string | null;
    } | null;
  };
  status: string;
  createdAt: string;
}

export default function FriendRequests() {
  const { data: session } = useSession();
  const [incomingRequests, setIncomingRequests] = useState<FriendRequest[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const [incomingRes, outgoingRes] = await Promise.all([
          fetch("/api/friends/requests/incoming"),
          fetch("/api/friends/requests/outgoing"),
        ]);
        const [incomingData, outgoingData] = await Promise.all([
          incomingRes.json(),
          outgoingRes.json(),
        ]);
        setIncomingRequests(incomingData);
        setOutgoingRequests(outgoingData);
      } catch (error) {
        console.error("Error fetching friend requests:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  // Add Pusher subscription for real-time updates
  useEffect(() => {
    if (!session?.user?.id) return;

    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });

    const channel = pusher.subscribe(`user-${session.user.id}`);

    // When we receive a friend request
    channel.bind("friend-request-received", (request: FriendRequest) => {
      setIncomingRequests((prev) => [...prev, request]);
    });

    // When we send a friend request
    channel.bind("friend-request-sent", (request: FriendRequest) => {
      setOutgoingRequests((prev) => [...prev, request]);
    });

    // When a friendship is updated (accepted/rejected)
    channel.bind("friendship-updated", (request: FriendRequest) => {
      // Remove the request from either incoming or outgoing lists
      setIncomingRequests((prev) =>
        prev.filter((req) => req.id !== request.id)
      );
      setOutgoingRequests((prev) =>
        prev.filter((req) => req.id !== request.id)
      );
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
      pusher.disconnect();
    };
  }, [session?.user?.id]);

  const handleAcceptRequest = async (requestId: string) => {
    try {
      await fetch(`/api/friends/requests/${requestId}/accept`, {
        method: "POST",
      });
      setIncomingRequests((requests) =>
        requests.filter((request) => request.id !== requestId)
      );
    } catch (error) {
      console.error("Error accepting friend request:", error);
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      await fetch(`/api/friends/requests/${requestId}/reject`, {
        method: "POST",
      });
      setIncomingRequests((requests) =>
        requests.filter((request) => request.id !== requestId)
      );
    } catch (error) {
      console.error("Error rejecting friend request:", error);
    }
  };

  const handleCancelRequest = async (requestId: string) => {
    try {
      await fetch(`/api/friends/requests/${requestId}`, {
        method: "DELETE",
      });
      setOutgoingRequests((requests) =>
        requests.filter((request) => request.id !== requestId)
      );
    } catch (error) {
      console.error("Error canceling friend request:", error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Tabs defaultValue="incoming" className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-8">
        <TabsTrigger value="incoming">
          Incoming ({incomingRequests.length})
        </TabsTrigger>
        <TabsTrigger value="outgoing">
          Outgoing ({outgoingRequests.length})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="incoming">
        {incomingRequests.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No incoming friend requests.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {incomingRequests.map((request) => (
              <Card key={request.id}>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarImage src={request.sender.image || undefined} />
                      <AvatarFallback>
                        {request.sender.profile?.displayName?.[0] ||
                          request.sender.name?.[0] ||
                          "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-semibold">
                        {request.sender.profile?.displayName ||
                          request.sender.name ||
                          "Anonymous"}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {request.sender.email}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleAcceptRequest(request.id)}
                      >
                        Accept
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRejectRequest(request.id)}
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="outgoing">
        {outgoingRequests.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No outgoing friend requests.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {outgoingRequests.map((request) => (
              <Card key={request.id}>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarImage src={request.receiver.image || undefined} />
                      <AvatarFallback>
                        {request.receiver.profile?.displayName?.[0] ||
                          request.receiver.name?.[0] ||
                          "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-semibold">
                        {request.receiver.profile?.displayName ||
                          request.receiver.name ||
                          "Anonymous"}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {request.receiver.email}
                      </p>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleCancelRequest(request.id)}
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}
