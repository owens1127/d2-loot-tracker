import { trpcServerSideCaller } from "@/lib/trpc/server";
import PerkStatsTable from "./PerkStatsTable";

export default async function Page() {
  const perkStats = await trpcServerSideCaller.perkStats();

  return (
    <main>
      <h1 className="text-2xl font-bold my-4 text-center">
        Perk totals since the patch
      </h1>
      <PerkStatsTable perkStats={perkStats} />
    </main>
  );
}
