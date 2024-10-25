import { BungieMembershipType } from "bungie-net-core/models";
import { useInventoryScrape } from "@/app/inventory/useInventoryScrape";
import { useMemo, useState } from "react";
import { DestinyItemCard } from "../../components/ItemsDisplay";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc/client";

export function Main(props: {
  destinyMembershipId: string;
  membershipType: BungieMembershipType;
}) {
  const [isEnabled, setIsEnabled] = useState(false);
  const recentRollsQuery = trpc.myRecentRolls.useQuery({
    destinyMembershipId: props.destinyMembershipId,
  });
  const activeHashesQuery = trpc.activeHashes.useQuery();

  const { latestUpload, thisSessionItems } = useInventoryScrape({
    destinyMembershipId: props.destinyMembershipId,
    membershipType: props.membershipType,
    isEnabled: isEnabled,
  });

  const toggleInventoryScrape = () => {
    setIsEnabled(!isEnabled);
  };

  const orderedRecentItems = useMemo(
    () => Array.from(thisSessionItems).reverse(),
    [thisSessionItems]
  );

  return (
    <div className="container mx-auto p-4 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-100">
          Destiny Inventory Scraper
        </h1>
        <div className="flex items-center space-x-2">
          <Switch
            id="inventory-scrape"
            checked={isEnabled}
            onCheckedChange={toggleInventoryScrape}
            className="data-[state=checked]:bg-green-400 data-[state=unchecked]:bg-zinc-700"
          />
          <Label htmlFor="inventory-scrape" className="text-zinc-300">
            Inventory Scrape
          </Label>
        </div>
      </div>

      {isEnabled && (
        <>
          <div className="bg-zinc-800 p-4 rounded-md">
            <p className="text-zinc-400">
              Inventory scrape is enabled. This will automatically record your
              new inventory items every 60 seconds.
            </p>
            <p className="text-red-400 mt-2">
              Warning: Do not delete new items from your inventory while the
              scrape is enabled, this will produce inaccurate data.
            </p>
            <p className="text-red-400 mt-2">
              Leave the scraper on for a minimum of 5 minutes after you have
              finished farming; this ensures all items are recorded.
            </p>
          </div>
          {activeHashesQuery.isSuccess && (
            <div className="bg-zinc-800 p-4 rounded-md">
              <h2 className="text-xl font-semibold text-zinc-200 mb-4">
                Weapons Tracked
              </h2>
              <div className="flex flex-wrap gap-4">
                {activeHashesQuery.data.map((hash) => (
                  <div
                    key={hash.weaponHash}
                    className="bg-zinc-700 p-2 rounded-md"
                  >
                    {hash.displayName}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {latestUpload && latestUpload.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold text-zinc-200 mb-4">
            Latest Upload
          </h2>
          <div className="flex flex-wrap gap-4">
            {latestUpload.map((item) => (
              <DestinyItemCard key={item.itemInstanceId} {...item} />
            ))}
          </div>
        </section>
      )}

      {!isEnabled ? (
        <div>
          <section>
            <h2 className="text-xl font-semibold text-zinc-200 mb-4">
              Inventory Scrape Disabled
            </h2>
            <p className="text-zinc-400">
              Enable inventory scrape to start collecting data.
            </p>
          </section>
          {recentRollsQuery.isSuccess && recentRollsQuery.data.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold text-zinc-200 mb-4 mt-4">
                Recent Rolls
              </h2>
              <div className="flex flex-wrap gap-4">
                {recentRollsQuery.data.map((item) => (
                  <DestinyItemCard key={item.itemInstanceId} {...item} />
                ))}
              </div>
            </section>
          )}
        </div>
      ) : (
        <div>
          {orderedRecentItems.length > 0 ? (
            <section>
              <h2 className="text-xl font-semibold text-zinc-200 mb-4">
                This Session&apos;s Items
              </h2>
              <div className="flex flex-wrap gap-4">
                {orderedRecentItems.map(([id, item]) => (
                  <DestinyItemCard key={id} {...item} />
                ))}
              </div>
            </section>
          ) : (
            <section>
              <h2 className="text-xl font-semibold text-zinc-200 mb-4">
                No Items Recorded
              </h2>
              <p className="text-zinc-400">
                No items have been recorded in this session.
              </p>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
