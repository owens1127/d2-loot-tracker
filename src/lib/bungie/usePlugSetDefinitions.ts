import { useQuery } from "@tanstack/react-query";
import { getDestinyManifestComponent } from "bungie-net-core/manifest";
import { useBungieClient } from "./client";
import { useManifest } from "./manifest";

export const usePlugSetDefinitions = () => {
  const client = useBungieClient();
  const { data: manifest } = useManifest();

  return useQuery({
    queryKey: ["DestinyPlugSetDefinition", manifest?.version ?? "null"],
    queryFn: () =>
      getDestinyManifestComponent(client, {
        destinyManifest: manifest!,
        tableName: "DestinyPlugSetDefinition",
        language: "en",
      }),
    enabled: manifest && typeof window !== "undefined",
  });
};
