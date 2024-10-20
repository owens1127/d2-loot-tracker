import { useSuspenseQuery } from "@tanstack/react-query";
import { getMembershipDataForCurrentUser } from "bungie-net-core/endpoints/User";
import { useAuthorizedBungieSession } from "next-bungie-auth/client";
import { useBungieClient } from "./client";

export const useMembershipDataForCurrentUser = () => {
  const session = useAuthorizedBungieSession();
  const client = useBungieClient();

  return useSuspenseQuery({
    queryKey: [
      "getMembershipDataForCurrentUser",
      session.data.bungieMembershipId,
    ],
    queryFn: () =>
      getMembershipDataForCurrentUser(client).then(
        (response) => response.Response
      ),
  });
};
