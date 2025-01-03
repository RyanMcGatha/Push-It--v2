import { Skeleton } from "@/components/ui/skeleton";

export function MainNavLoader() {
  return (
    <div className="flex flex-col h-full p-4 border-r">
      {/* User profile section */}
      <div className="flex items-center space-x-4 mb-8">
        <Skeleton className="w-12 h-12 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="w-32 h-4" />
          <Skeleton className="w-24 h-3" />
        </div>
      </div>

      {/* Navigation items */}
      <div className="space-y-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center space-x-3 p-2">
            <Skeleton className="w-6 h-6" />
            <Skeleton className="w-24 h-4" />
          </div>
        ))}
      </div>

      {/* Bottom section */}
      <div className="mt-auto">
        <div className="flex items-center space-x-3 p-2">
          <Skeleton className="w-6 h-6" />
          <Skeleton className="w-20 h-4" />
        </div>
      </div>
    </div>
  );
}
