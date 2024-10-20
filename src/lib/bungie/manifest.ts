"use client";

import { getDestinyManifest } from "bungie-net-core/endpoints/Destiny2";
import { useBungieClient } from "./client";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";

export const useManifest = () => {
  const client = useBungieClient();

  return useQuery({
    queryKey: ["getDestinyManifest"],
    queryFn: () =>
      getDestinyManifest(client).then((response) => response.Response),
  });
};

export const useManifestSuspended = () => {
  const client = useBungieClient();

  return useSuspenseQuery({
    queryKey: ["getDestinyManifest"],
    queryFn: () =>
      getDestinyManifest(client).then((response) => response.Response),
  });
};
