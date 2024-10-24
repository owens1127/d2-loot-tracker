import { trpcServerSideCaller } from "@/lib/trpc/server";
import PlayerLeaderboards from "./PlayerLeaderboards";

export default async function Page() {
  const players = await trpcServerSideCaller.topPlayers();

  return (
    <main>
      <div className="p-4 space-y-4">
        <PlayerLeaderboards players={players} />
      </div>
    </main>
  );
}
