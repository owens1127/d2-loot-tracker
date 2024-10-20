import { useSuspenseQuery } from "@tanstack/react-query";
import { getProfile } from "bungie-net-core/endpoints/Destiny2";
import {
  BungieMembershipType,
  DestinyItemComponent,
} from "bungie-net-core/models";
import { useBungieClient } from "../../lib/bungie/client";
import { useInventoryItemDefinitions } from "../../lib/bungie/useInventoryItemDefinitions";
import { useEffect, useMemo, useRef, useState } from "react";
import { trpc } from "@/app/trpc/client";
import { WeaponRoll } from "@prisma/client";

export const useInventoryScrape = (params: {
  destinyMembershipId: string;
  membershipType: BungieMembershipType;
  isEnabled: boolean;
}) => {
  const client = useBungieClient();
  const inventoryQuery = useSuspenseQuery({
    queryKey: ["profile", params],
    refetchOnWindowFocus: true,
    refetchIntervalInBackground: params.isEnabled,
    refetchInterval: 60_000,
    queryFn: () =>
      getProfile(client, {
        ...params,
        components: [102, 201, 310, 305],
      }).then((response) => response.Response),
  });

  const [activeHashes] = trpc.activeHashes.useSuspenseQuery(undefined, {
    refetchInterval: 30 * 60_000,
  });
  const { data: inventoryItemDefinitions } = useInventoryItemDefinitions();

  const prevItems = useRef<{
    lastUpdated: number;
    items: Set<string> | null;
  }>({
    lastUpdated: Date.now(),
    items: null,
  });
  const [thisSessionItems, setThisSessionItems] = useState<WeaponRoll[]>([]);
  const trpcUtils = trpc.useUtils();
  const { mutate: addRolls, data: latestUpload } = trpc.addRolls.useMutation({
    onSuccess: (data) => {
      trpcUtils.recentRolls.invalidate();
      setThisSessionItems((prev) => [...data, ...prev]);
    },
  });

  const items = useMemo(() => {
    const activeHashesSet = new Set(
      activeHashes.map((hash) => Number(hash.weaponHash))
    );
    const items: DestinyItemComponent[] = [];
    if (inventoryQuery.data?.profileInventory.data?.items) {
      items.push(...inventoryQuery.data.profileInventory.data.items);
    }
    Object.values(inventoryQuery.data?.characterInventories.data ?? {}).forEach(
      (component) => {
        items.push(...component.items);
      }
    );

    return items.filter((item) => activeHashesSet.has(item.itemHash));
  }, [inventoryQuery.data, activeHashes]);

  useEffect(() => {
    prevItems.current = {
      lastUpdated: Date.now(),
      items: null,
    };
  }, [params.destinyMembershipId]);

  useEffect(() => {
    // Clear cache if it's been 30 minutes since last update
    if (Date.now() - prevItems.current.lastUpdated > 30 * 60_000) {
      prevItems.current = {
        lastUpdated: Date.now(),
        items: null,
      };
      return;
    }

    const formattedItems = new Map(
      items.map((item) => {
        const plugs = new Map(
          Object.entries(
            inventoryQuery.data?.itemComponents.reusablePlugs.data?.[
              item.itemInstanceId!
            ].plugs ?? {}
          )
        );

        return [
          item.itemInstanceId!,
          {
            item,
            masterwork: inventoryQuery.data?.itemComponents.sockets.data?.[
              item.itemInstanceId!
            ].sockets
              .map((s) => inventoryItemDefinitions[s.plugHash!])
              .find((def) =>
                def.plug?.plugCategoryIdentifier.includes(
                  "v400.plugs.weapons.masterworks.stat."
                )
              )
              ?.plug?.plugCategoryIdentifier.split(
                "v400.plugs.weapons.masterworks.stat."
              )[1],
            barrels: plugs.get("1")!.map((plug) => plug.plugItemHash),
            magazines: plugs.get("2")!.map((plug) => plug.plugItemHash),
            leftPerks: plugs.get("3")!.map((plug) => plug.plugItemHash),
            rightPerks: plugs.get("4")!.map((plug) => plug.plugItemHash),
          },
        ];
      })
    );

    const oldItems = prevItems.current.items;
    const newItems = new Set(formattedItems.keys());
    if (oldItems) {
      const diff = newItems.difference(oldItems);

      if (diff.size === 0) {
        return;
      }

      addRolls({
        destinyMembershipId: params.destinyMembershipId,
        items: Array.from(diff).map((itemInstanceId) => {
          const item = formattedItems.get(itemInstanceId)!;
          return {
            itemHash: item.item.itemHash,
            itemInstanceId: itemInstanceId,
            barrels: item.barrels,
            magazines: item.magazines,
            leftPerks: item.leftPerks,
            rightPerks: item.rightPerks,
            masterwork: item.masterwork,
          };
        }),
      });
    }
    prevItems.current = {
      lastUpdated: Date.now(),
      items: newItems,
    };
  }, [
    addRolls,
    inventoryItemDefinitions,
    inventoryQuery.data?.itemComponents.reusablePlugs.data,
    inventoryQuery.data?.itemComponents.sockets.data,
    items,
    params.destinyMembershipId,
  ]);

  return { latestUpload, thisSessionItems };
};
