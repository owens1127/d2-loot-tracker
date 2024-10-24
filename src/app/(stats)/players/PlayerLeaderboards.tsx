import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { inferProcedureOutput } from "@trpc/server";
import type { AppRouter } from "@/lib/trpc/router";
import PlayerTableRow from "./PlayerTableRow";

export default function PlayerLeaderboards(props: {
  players: inferProcedureOutput<AppRouter["topPlayers"]>;
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Rank</TableHead>
          <TableHead>Player</TableHead>
          <TableHead>Number of Tracked Items</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {props.players.map((player) => (
          <PlayerTableRow key={player.destinyMembershipId} {...player} />
        ))}
      </TableBody>
    </Table>
  );
}
