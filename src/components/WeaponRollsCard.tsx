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
import { useInventoryItemDefinitionsSuspended } from "@/lib/bungie/useInventoryItemDefinitions";
import Image from "next/image";
import { useMemo } from "react";
import { useSocketsForWeapon } from "@/lib/bungie/useSocketsForWeapon";

export default function WeaponRollsCard(weapon: {
  weaponHash: string;
  rolls: {
    leftPerk: string;
    rightPerk: string;
    count: number;
  }[];
}) {
  const [leftPerks, rightPerks] = useSocketsForWeapon(weapon.weaponHash);
  const { data: inventoryItems } = useInventoryItemDefinitionsSuspended();

  const perkGrid = useMemo(() => {
    const gridRolls = leftPerks.map((leftPerk) => ({
      perk: leftPerk,
      columns: rightPerks.map((rightPerk) => ({
        perk: rightPerk,
        count:
          weapon.rolls.find(
            (r) =>
              r.leftPerk === String(leftPerk) &&
              r.rightPerk === String(rightPerk)
          )?.count ?? 0,
      })),
    }));

    return {
      totalRolls: weapon.rolls.length,
      expected:
        gridRolls.reduce(
          (acc, curr) => acc + curr.columns.reduce((a, c) => a + c.count, 0),
          0
        ) / Math.max(1, gridRolls.length * (gridRolls[0]?.columns.length ?? 0)),
      weaponHash: weapon.weaponHash,
      topRowPerks: rightPerks,
      gridRolls,
    };
  }, [leftPerks, rightPerks, weapon]);

  return (
    <Card className="bg-gray-800 text-white">
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
        <ScrollArea className="h-[450px] w-full rounded-md border border-gray-700">
          <div className="w-full">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead />
                  {perkGrid.topRowPerks.map((perk) => (
                    <TableHead key={perk}>
                      <IconCell perk={perk} />
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {perkGrid.gridRolls.map((row) => (
                  <TableRow key={row.perk} className="hover:bg-transparent">
                    <TableCell>
                      <IconCell perk={row.perk} />
                    </TableCell>
                    {row.columns.map((column) => (
                      <TableCell key={column.perk}>
                        <NumberCell
                          count={column.count}
                          total={perkGrid.totalRolls}
                          expected={perkGrid.expected}
                        />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <ScrollBar orientation="vertical" />
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

const IconCell = (props: { perk: number }) => {
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
const NumberCell = (props: {
  count: number;
  total: number;
  expected: number;
}) => {
  const ratio = props.count / props.expected; // Calculate the ratio instead of deviation

  const shade = Math.min(255, Math.floor(ratio * 127)); // Closer to 2 -> lighter (higher intensity), closer to 0 -> darker (lower intensity)

  const backgroundColor = `rgba(${shade}, ${shade}, ${shade}, 1)`; // Full opacity, grayscale shading

  const textColor = shade > 127 ? "text-black" : "text-white";

  return (
    <div
      className={`p-2 rounded-md text-center ${textColor}`}
      style={{ backgroundColor }}
    >
      {props.count}
    </div>
  );
};
