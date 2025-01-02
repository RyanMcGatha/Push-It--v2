import { Metadata } from "next";
import NotificationsList from "./components/NotificationsList";

export const metadata: Metadata = {
  title: "Notifications",
  description: "View and manage your notifications",
};

export default async function NotificationsPage() {
  return (
    <div className="container max-w-4xl py-6 lg:py-10">
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground">
            View and manage your notifications
          </p>
        </div>
        <NotificationsList />
      </div>
    </div>
  );
}
