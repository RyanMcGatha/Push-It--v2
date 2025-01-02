import { useState } from "react";
import FriendsList from "./FriendsList";
import FriendRequests from "./FriendRequests";
import AddFriend from "./AddFriend";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function FriendsComponent() {
  return (
    <Tabs defaultValue="friends" className="w-full">
      <TabsList className="grid w-full grid-cols-3 mb-8">
        <TabsTrigger value="friends">My Friends</TabsTrigger>
        <TabsTrigger value="requests">Friend Requests</TabsTrigger>
        <TabsTrigger value="add">Add Friend</TabsTrigger>
      </TabsList>

      <TabsContent value="friends">
        <FriendsList />
      </TabsContent>

      <TabsContent value="requests">
        <FriendRequests />
      </TabsContent>

      <TabsContent value="add">
        <AddFriend />
      </TabsContent>
    </Tabs>
  );
}
