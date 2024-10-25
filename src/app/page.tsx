import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { Suspense } from "react";
import RecentRolls from "./RecentRolls";
import { HydrateClient, trpc } from "@/lib/trpc/server";

export const dynamic = "force-static";
export const revalidate = 30;

export default function Home() {
  void trpc.allRecentRolls.prefetch();

  return (
    <main className="flex-grow flex flex-col items-center justify-center">
      <div className="max-w-7xl mx-auto my-4 px-4 sm:px-6 lg:px-8 text-center">
        <div className="border-4 border-dashed border-zinc-700 rounded-lg p-12">
          <h1 className="text-4xl font-bold mb-4">D2 Loot Tracker</h1>
          <p className="text-xl text-zinc-400">
            Sign in to begin and navigate to{" "}
            <Link href="/inventory">/inventory</Link>
          </p>
        </div>
      </div>
      <HydrateClient>
        <Suspense
          fallback={
            <Skeleton className="w-full h-48 bg-zinc-700 rounded-lg mt-4" />
          }
        >
          <RecentRolls />
        </Suspense>
      </HydrateClient>
    </main>
  );
}
