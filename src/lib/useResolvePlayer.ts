"use client";

import { useQuery } from "@tanstack/react-query";
import { BungieMembershipType } from "bungie-net-core/models";

export const useResolvePlayer = (destinyMembershipId: string) =>
  useQuery({
    queryKey: ["raidhub-profile", destinyMembershipId],
    queryFn: () =>
      fetch(`https://api.raidhub.io/player/${destinyMembershipId}/basic`, {
        headers: {
          "x-api-key": process.env.RH_API_KEY!,
        },
      }).then(async (res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch profile", {
            cause: res,
          });
        } else if (
          !res.headers.get("content-type")?.includes("application/json")
        ) {
          throw new Error("Invalid response type", {
            cause: res,
          });
        }
        const json = await res.json();
        return json.response as {
          membershipId: string;
          membershipType: BungieMembershipType;
          iconPath: string;
          displayName: string;
          bungieGlobalDisplayName: string;
          bungieGlobalDisplayNameCode: string;
          lastSeen: string;
          isPrivate: boolean;
        };
      }),
  });
