import { Skeleton } from "@/components/ui/skeleton";

export function WelcomeScreenLoader() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      {/* Logo/Avatar */}
      <Skeleton className="w-24 h-24 rounded-full mb-8" />

      {/* Welcome text */}
      <div className="text-center space-y-4 mb-8">
        <Skeleton className="w-64 h-8 mx-auto" />
        <Skeleton className="w-80 h-4 mx-auto" />
      </div>

      {/* Form fields */}
      <div className="w-full max-w-md space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="w-24 h-4" />
            <Skeleton className="w-full h-10 rounded-md" />
          </div>
        ))}
      </div>

      {/* Action buttons */}
      <div className="mt-8 space-y-4 w-full max-w-md">
        <Skeleton className="w-full h-10 rounded-md" />
        <Skeleton className="w-full h-10 rounded-md" />
      </div>
    </div>
  );
}
