import { z } from "zod";
import {
  authenticatedProcedure,
  baseProcedure,
  createTRPCRouter,
} from "./init";
import { perkCountsForActiveWeapons } from "@prisma/client/sql";
import traitsToEnhanced from "@/lib/bungie/trait-to-enhanced-trait.json";
import { WeaponRoll } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { TRPCError } from "@trpc/server";

const enhancedTraits = new Set(Object.values(traitsToEnhanced));

const zPerkCountsForActiveWeapons = z.array(
  z.discriminatedUnion("column", [
    z.object({
      weaponHash: z.string(),
      perk: z.coerce.number(),
      column: z.enum(["barrel", "magazine", "left_perk", "right_perk"]),
      count: z.bigint(),
    }),
    z.object({
      weaponHash: z.string(),
      perk: z.string(),
      column: z.literal("masterwork"),
      count: z.bigint(),
    }),
  ])
);

type PerkCount = {
  perk: string;
  count: number;
};

export const appRouter = createTRPCRouter({
  activeHashes: baseProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.activeHash.findMany();
  }),

  commonRolls: baseProcedure.query(async ({ ctx }) => {
    const rolls = await ctx.prisma.weaponRoll.groupBy({
      _count: {
        weaponHash: true,
      },
      where: {
        createdAt: {
          gt: new Date("2024-11-05T17:00:00.000Z"),
        },
        activeHash: {
          isNot: null,
        },
      },
      by: ["weaponHash", "leftTrait1", "rightTrait1"],
      orderBy: {
        _count: {
          weaponHash: "desc",
        },
      },
    });

    const reduced: {
      weaponHash: string;
      rolls: {
        leftPerk: string;
        rightPerk: string;
        count: number;
      }[];
    }[] = [];

    for (const row of rolls) {
      const existingWeapon = reduced.find(
        (w) => w.weaponHash === row.weaponHash
      );

      if (existingWeapon) {
        existingWeapon.rolls.push({
          leftPerk: row.leftTrait1,
          rightPerk: row.rightTrait1,
          count: row._count.weaponHash,
        });
      } else {
        reduced.push({
          weaponHash: row.weaponHash,
          rolls: [
            {
              leftPerk: row.leftTrait1,
              rightPerk: row.rightTrait1,
              count: row._count.weaponHash,
            },
          ],
        });
      }
    }

    return reduced;
  }),

  perkStats: baseProcedure.query(async ({ ctx }) => {
    const results = await ctx.prisma
      .$queryRawTyped(perkCountsForActiveWeapons())
      .then((r) =>
        zPerkCountsForActiveWeapons
          .parse(r)
          .filter(
            (row) =>
              row.column === "masterwork" || !enhancedTraits.has(row.perk)
          )
      );

    const reduced: {
      weaponHash: string;
      barrel: PerkCount[];
      magazine: PerkCount[];
      left_perk: PerkCount[];
      right_perk: PerkCount[];
      masterwork: PerkCount[];
    }[] = [];

    for (const row of results) {
      const existingWeapon = reduced.find(
        (w) => w.weaponHash === row.weaponHash
      );

      if (existingWeapon) {
        existingWeapon[row.column].push({
          perk: String(row.perk),
          count: Number(row.count),
        });
      } else {
        reduced.push({
          weaponHash: row.weaponHash,
          barrel: [],
          magazine: [],
          left_perk: [],
          right_perk: [],
          masterwork: [],
          [row.column]: [
            {
              perk: row.perk,
              count: Number(row.count),
            },
          ],
        });
      }
    }

    return reduced.map((weapon) => ({
      weaponHash: Number(weapon.weaponHash),
      barrels: {
        total: weapon.barrel.reduce((acc, curr) => acc + curr.count, 0),
        data: weapon.barrel.sort((a, b) => b.count - a.count),
      },
      magazines: {
        total: weapon.magazine.reduce((acc, curr) => acc + curr.count, 0),
        data: weapon.magazine.sort((a, b) => b.count - a.count),
      },
      leftTraits: {
        total: weapon.left_perk.reduce((acc, curr) => acc + curr.count, 0),
        data: weapon.left_perk.sort((a, b) => b.count - a.count),
      },
      rightTraits: {
        total: weapon.right_perk.reduce((acc, curr) => acc + curr.count, 0),
        data: weapon.right_perk.sort((a, b) => b.count - a.count),
      },
      masterworks: {
        total: weapon.masterwork.reduce((acc, curr) => acc + curr.count, 0),
        data: weapon.masterwork.sort((a, b) => b.count - a.count),
      },
    }));
  }),

  addRolls: authenticatedProcedure
    .input(
      z.object({
        destinyMembershipId: z.string(),
        items: z.array(
          z.object({
            itemHash: z.union([z.string(), z.number()]).transform(String),
            itemInstanceId: z.string(),
            barrels: z
              .tuple([
                z.union([z.string(), z.number()]).transform(String),
                z.union([z.string(), z.number()]).transform(String),
              ])
              .rest(z.union([z.string(), z.number()]).transform(String)),
            magazines: z
              .tuple([
                z.union([z.string(), z.number()]).transform(String),
                z.union([z.string(), z.number()]).transform(String),
              ])
              .rest(z.union([z.string(), z.number()]).transform(String)),
            leftPerks: z
              .tuple([z.union([z.string(), z.number()]).transform(String)])
              .rest(z.union([z.string(), z.number()]).transform(String)),
            rightPerks: z
              .tuple([z.union([z.string(), z.number()]).transform(String)])
              .rest(z.union([z.string(), z.number()]).transform(String)),
            masterwork: z.string().optional(),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Prisma does not support avoiding duplicates on insertMany
      const result = await Promise.allSettled(
        input.items.map((item) =>
          ctx.prisma.weaponRoll.create({
            data: {
              destinyMembershipId: input.destinyMembershipId,
              itemInstanceId: item.itemInstanceId,
              weaponHash: item.itemHash,
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
              masterwork: item.masterwork,
            },
          })
        )
      );

      const errs = result
        .filter((r): r is PromiseRejectedResult => r.status === "rejected")
        .filter(
          (r) =>
            !(r.reason instanceof PrismaClientKnownRequestError) ||
            !r.reason.message.includes(
              "UNIQUE constraint failed: weapon_rolls.item_instance_id"
            )
        );

      if (errs.length) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to insert some items",
          cause: errs.map((e) => e.reason),
        });
      }

      return result
        .filter(
          (r): r is PromiseFulfilledResult<WeaponRoll> =>
            r.status === "fulfilled"
        )
        .map((r) => r.value);
    }),

  myRecentRolls: authenticatedProcedure
    .input(
      z.object({
        destinyMembershipId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      return await ctx.prisma.weaponRoll.findMany({
        where: { destinyMembershipId: input.destinyMembershipId },
        orderBy: { createdAt: "desc" },
        take: 15,
      });
    }),

  topPlayers: baseProcedure.query(async ({ ctx }) => {
    const data = await ctx.prisma.weaponRoll.groupBy({
      by: "destinyMembershipId",
      _count: {
        itemInstanceId: true,
      },
      take: 200,
      orderBy: {
        _count: {
          itemInstanceId: "desc",
        },
      },
    });

    const basePosition = 1;
    let rank = 0;
    let prevScore = -1;
    return data.map((row, idx) => {
      const position = idx + basePosition;
      if (row._count.itemInstanceId !== prevScore) {
        prevScore = row._count.itemInstanceId;
        rank = position;
      }
      return {
        position,
        rank,
        destinyMembershipId: row.destinyMembershipId,
        count: row._count.itemInstanceId,
      };
    });
  }),

  allRecentRolls: baseProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.weaponRoll.findMany({
      orderBy: { createdAt: "desc" },
      take: 48,
    });
  }),
});
// export type definition of API
export type AppRouter = typeof appRouter;
