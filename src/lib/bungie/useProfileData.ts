import { useSuspenseQuery } from "@tanstack/react-query";
import { getProfile } from "bungie-net-core/endpoints/Destiny2";
import { BungieMembershipType } from "bungie-net-core/models";
import { useBungieClient } from "./client";

export const useProfileItems = (
  params: {
    destinyMembershipId: string;
    membershipType: BungieMembershipType;
  },
  opts: {
    isEnabled: boolean;
  }
) => {
  const client = useBungieClient();

  return useSuspenseQuery({
    queryKey: ["getProfile", params],
    refetchOnWindowFocus: true,
    refetchIntervalInBackground: opts.isEnabled,
    refetchInterval: ({ state }) => {
      if (!opts.isEnabled) return false;
      if (!state.data?.responseMintedTimestamp) return 60_000;

      const responseMintedTimestamp = new Date(
        state.data.responseMintedTimestamp
      );

      return Math.max(
        30_000,
        responseMintedTimestamp.getTime() + 60_000 - Date.now()
      );
    },
    queryFn: () =>
      getProfile(client, {
        ...params,
        components: [102, 201, 205, 310, 305],
      }).then((response) => response.Response),
  });
};
