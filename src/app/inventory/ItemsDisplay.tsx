import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useInventoryItemDefinitionsSuspended } from "@/lib/bungie/useInventoryItemDefinitions";
import { WeaponRoll } from "@prisma/client";

export enum SyncState {
  Uploaded,
  Historic,
}

export function DestinyItemCard({
  itemInstanceId,
  createdAt,
  weaponHash,
  masterwork,
  barrel1,
  barrel2,
  magazine1,
  magazine2,
  leftTrait1,
  leftTrait2,
  leftTrait3,
  rightTrait1,
  rightTrait2,
  rightTrait3,
}: WeaponRoll & {
  syncState: SyncState;
}) {
  const { data: defs } = useInventoryItemDefinitionsSuspended();
  const def = defs[Number(weaponHash)];

  const renderPerkColumn = (perks: number[], label: string) => (
    <div className="flex flex-col items-center space-y-2">
      <span className="text-sm font-medium text-zinc-400">{label}</span>
      <div className="flex flex-col space-y-2">
        {perks.map((perk) => (
          <TooltipProvider key={perk}>
            <Tooltip delayDuration={100}>
              <TooltipTrigger asChild>
                <Image
                  src={`https://www.bungie.net${defs[perk].displayProperties.icon}`}
                  width={40}
                  height={40}
                  alt={defs[perk].displayProperties.name}
                  className="rounded-md cursor-pointer"
                  unoptimized
                />
              </TooltipTrigger>
              <TooltipContent side="right">
                <p className="font-semibold">
                  {defs[perk].displayProperties.name}
                </p>
                <p className="text-sm">
                  {defs[perk].displayProperties.description}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
      </div>
    </div>
  );

  return (
    <Card className="border-zinc-700 bg-zinc-800 w-full max-w-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-zinc-100">
          {def.displayProperties.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        <div className="flex items-center space-x-4">
          <Image
            src={`https://www.bungie.net${def.displayProperties.icon}`}
            width={64}
            height={64}
            alt={def.displayProperties.name}
            className="rounded-md"
            unoptimized
          />
          <div className="flex flex-col space-y-1">
            <p className="text-sm text-zinc-400">
              ID: <span className="text-zinc-200">{itemInstanceId}</span>
            </p>
            <p className="text-sm text-zinc-400">
              Uploaded:{" "}
              <span className="text-zinc-200">
                {createdAt.toLocaleString()}
              </span>
            </p>
          </div>
          {masterwork && (
            <p className="text-sm text-zinc-400">
              Masterwork: <span className="text-zinc-200">{masterwork}</span>
            </p>
          )}
        </div>

        <Separator className="bg-zinc-700" />

        <div className="grid grid-cols-4 gap-4">
          {renderPerkColumn(
            [barrel1, barrel2].filter((h): h is string => !!h).map(Number),
            "Barrels"
          )}
          {renderPerkColumn(
            [magazine1, magazine2].filter((h): h is string => !!h).map(Number),
            "Magazines"
          )}
          {renderPerkColumn(
            [leftTrait1, leftTrait2, leftTrait3]
              .filter((h): h is string => !!h)
              .map(Number),
            "Left Perks"
          )}
          {renderPerkColumn(
            [rightTrait1, rightTrait2, rightTrait3]
              .filter((h): h is string => !!h)
              .map(Number),
            "Right Perks"
          )}
        </div>
      </CardContent>
    </Card>
  );
}
