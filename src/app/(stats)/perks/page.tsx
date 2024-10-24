import { trpcServerSideCaller } from "@/lib/trpc/server";
import PerkStatsTable from "./PerkStatsTable";

export default async function Page() {
  const perkStats = await trpcServerSideCaller.perkStats();

  return (
    <main>
      <PerkStatsTable perkStats={perkStats} />
    </main>
  );
}
