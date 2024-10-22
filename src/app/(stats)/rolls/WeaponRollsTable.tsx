"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { trpc } from "@/lib/trpc/client";
import { useInventoryItemDefinitionsSuspended } from "@/lib/bungie/useInventoryItemDefinitions";
import Image from "next/image";

export default function WeaponRollsTable() {
  const { data: inventoryItems } = useInventoryItemDefinitionsSuspended();
  const [commonPerkRolls] = trpc.commonRolls.useSuspenseQuery(undefined, {
    staleTime: Infinity,
  });

  return (
    <div className="space-y-8 bg-gray-900 text-white p-4 rounded-md max-w-3xl mx-auto">
      {commonPerkRolls.map((weapon) => (
        <Card key={weapon.weaponHash} className="bg-gray-800 text-white">
          <CardHeader>
            <CardTitle>
              <div
                data-hash={weapon.weaponHash}
                className="flex items-center space-x-4"
              >
                <Image
                  src={`https://www.bungie.net${inventoryItems[weapon.weaponHash].displayProperties.icon}`}
                  alt={inventoryItems[weapon.weaponHash].displayProperties.name}
                  unoptimized
                  width={72}
                  height={72}
                  className="rounded-md"
                />
                <span className="text-lg font-semibold">
                  {inventoryItems[weapon.weaponHash].displayProperties.name}
                </span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] w-full rounded-md border border-gray-700">
              <div className="w-full">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="w-[60px]">Rank</TableHead>
                      <TableHead className="w-[80px]">Count</TableHead>
                      <TableHead>Left Perk</TableHead>
                      <TableHead>Right Perk</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {weapon.rolls.map((roll, idx) => (
                      <TableRow
                        key={`${roll.leftPerk}-${roll.rightPerk}`}
                        className="hover:bg-transparent"
                      >
                        <TableCell className="font-medium">
                          #{idx + 1}
                        </TableCell>
                        <TableCell>{roll.count}</TableCell>
                        <TableCell>
                          <Cell perk={roll.leftPerk} />
                        </TableCell>
                        <TableCell>
                          <Cell perk={roll.rightPerk} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <ScrollBar orientation="vertical" />
            </ScrollArea>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

const Cell = (props: { perk: string }) => {
  const { data: inventoryItems } = useInventoryItemDefinitionsSuspended();

  return (
    <Image
      src={`https://www.bungie.net${inventoryItems[props.perk].displayProperties.icon}`}
      width={40}
      height={40}
      alt={inventoryItems[props.perk].displayProperties.name}
      className="rounded-md cursor-pointer"
      unoptimized
    />
  );
};
