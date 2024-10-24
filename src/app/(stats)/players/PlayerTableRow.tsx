"use client";

import { TableCell, TableRow } from "@/components/ui/table";
import { useResolvePlayer } from "@/lib/useResolvePlayer";
import Image from "next/image";

export default function PlayerTableRow(player: {
  position: number;
  rank: number;
  destinyMembershipId: string;
  count: number;
}) {
  const { data: profile } = useResolvePlayer(player.destinyMembershipId);

  return (
    <TableRow key={player.destinyMembershipId} className="hover:bg-muted/50">
      <TableCell>{player.rank}</TableCell>
      <TableCell>
        <div className="flex items-center space-x-2">
          {profile && (
            <>
              <Image
                src={`https://www.bungie.net${profile.iconPath}`}
                alt={profile.displayName}
                unoptimized
                width={32}
                height={32}
                className="rounded-md"
              />
              <span>
                {profile.bungieGlobalDisplayName}#
                {profile.bungieGlobalDisplayNameCode}
              </span>
            </>
          )}
        </div>
      </TableCell>
      <TableCell>{player.count}</TableCell>
    </TableRow>
  );
}
