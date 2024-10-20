import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { createTRPCContext } from "@/app/trpc/init";
import { appRouter } from "@/app/trpc/router";

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: createTRPCContext,
  });
export { handler as GET, handler as POST };
