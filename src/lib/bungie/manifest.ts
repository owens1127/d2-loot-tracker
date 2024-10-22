"use client";

import { getDestinyManifest } from "bungie-net-core/endpoints/Destiny2";
import { useBungieClient } from "./client";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";

const useManifestOpts = () => {
  const client = useBungieClient();

  return {
    queryKey: ["getDestinyManifest"],
    queryFn: () =>
      getDestinyManifest(client).then((response) => response.Response),
    staleTime: Infinity,
    refetchInterval: 60 * 60_000,
  } as const;
};

export const useManifest = () => useQuery(useManifestOpts());

export const useManifestSuspended = () => useSuspenseQuery(useManifestOpts());
