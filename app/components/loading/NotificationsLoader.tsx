import { Skeleton } from "@/components/ui/skeleton";

export function NotificationsLoader() {
  return (
    <div className="space-y-4 p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <Skeleton className="w-32 h-6" />
        <Skeleton className="w-24 h-4" />
      </div>

      {/* Notification items */}
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-start space-x-4">
            <Skeleton className="w-10 h-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="w-3/4 h-4" />
              <Skeleton className="w-1/2 h-3" />
            </div>
            <Skeleton className="w-16 h-4" />
          </div>
        ))}
      </div>

      {/* Load more */}
      <div className="flex justify-center pt-4">
        <Skeleton className="w-28 h-8 rounded-md" />
      </div>
    </div>
  );
}
