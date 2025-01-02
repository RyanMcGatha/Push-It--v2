import { Metadata } from "next";
import FriendsComponent from "./components/FriendsComponent";

export const metadata: Metadata = {
  title: "Friends",
  description: "Manage your friends and friend requests",
};

export default async function FriendsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Friends</h1>
      <FriendsComponent />
    </div>
  );
}
