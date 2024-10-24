"use client";

import { getDestinyManifest } from "bungie-net-core/endpoints/Destiny2";
import { useBungieClient } from "./client";
import { useQuery } from "@tanstack/react-query";

export const useManifest = () => {
  const client = useBungieClient();

  return useQuery({
    queryKey: ["getDestinyManifest"],
    queryFn: () =>
      getDestinyManifest(client).then((response) => response.Response),
    refetchInterval: 1000 * 60 * 30,
  });
};
