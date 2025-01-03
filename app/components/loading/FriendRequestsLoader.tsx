import { Skeleton } from "@/components/ui/skeleton";

export function FriendRequestsLoader() {
  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <Skeleton className="w-40 h-6" />
        <Skeleton className="w-20 h-4" />
      </div>

      {/* Friend request items */}
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex items-center space-x-4 p-4 border rounded-lg"
          >
            <Skeleton className="w-12 h-12 rounded-full" />
            <div className="flex-1">
              <Skeleton className="w-32 h-5 mb-2" />
              <Skeleton className="w-48 h-4" />
            </div>
            <div className="flex space-x-2">
              <Skeleton className="w-20 h-8 rounded-md" />
              <Skeleton className="w-20 h-8 rounded-md" />
            </div>
          </div>
        ))}
      </div>

      {/* Empty state */}
      {[1, 2, 3].length === 0 && (
        <div className="text-center py-8">
          <Skeleton className="w-48 h-48 mx-auto rounded-full" />
          <div className="mt-4 space-y-2">
            <Skeleton className="w-48 h-6 mx-auto" />
            <Skeleton className="w-64 h-4 mx-auto" />
          </div>
        </div>
      )}
    </div>
  );
}
