"use client";

import { useSocketsForWeapon } from "@/lib/bungie/useSocketsForWeapon";
import { useMemo } from "react";
import chiSquareCDF from "@stdlib/stats-base-dists-chisquare-cdf";
import { Skeleton } from "@/components/ui/skeleton";
import { useInventoryItemDefinitionsSuspended } from "@/lib/bungie/useInventoryItemDefinitions";
import Image from "next/image";

export default function ChiSquareChart(weapon: {
  weaponHash: string;
  rolls: {
    leftPerk: string;
    rightPerk: string;
    count: number;
  }[];
}) {
  const [left, right] = useSocketsForWeapon(weapon.weaponHash);
  const cardinality = left.length * right.length;

  const chiSquareResult = useMemo(() => {
    const totalRolls = weapon.rolls.reduce((sum, roll) => sum + roll.count, 0);
    const expectedFrequency = totalRolls / cardinality;

    const observedFrequencies = new Array(cardinality).fill(0);
    weapon.rolls.forEach((roll, i) => {
      observedFrequencies[i] = roll.count;
    });
    const expectedFrequencies = new Array(observedFrequencies.length).fill(
      expectedFrequency
    );

    const degreesOfFreedom = cardinality - 1;

    const chiSquare = observedFrequencies.reduce((sum, observed, i) => {
      const expected = expectedFrequencies[i];
      return sum + Math.pow(observed - expected, 2) / expected;
    }, 0);

    // Calculate p-value (for simplicity, using a fixed degree of freedom)
    const pValue = 1 - chiSquareCDF(chiSquare, degreesOfFreedom);

    return {
      totalRolls,
      chiSquare,
      pValue,
      observedFrequencies,
      degreesOfFreedom,
    };
  }, [cardinality, weapon.rolls]);

  const { data: inventoryItems } = useInventoryItemDefinitionsSuspended();

  const significanceLevel = 0.001;
  const interpretation =
    chiSquareResult.pValue < significanceLevel
      ? "There is a significant difference between the observed and expected frequencies."
      : "There is no significant difference between the observed and expected frequencies.";

  return (
    <div className="bg-gray-800 text-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Chi Square Test</h2>
      {!cardinality ? (
        <Skeleton className="h-[200px] w-full bg-zinc-800" />
      ) : (
        <div>
          <div className="flex items-center mb-4">
            <Image
              src={`https://www.bungie.net${inventoryItems[weapon.weaponHash].displayProperties.icon}`}
              alt={inventoryItems[weapon.weaponHash].displayProperties.name}
              unoptimized
              width={72}
              height={72}
              className="rounded-md mr-4"
            />
            <h3 className="text-xl font-semibold">
              {inventoryItems[weapon.weaponHash].displayProperties.name}
            </h3>
          </div>
          <div className="space-y-2">
            <p className="text-lg">
              <span className="font-semibold">Hypothesis:</span> The chance of
              getting a roll with any combination of left and right perks is
              equal.
            </p>
            <p className="text-lg">
              <span className="font-semibold">Total rolls:</span>{" "}
              {chiSquareResult.totalRolls}
            </p>
            <p className="text-lg">
              <span className="font-semibold">Degrees of Freedom:</span>{" "}
              {chiSquareResult.degreesOfFreedom}
            </p>
            <p className="text-lg">
              <span className="font-semibold">Chi Square:</span>{" "}
              {chiSquareResult.chiSquare.toFixed(2)}
            </p>
            <p className="text-lg">
              <span className="font-semibold">P-Value:</span>{" "}
              {chiSquareResult.pValue}
            </p>
            <p className="text-lg">
              <span className="font-semibold">Interpretation:</span>{" "}
              {interpretation}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
