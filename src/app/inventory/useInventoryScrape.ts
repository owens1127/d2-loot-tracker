import {
  BungieMembershipType,
  DestinyItemComponent,
} from "bungie-net-core/models";
import { useEffect, useMemo, useRef, useState } from "react";
import { trpc } from "@/lib/trpc/client";
import { WeaponRoll } from "@prisma/client";
import { useProfileItems } from "@/lib/bungie/useProfileData";
import { useInventoryItemDefinitions } from "@/lib/bungie/useInventoryItemDefinitions";
import toast from "react-hot-toast";

export const useInventoryScrape = (params: {
  destinyMembershipId: string;
  membershipType: BungieMembershipType;
  isEnabled: boolean;
}) => {
  const [thisSessionItems, setThisSessionItems] = useState(
    new Map<string, WeaponRoll>()
  );
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
  const { data: inventoryItemDefinitions } = useInventoryItemDefinitions();
  const [activeHashes] = trpc.activeHashes.useSuspenseQuery();

  const trpcUtils = trpc.useUtils();
  const { mutate: addRolls, data: latestUpload } = trpc.addRolls.useMutation({
    retry: 3,
    onSuccess: (data) => {
      trpcUtils.myRecentRolls.invalidate();
      setThisSessionItems((prev) => {
        const newItems = new Map<string, WeaponRoll>(prev);
        data
          .sort(
            (a, b) =>
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          )
          .forEach((item) => {
            newItems.set(item.itemInstanceId, item);
          });
        return newItems;
      });
      if (data.length) {
        toast.success(
          `${data.length} new rolls uploaded successfully at ${new Date().toLocaleTimeString()}`,
          {
            duration: 10000,
            style: {
              background: "#27272a",
              color: "#fafafa",
              padding: "16px",
              borderRadius: "8px",
              boxShadow:
                "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
            },
            iconTheme: {
              primary: "#22c55e",
              secondary: "#fafafa",
            },
          }
        );
      }
    },
    onError: (error) => {
      toast.error(`Error uploading rolls: ${error.message}`, {
        duration: 10000,
        style: {
          background: "#27272a", // zinc-800
          color: "#fafafa", // zinc-50
          padding: "16px",
          borderRadius: "8px",
          boxShadow:
            "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        },
        iconTheme: {
          primary: "#ef4444", // red-500
          secondary: "#fafafa", // zinc-50
        },
      });
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
    Object.values(profileItemsResponse.characterEquipment.data ?? {}).forEach(
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
    if (!inventoryItemDefinitions) return;

    const updatedAt = new Date(
      profileItemsResponse.responseMintedTimestamp
    ).getTime();
    console.log("Inventory updating at", new Date(updatedAt).toTimeString());

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
            barrels: plugs.get("1")!.map((plug) => plug.plugItemHash) as [
              number,
              number,
              ...number[],
            ],
            magazines: plugs.get("2")!.map((plug) => plug.plugItemHash) as [
              number,
              number,
              ...number[],
            ],
            leftPerks: plugs.get("3")!.map((plug) => plug.plugItemHash) as [
              number,
              ...number[],
            ],
            rightPerks: plugs.get("4")!.map((plug) => plug.plugItemHash) as [
              number,
              ...number[],
            ],
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
