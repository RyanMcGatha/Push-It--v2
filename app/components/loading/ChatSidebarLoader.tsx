import { Skeleton } from "@/components/ui/skeleton";

export function ChatSidebarLoader() {
  return (
    <div className="w-full h-full p-4 space-y-4">
      {/* Search bar */}
      <Skeleton className="w-full h-10 rounded-lg" />

      {/* Chat list */}
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center space-x-4">
            <Skeleton className="w-12 h-12 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="w-3/4 h-4" />
              <Skeleton className="w-1/2 h-3" />
            </div>
            <Skeleton className="w-8 h-8 rounded-full" />
          </div>
        ))}
      </div>

      {/* Create chat button */}
      <div className="absolute bottom-4 right-4">
        <Skeleton className="w-12 h-12 rounded-full" />
      </div>
    </div>
  );
}
