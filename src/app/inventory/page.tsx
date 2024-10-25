"use client";

import { useMembershipDataForCurrentUser } from "@/lib/bungie/useMembershipDataForCurrentUser";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Main } from "./Main";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useManifest } from "@/lib/bungie/manifest";
import { Toaster } from "react-hot-toast";

const membershipTypeMap = {
  [-1]: "All",
  0: "None",
  1: "Xbox",
  2: "PSN",
  3: "Steam",
  4: "Blizzard",
  5: "Stadia",
  6: "Epic",
  10: "Demon",
  254: "Bungie.net",
};

export default function Page() {
  useManifest();
  const membershipQuery = useMembershipDataForCurrentUser();

  const applicableMemberships = membershipQuery.data.destinyMemberships.filter(
    (m) => m.applicableMembershipTypes.length
  );

  return (
    <main className="min-h-screen bg-zinc-900 text-zinc-50 p-4 sm:p-6 lg:p-8">
      <Toaster position="bottom-right" />
      <Tabs
        defaultValue={applicableMemberships[0].membershipId}
        className="w-full"
      >
        {applicableMemberships.length > 1 && (
          <TabsList className="inline-flex h-10 items-center justify-start rounded-md bg-zinc-800 p-1 text-zinc-400">
            {applicableMemberships.map((membership) => (
              <TabsTrigger
                key={membership.membershipId}
                value={membership.membershipId}
                className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-zinc-900 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-zinc-700 data-[state=active]:text-zinc-50 data-[state=active]:shadow-sm"
              >
                {membershipTypeMap[membership.membershipType]}
              </TabsTrigger>
            ))}
          </TabsList>
        )}
        {applicableMemberships.map((membership) => (
          <TabsContent
            key={membership.membershipId}
            value={membership.membershipId}
            className="mt-6"
          >
            <Suspense
              fallback={
                <div className="min-h-screen bg-zinc-900 text-zinc-50 p-4 sm:p-6 lg:p-8">
                  <div className="space-y-4">
                    <Skeleton className="h-10 w-64 bg-zinc-800" />
                    <Skeleton className="h-[200px] w-full bg-zinc-800" />
                  </div>
                </div>
              }
            >
              <Main
                destinyMembershipId={membership.membershipId}
                membershipType={membership.membershipType}
              />
            </Suspense>
          </TabsContent>
        ))}
      </Tabs>
    </main>
  );
}
