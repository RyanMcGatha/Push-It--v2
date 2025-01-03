import { Skeleton } from "@/components/ui/skeleton";

export function ImageUploaderLoader() {
  return (
    <div className="space-y-4">
      {/* Upload area */}
      <Skeleton className="w-full h-40 rounded-lg" />

      {/* Preview area */}
      <div className="flex items-center justify-center">
        <Skeleton className="w-32 h-32 rounded-lg" />
      </div>

      {/* Upload button */}
      <div className="flex justify-center">
        <Skeleton className="w-32 h-9 rounded-md" />
      </div>
    </div>
  );
}
