import {
  BungieMembershipType,
  DestinyItemComponent,
} from "bungie-net-core/models";
import { useEffect, useMemo, useRef, useState } from "react";
import { trpc } from "@/lib/trpc/client";
import { WeaponRoll } from "@prisma/client";
import { useProfileItems } from "@/lib/bungie/useProfileData";
import { useInventoryItemDefinitionsSuspended } from "@/lib/bungie/useInventoryItemDefinitions";

export const useInventoryScrape = (params: {
  destinyMembershipId: string;
  membershipType: BungieMembershipType;
  isEnabled: boolean;
}) => {
  const [thisSessionItems, setThisSessionItems] = useState<WeaponRoll[]>([]);
  const prevItems = useRef<{
    lastUpdated: number;
    itemIds: Set<string> | null;
  }>({
    lastUpdated: Date.now(),
    itemIds: null,
  });

  const { data: profileItemsResponse } = useProfileItems(
    {
      destinyMembershipId: params.destinyMembershipId,
      membershipType: params.membershipType,
    },
    {
      isEnabled: params.isEnabled,
    }
  );
  const { data: inventoryItemDefinitions } =
    useInventoryItemDefinitionsSuspended();
  const [activeHashes] = trpc.activeHashes.useSuspenseQuery(undefined, {
    staleTime: Infinity,
  });

  const trpcUtils = trpc.useUtils();
  const { mutate: addRolls, data: latestUpload } = trpc.addRolls.useMutation({
    onSuccess: (data) => {
      trpcUtils.recentRolls.invalidate();
      setThisSessionItems((prev) => [...data, ...prev]);
    },
  });

  const allItems = useMemo(() => {
    const items: DestinyItemComponent[] = [];
    if (profileItemsResponse.profileInventory.data?.items) {
      items.push(...profileItemsResponse.profileInventory.data.items);
    }
    Object.values(profileItemsResponse.characterInventories.data ?? {}).forEach(
      (component) => {
        items.push(...component.items);
      }
    );

    return new Map(
      items
        .filter((item) => item.itemInstanceId!)
        .map((item) => [item.itemInstanceId!, item])
    );
  }, [profileItemsResponse]);

  // Reset cache when membership changes or activeHashes changes
  useEffect(() => {
    prevItems.current = {
      lastUpdated: Date.now(),
      itemIds: null,
    };
  }, [params.destinyMembershipId]);

  useEffect(() => {
    const updatedAt = new Date(
      profileItemsResponse.responseMintedTimestamp
    ).getTime();
    console.debug("Inventory updating at", updatedAt);

    // Clear cache if it's been 30 minutes since last update
    if (updatedAt - prevItems.current.lastUpdated > 30 * 60_000) {
      prevItems.current = {
        lastUpdated: updatedAt,
        itemIds: null,
      };
      console.log("Clearing session cache");
      return;
    }

    const activeHashesSet = new Set(
      activeHashes.map((hash) => Number(hash.weaponHash))
    );

    const oldItemIds = prevItems.current.itemIds;
    const newItemsIds = new Set(allItems.keys());

    if (oldItemIds) {
      const differentItemIds = newItemsIds.difference(oldItemIds);
      console.log("Different item ids", differentItemIds);

      const relevantNewItems = Array.from(differentItemIds)
        .map((itemInstanceId) => allItems.get(itemInstanceId)!)
        .filter((item) => activeHashesSet.has(item.itemHash))
        .map((item) => {
          const plugs = new Map(
            Object.entries(
              profileItemsResponse.itemComponents.reusablePlugs.data?.[
                item.itemInstanceId!
              ].plugs ?? {}
            )
          );

          return {
            itemInstanceId: item.itemInstanceId!,
            itemHash: item.itemHash,
            masterwork: profileItemsResponse.itemComponents.sockets.data?.[
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
          };
        });

      // Only add new items if there are any
      if (relevantNewItems.length > 0) {
        console.log("Adding new items", relevantNewItems);
        addRolls({
          destinyMembershipId: params.destinyMembershipId,
          items: relevantNewItems,
        });
      }
    }

    prevItems.current = {
      lastUpdated: updatedAt,
      itemIds: newItemsIds,
    };
  }, [
    addRolls,
    inventoryItemDefinitions,
    profileItemsResponse.responseMintedTimestamp,
    profileItemsResponse.itemComponents.reusablePlugs.data,
    profileItemsResponse.itemComponents.sockets.data,
    allItems,
    params.destinyMembershipId,
    activeHashes,
  ]);

  return { latestUpload, thisSessionItems };
};
