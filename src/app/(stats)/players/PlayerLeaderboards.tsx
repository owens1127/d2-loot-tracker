"use client";

import { trpc } from "@/lib/trpc/client";
import Image from "next/image";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useResolvePlayer } from "@/lib/useResolvePlayer";

const PLAYERS_PER_PAGE = 25;

export default function PlayerLeaderboards() {
  const [currentPage, setCurrentPage] = useState(1);

  const [players] = trpc.topPlayers.useSuspenseQuery({
    page: currentPage,
    limit: PLAYERS_PER_PAGE,
  });

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => prev + 1);
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center mt-4">
        <Button
          onClick={handlePreviousPage}
          disabled={currentPage === 1}
          variant="secondary"
          className="bg-gray-200 text-gray-800 hover:bg-gray-300"
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>
        <span className="text-gray-800">Page {currentPage}</span>
        <Button
          onClick={handleNextPage}
          disabled={players.length < PLAYERS_PER_PAGE}
          variant="secondary"
          className="bg-gray-200 text-gray-800 hover:bg-gray-300"
        >
          Next
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Rank</TableHead>
            <TableHead>Player</TableHead>
            <TableHead>Number of Tracked Items</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {players.map((player) => (
            <PlayerRow key={player.destinyMembershipId} {...player} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

const PlayerRow = (player: {
  position: number;
  rank: number;
  destinyMembershipId: string;
  count: number;
}) => {
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
};
