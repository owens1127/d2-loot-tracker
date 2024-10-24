"use client";

import { useQuery } from "@tanstack/react-query";
import { useManifest } from "./manifest";
import { getDestinyManifestComponent } from "bungie-net-core/manifest";
import { useBungieClient } from "./client";

const useInventoryItemDefinitionsOptions = () => {
  const client = useBungieClient();
  const { data: manifest } = useManifest();

  return {
    queryKey: ["DestinyInventoryItemDefinition", manifest?.version || "null"],
    queryFn: () =>
      getDestinyManifestComponent(client, {
        destinyManifest: manifest!,
        tableName: "DestinyInventoryItemDefinition",
        language: "en",
      }),
    enabled: manifest && typeof window !== "undefined",
  };
};

export const useInventoryItemDefinitions = () =>
  useQuery(useInventoryItemDefinitionsOptions());
