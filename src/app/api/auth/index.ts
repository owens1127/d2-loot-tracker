// /app/api/auth/index.ts
import "server-only"; // this is an optional npm package which prevents your from accidentally importing server code on the client (npm install server-only)
import { createNextBungieAuth } from "next-bungie-auth/server";

export const {
  handlers: { authorizeGET, deauthorizePOST, callbackGET, sessionGET },
  serverSideHelpers: { getServerSession, getRefreshedServerSession },
} = createNextBungieAuth({
  clientId: process.env.BUNGIE_CLIENT_ID!,
  clientSecret: process.env.BUNGIE_CLIENT_SECRET!,
  sessionRefreshGracePeriod: 600,
  generateState: () => crypto.randomUUID(),
});
