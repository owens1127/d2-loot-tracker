"use client";

import { DestinyItemCard } from "@/components/ItemsDisplay";
import { trpc } from "@/lib/trpc/client";

export default function RecentRolls() {
  const [rolls] = trpc.allRecentRolls.useSuspenseQuery(undefined, {
    staleTime: 15_000,
    refetchInterval: 30_000,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
  });

  return (
    <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {rolls.map((roll) => (
        <DestinyItemCard key={roll.itemInstanceId} {...roll} />
      ))}
    </div>
  );
}
