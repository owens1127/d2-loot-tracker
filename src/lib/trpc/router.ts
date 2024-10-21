import { z } from "zod";
import {
  authenticatedProcedure,
  baseProcedure,
  createTRPCRouter,
} from "./init";
export const appRouter = createTRPCRouter({
  activeHashes: baseProcedure.query(({ ctx }) =>
    ctx.prisma.activeHashes.findMany()
  ),
  addRolls: authenticatedProcedure
    .input(
      z.object({
        destinyMembershipId: z.string().pipe(z.coerce.bigint()),
        items: z.array(
          z.object({
            itemHash: z.number(),
            itemInstanceId: z.string(),
            barrels: z.array(z.number()),
            magazines: z.array(z.number()),
            leftPerks: z.array(z.number()),
            rightPerks: z.array(z.number()),
            masterwork: z.string().optional(),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) =>
      ctx.prisma.weaponRoll.createManyAndReturn({
        data: input.items.map((item) => ({
          weaponHash: item.itemHash,
          destinyMembershipId: input.destinyMembershipId,
          itemInstanceId: item.itemInstanceId,
          masterwork: item.masterwork,
          barrel1: item.barrels[0],
          barrel2: item.barrels[1],
          magazine1: item.magazines[0],
          magazine2: item.magazines[1],
          leftTrait1: item.leftPerks[0],
          leftTrait2: item.leftPerks[1],
          leftTrait3: item.leftPerks[2],
          rightTrait1: item.rightPerks[0],
          rightTrait2: item.rightPerks[1],
          rightTrait3: item.rightPerks[2],
        })),
        skipDuplicates: true,
      })
    ),

  recentRolls: authenticatedProcedure
    .input(
      z.object({
        destinyMembershipId: z.string().pipe(z.coerce.bigint()),
      })
    )
    .query(({ ctx, input }) =>
      ctx.prisma.weaponRoll.findMany({
        where: { destinyMembershipId: input.destinyMembershipId },
        orderBy: { createdAt: "desc" },
        take: 15,
      })
    ),
});
// export type definition of API
export type AppRouter = typeof appRouter;
