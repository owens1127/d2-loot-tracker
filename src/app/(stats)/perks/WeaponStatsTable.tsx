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
import { useManifest } from "@/lib/bungie/manifest";
import { useInventoryItemDefinitionsSuspended } from "@/lib/bungie/useInventoryItemDefinitions";
import Image from "next/image";

const categories = [
  "barrels",
  "magazines",
  "leftTraits",
  "rightTraits",
  "masterworks",
] as const;

export default function WeaponStatsTable() {
  useManifest();
  const [weaponStats] = trpc.perkStats.useSuspenseQuery();

  const { data: inventoryItems } = useInventoryItemDefinitionsSuspended();

  return (
    <div className="space-y-8 bg-gray-900 text-white p-4 rounded-md">
      {weaponStats.map((weapon) => (
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
            <div className="grid grid-cols-5 gap-4 mb-4">
              {categories.map((category) => (
                <div key={category} className="text-sm">
                  <h3 className="font-semibold">
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </h3>
                  <p>Total: {weapon[category].total}</p>
                  <p>Unique: {weapon[category].unique}</p>
                </div>
              ))}
            </div>
            <ScrollArea className="w-full">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    {categories.map((category) => (
                      <TableHead key={category} className="min-w-[150px]">
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.from({
                    length: Math.max(
                      ...categories.map((cat) => weapon[cat].data.length)
                    ),
                  }).map((_, index) => (
                    <TableRow key={index} className="hover:bg-transparent">
                      {categories.map((category) => (
                        <TableCell key={category}>
                          {weapon[category].data[index] ? (
                            <Cell
                              {...weapon[category].data[index]}
                              total={weapon[category].total}
                              unique={weapon[category].unique}
                              category={category}
                            />
                          ) : null}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

const Cell = (props: {
  perk: string;
  count: number;
  total: number;
  unique: number;
  category: (typeof categories)[number];
}) => {
  const { data: inventoryItems } = useInventoryItemDefinitionsSuspended();

  const getBackgroundColor = () => {
    const ratio = props.count / (props.total / props.unique);
    if (ratio >= 1.2) return "bg-green-900";
    if (ratio >= 1) return "bg-green-700";
    if (ratio >= 0.9) return "bg-yellow-700";
    if (ratio >= 0.75) return "bg-orange-700";
    if (ratio >= 0.5) return "bg-red-700";
    return "bg-red-500";
  };

  return (
    <div
      data-hash={props.perk}
      className={`${getBackgroundColor()} text-foreground p-2 rounded-md text-sm flex items-center space-x-2 border border-border`}
    >
      {props.category !== "masterworks" && inventoryItems[props.perk] ? (
        <>
          <div className="relative w-10 h-10 flex-shrink-0">
            <Image
              src={`https://www.bungie.net${inventoryItems[props.perk].displayProperties.icon}`}
              alt={inventoryItems[props.perk].displayProperties.name}
              unoptimized
              fill
              style={{ objectFit: "contain" }}
              className="rounded-md border border-border"
            />
          </div>
          <div className="text-lg text-zinc-100">
            <div>{inventoryItems[props.perk].displayProperties.name}:</div>
            <div>
              {props.count} (
              {Math.round(
                (10000 *
                  props.count *
                  (props.category === "barrels" ||
                  props.category === "magazines"
                    ? 2
                    : 1)) /
                  props.total
              ) /
                100 +
                "%"}
              )
            </div>
          </div>
        </>
      ) : (
        <div className="text-lg text-zinc-100">
          <div>{props.perk}</div>
          <div>
            {props.count} ({Math.round((props.count / props.total) * 100)}%)
          </div>
        </div>
      )}
    </div>
  );
};
