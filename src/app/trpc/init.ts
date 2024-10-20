import { initTRPC, TRPCError } from "@trpc/server";
import { cache } from "react";
import { getRefreshedServerSession } from "../api/auth";
import { prisma } from "../prisma";
import SuperJSON from "superjson";

export const createTRPCContext = cache(async () => {
  return {
    prisma: prisma,
  };
});

// Avoid exporting the entire t-object
// since it's not very descriptive.
// For instance, the use of a t variable
// is common in i18n libraries.
const t = initTRPC
  .context<Awaited<ReturnType<typeof createTRPCContext>>>()
  .create({
    /**
     * @see https://trpc.io/docs/server/data-transformers
     */
    transformer: SuperJSON,
  });
// Base router and procedure helpers
export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure;

export const authenticatedProcedure = baseProcedure.use(
  async ({ ctx, next }) => {
    const sessionResponse = await getRefreshedServerSession({ force: false });

    switch (sessionResponse.session.status) {
      case "authorized":
      case "stale":
      case "disabled":
        return next({
          ctx: {
            ...ctx,
            session: sessionResponse.session.data,
          },
        });
      default:
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: sessionResponse.message,
        });
    }
  },
);
