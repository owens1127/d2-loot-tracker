import { initTRPC, TRPCError } from "@trpc/server";
import { cache } from "react";
import { getRefreshedServerSession } from "@/app/api/auth";
import { prisma } from "@/lib/prisma";
import SuperJSON from "superjson";
import { cookies, headers } from "next/headers";

export const createTRPCContext = cache(async () => {
  return {
    headers: headers(),
    cookies: cookies(),
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

export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;

export const baseProcedure = t.procedure.use(async ({ ctx, next }) => {
  const res = await next({ ctx });

  if (!res.ok) {
    try {
      const discordResponse = await fetch(process.env.DISCORD_WEBHOOK_URL!, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content:
            "```json\n" +
            JSON.stringify(
              {
                error: res.error,
                cause: res.error?.cause?.message,
                headers: Array.from(ctx.headers.keys()),
              },
              null,
              2
            ).substring(0, 1000) +
            "```",
        }),
      });

      if (discordResponse.ok) {
        throw new Error("Failed to send error to Discord", {
          cause: discordResponse,
        });
      }
    } catch (e) {
      console.error(e);
    }
  }

  return res;
});

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
  }
);
