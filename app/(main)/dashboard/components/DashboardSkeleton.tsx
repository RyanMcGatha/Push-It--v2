"use client";

import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

export function DashboardSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="grid h-full grid-cols-[320px_1fr] gap-0"
    >
      {/* Chat Sidebar Skeleton */}
      <div className="border-r border-border/50 p-4 space-y-4">
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-8 w-[120px]" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>

        {/* Search Bar Skeleton */}
        <Skeleton className="h-10 w-full rounded-lg" />

        {/* Chat List Skeleton */}
        <div className="space-y-4 mt-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area Skeleton */}
      <div className="flex flex-col h-full">
        {/* Chat Header */}
        <div className="border-b border-border/50 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[160px]" />
                <Skeleton className="h-3 w-[100px]" />
              </div>
            </div>
            <div className="flex space-x-2">
              <Skeleton className="h-8 w-8 rounded-lg" />
              <Skeleton className="h-8 w-8 rounded-lg" />
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 p-4 space-y-6 overflow-hidden">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className={`flex items-start space-x-4 ${
                i % 2 === 0 ? "" : "flex-row-reverse space-x-reverse"
              }`}
            >
              <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
              <div className={`space-y-2 ${i % 2 === 0 ? "w-2/3" : "w-1/2"}`}>
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-24 w-full rounded-xl" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          ))}
        </div>

        {/* Chat Input */}
        <div className="border-t border-border/50 p-4">
          <div className="flex items-center space-x-4">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <Skeleton className="h-10 flex-1 rounded-lg" />
            <Skeleton className="h-10 w-10 rounded-lg" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
