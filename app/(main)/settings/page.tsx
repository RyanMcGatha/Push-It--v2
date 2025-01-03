"use client";

import NotificationSettings from "./components/NotificationSettings";

export default function SettingsPage() {
  return (
    <div className="container max-w-4xl py-6 lg:py-10">
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>

        <div className="space-y-8">
          <NotificationSettings />
          {/* Add other settings sections here */}
        </div>
      </div>
    </div>
  );
}
