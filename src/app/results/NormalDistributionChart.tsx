"use client";

import { useSocketsForWeapon } from "@/lib/bungie/useSocketsForWeapon";
import { useMemo } from "react";
import { useInventoryItemDefinitionsSuspended } from "@/lib/bungie/useInventoryItemDefinitions";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

export default function NormalDistributionChart(weapon: {
  weaponHash: string;
  rolls: {
    leftPerk: string;
    rightPerk: string;
    count: number;
  }[];
}) {
  const [left, right] = useSocketsForWeapon(weapon.weaponHash);

  const data = useMemo(() => {
    if (left.length != right.length) {
      console.log("Left and right perk counts are not equal.");
      return [];
    }

    const totalRolls = weapon.rolls.reduce((sum, roll) => sum + roll.count, 0);

    return left.flatMap((leftPerk) =>
      right.map((rightPerk) => {
        const distanceA = leftPerk.socketIndex - rightPerk.socketIndex;
        const distanceB = left.length - Math.abs(distanceA);
        const circularDistance =
          Math.abs(distanceA) <= Math.abs(distanceB) ? distanceA : distanceB;

        const count =
          weapon.rolls.find(
            (r) =>
              r.leftPerk === String(leftPerk.perkItemHash) &&
              r.rightPerk === String(rightPerk.perkItemHash)
          )?.count ?? 0;

        return {
          circularDistance,
          leftPerkItemHash: leftPerk.perkItemHash,
          rightPerkItemHash: rightPerk.perkItemHash,
          count,
          p: count / totalRolls,
        };
      })
    );
  }, [left, right, weapon.rolls]);

  const { data: inventoryItems } = useInventoryItemDefinitionsSuspended();

  return (
    <Card className="w-full max-w-3xl">
      <CardHeader>
        <CardTitle>Weapon Probability Chart</CardTitle>
        <CardDescription>Circular Distance vs Probability</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            weaponProb: {
              label: "Weapon Probability",
              color: "hsl(var(--chart-1))",
            },
          }}
          className="h-[400px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid />
              <XAxis
                type="number"
                dataKey="circularDistance"
                name="Circular Distance"
                unit=""
                label={{
                  value: "Circular Distance",
                  position: "bottom",
                  offset: 0,
                }}
              />
              <YAxis
                type="number"
                dataKey="p"
                name="Probability"
                unit=""
                label={{
                  value: "Probability",
                  angle: -90,
                  position: "insideLeft",
                }}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value, name) => {
                      if (
                        name === "Circular Distance" ||
                        name === "Probability"
                      ) {
                        return [value, name];
                      }
                      return [value, name];
                    }}
                  />
                }
              />
              <Scatter
                name="Weapon Probability"
                data={data}
                fill="var(--color-weaponProb)"
              />
            </ScatterChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
