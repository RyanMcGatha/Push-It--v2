import { Skeleton } from "@/components/ui/skeleton";

export function ChatAreaLoader() {
  return (
    <div className="flex flex-col h-full">
      {/* Messages area */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {/* Message bubbles */}
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className={`flex ${i % 2 === 0 ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`flex items-start gap-2.5 ${
                i % 2 === 0 ? "flex-row-reverse" : "flex-row"
              }`}
            >
              <Skeleton className="w-8 h-8 rounded-full" />
              <div
                className={`flex flex-col w-full max-w-[320px] leading-1.5 ${
                  i % 2 === 0 ? "items-end" : "items-start"
                }`}
              >
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <Skeleton className="w-20 h-4" />
                  <Skeleton className="w-16 h-3" />
                </div>
                <Skeleton className="w-full h-20 mt-2 rounded-lg" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Input area */}
      <div className="border-t p-4">
        <div className="flex items-center gap-2">
          <Skeleton className="w-10 h-10 rounded-full" />
          <Skeleton className="flex-1 h-10 rounded-lg" />
          <Skeleton className="w-10 h-10 rounded-full" />
        </div>
      </div>
    </div>
  );
}
