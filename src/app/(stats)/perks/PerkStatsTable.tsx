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
import Image from "next/image";
import type { inferProcedureOutput } from "@trpc/server";
import type { AppRouter } from "@/lib/trpc/router";
import { useInventoryItemDefinitions } from "@/lib/bungie/useInventoryItemDefinitions";

const categories = [
  "barrels",
  "magazines",
  "leftTraits",
  "rightTraits",
  "masterworks",
] as const;

export default function WeaponStatsTable(props: {
  perkStats: inferProcedureOutput<AppRouter["perkStats"]>;
}) {
  const { data: inventoryItems } = useInventoryItemDefinitions();

  return (
    <div className="space-y-8 bg-gray-900 text-white p-4 rounded-md">
      {inventoryItems &&
        props.perkStats.map((weapon) => (
          <Card key={weapon.weaponHash} className="bg-gray-800 text-white">
            <CardHeader>
              <CardTitle>
                <div
                  data-hash={weapon.weaponHash}
                  className="flex items-center space-x-4"
                >
                  <Image
                    src={`https://www.bungie.net${inventoryItems[weapon.weaponHash].displayProperties.icon}`}
                    alt={
                      inventoryItems[weapon.weaponHash].displayProperties.name
                    }
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
                                weaponHash={weapon.weaponHash}
                                total={weapon[category].total}
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
  weaponHash: number;
  perk: string;
  count: number;
  total: number;
  category: (typeof categories)[number];
}) => {
  const { data: inventoryItems } = useInventoryItemDefinitions();

  const perksPerCol =
    props.category === "barrels" || props.category === "magazines" ? 2 : 1;
  const ratio = (perksPerCol * props.count) / props.total;

  return (
    <div
      data-hash={props.perk}
      className={
        "p-2 bg-slate-600 rounded-md text-sm flex items-center space-x-2 border border-border"
      }
    >
      {inventoryItems &&
        (props.category !== "masterworks" && inventoryItems[props.perk] ? (
          <>
            <div
              className={`relative w-10 h-10 flex-shrink-0 bg-gray-700 rounded-md`}
            >
              <Image
                src={`https://www.bungie.net${inventoryItems[props.perk].displayProperties.icon}`}
                alt={inventoryItems[props.perk].displayProperties.name}
                unoptimized
                fill
                style={{ objectFit: "contain" }}
                className="rounded-md border border-border"
              />
            </div>
            <div className="text-lg">
              <div>{inventoryItems[props.perk].displayProperties.name}:</div>
              <div>
                {props.count} ({Math.round(10000 * ratio) / 100 + "%"})
              </div>
            </div>
          </>
        ) : (
          <div className="text-lg text-zinc-100">
            <div>{props.perk}</div>
            <div>
              {props.count} ({Math.round(10000 * ratio) / 100 + "%"})
            </div>
          </div>
        ))}
    </div>
  );
};
