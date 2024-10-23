import { useQuery } from "@tanstack/react-query";
import { useManifestSuspended } from "./manifest";
import { getDestinyManifestComponent } from "bungie-net-core/manifest";
import { useBungieClient } from "./client";

const usePlugSetDefinitionOptions = () => {
  const client = useBungieClient();
  const { data: manifest } = useManifestSuspended();

  return {
    queryKey: ["DestinyPlugSetDefinition", manifest.version],
    queryFn: () =>
      getDestinyManifestComponent(client, {
        destinyManifest: manifest,
        tableName: "DestinyPlugSetDefinition",
        language: "en",
      }),
  };
};

export const usePlugSetDefinitions = () =>
  useQuery(usePlugSetDefinitionOptions());
