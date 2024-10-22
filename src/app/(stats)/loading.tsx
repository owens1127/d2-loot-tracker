"use client";

import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Skeleton className="w-1/2 h-12" />
    </div>
  );
}
