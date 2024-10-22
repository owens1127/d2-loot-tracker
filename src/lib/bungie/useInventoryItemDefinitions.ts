import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { useManifestSuspended } from "./manifest";
import { getDestinyManifestComponent } from "bungie-net-core/manifest";
import { useBungieClient } from "./client";

const useInventoryItemDefinitionsOptions = () => {
  const client = useBungieClient();
  const { data: manifest } = useManifestSuspended();

  return {
    queryKey: ["DestinyInventoryItemDefinition", manifest.version],
    queryFn: () =>
      getDestinyManifestComponent(client, {
        destinyManifest: manifest,
        tableName: "DestinyInventoryItemDefinition",
        language: "en",
      }),
  };
};

export const useInventoryItemDefinitions = () =>
  useQuery(useInventoryItemDefinitionsOptions());

export const useInventoryItemDefinitionsSuspended = () =>
  useSuspenseQuery(useInventoryItemDefinitionsOptions());
