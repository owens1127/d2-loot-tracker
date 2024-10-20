import { useSuspenseQuery } from "@tanstack/react-query";
import { useManifestSuspended } from "./manifest";
import { getDestinyManifestComponent } from "bungie-net-core/manifest";
import { useBungieClient } from "./client";

export const useInventoryItemDefinitions = () => {
  const client = useBungieClient();
  const { data: manifest } = useManifestSuspended();

  return useSuspenseQuery({
    queryKey: ["DestinyInventoryItemLiteDefinition", manifest.version],
    queryFn: () =>
      getDestinyManifestComponent(client, {
        destinyManifest: manifest!,
        tableName: "DestinyInventoryItemDefinition",
        language: "en",
      }),
  });
};
