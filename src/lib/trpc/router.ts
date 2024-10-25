import { z } from "zod";
import {
  authenticatedProcedure,
  baseProcedure,
  createTRPCRouter,
} from "./init";
import { perkCountsForActiveWeapons, insertRoll } from "@prisma/client/sql";
import traitsToEnhanced from "@/lib/bungie/trait-to-enhanced-trait.json";

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
      const result = await ctx.prisma.$transaction(
        input.items.map((item) =>
          ctx.prisma.$queryRawTyped(
            insertRoll(
              item.itemHash,
              input.destinyMembershipId,
              item.itemInstanceId,
              item.barrels[0],
              item.barrels[1],
              item.magazines[0],
              item.magazines[1],
              item.leftPerks[0],
              item.leftPerks[1],
              item.leftPerks[2],
              item.rightPerks[0],
              item.rightPerks[1],
              item.rightPerks[2],
              item.masterwork
            )
          )
        )
      );

      return result.flat().map((r) => ({
        itemInstanceId: r.item_instance_id,
        destinyMembershipId: r.destiny_membership_id,
        weaponHash: r.weapon_hash,
        barrel1: r.barrel_1,
        barrel2: r.barrel_2,
        magazine1: r.magazine_1,
        magazine2: r.magazine_2,
        leftTrait1: r.left_trait_1,
        leftTrait2: r.left_trait_2,
        leftTrait3: r.left_trait_3,
        rightTrait1: r.right_trait_1,
        rightTrait2: r.right_trait_2,
        rightTrait3: r.right_trait_3,
        masterwork: r.masterwork,
        createdAt: r.created_at,
      }));
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
