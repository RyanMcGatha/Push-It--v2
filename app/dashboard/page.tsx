import { Card } from "@/components/ui/card";
import LogoutButton from "@/app/dashboard/components/logout-button";

export default function DashboardPage() {
  return (
    <div className="grid h-full grid-cols-[300px_1fr] gap-4">
      {/* Conversations Sidebar */}
      <Card className="p-4">
        <div className="flex flex-col space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Conversations</h2>
            <LogoutButton />
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="Search conversations..."
              className="w-full rounded-md border px-3 py-2 text-sm"
            />
          </div>
          <div className="mt-4 space-y-2">
            {/* Placeholder conversations */}
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex cursor-pointer items-center space-x-3 rounded-lg p-2 hover:bg-accent"
              >
                <div className="h-10 w-10 rounded-full bg-primary" />
                <div>
                  <p className="font-medium">User {i}</p>
                  <p className="text-sm text-muted-foreground">
                    Last message preview...
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Main Chat Area */}
      <Card className="flex flex-col p-4">
        <div className="mb-4 flex items-center space-x-3 border-b pb-4">
          <div className="h-10 w-10 rounded-full bg-primary" />
          <div>
            <h2 className="font-semibold">Current Chat</h2>
            <p className="text-sm text-muted-foreground">Online</p>
          </div>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto">
          {/* Placeholder messages */}
          <div className="flex items-start space-x-2">
            <div className="h-8 w-8 rounded-full bg-primary" />
            <div className="rounded-lg bg-accent p-3">
              <p>Hey, how are you?</p>
            </div>
          </div>
          <div className="flex items-start justify-end space-x-2">
            <div className="rounded-lg bg-primary p-3 text-primary-foreground">
              <p>I'm doing great, thanks! How about you?</p>
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center space-x-2">
          <input
            type="text"
            placeholder="Type a message..."
            className="flex-1 rounded-md border px-3 py-2 text-sm"
          />
          <button className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
            Send
          </button>
        </div>
      </Card>
    </div>
  );
}
