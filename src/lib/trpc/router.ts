import { z } from "zod";
import {
  authenticatedProcedure,
  baseProcedure,
  createTRPCRouter,
} from "./init";
import { perkCountsForActiveWeapons } from "@prisma/client/sql";

const zPerkCountsForActiveWeapons = z.array(
  z.object({
    weaponHash: z.string(),
    perk: z.string(),
    column: z.enum([
      "barrel",
      "magazine",
      "left_perk",
      "right_perk",
      "masterwork",
    ]),
    count: z.bigint(),
  })
);

type PerkCount = {
  perk: string;
  count: number;
};

export const appRouter = createTRPCRouter({
  activeHashes: baseProcedure.query(({ ctx }) =>
    ctx.prisma.activeHash.findMany()
  ),

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
      .then((r) => zPerkCountsForActiveWeapons.parse(r));

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
          perk: row.perk,
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
        unique: weapon.barrel.length,
        data: weapon.barrel.sort((a, b) => b.count - a.count),
      },
      magazines: {
        total: weapon.magazine.reduce((acc, curr) => acc + curr.count, 0),
        unique: weapon.magazine.length,
        data: weapon.magazine.sort((a, b) => b.count - a.count),
      },
      leftTraits: {
        total: weapon.left_perk.reduce((acc, curr) => acc + curr.count, 0),
        unique: weapon.left_perk.length,
        data: weapon.left_perk.sort((a, b) => b.count - a.count),
      },
      rightTraits: {
        total: weapon.right_perk.reduce((acc, curr) => acc + curr.count, 0),
        unique: weapon.right_perk.length,
        data: weapon.right_perk.sort((a, b) => b.count - a.count),
      },
      masterworks: {
        total: weapon.masterwork.reduce((acc, curr) => acc + curr.count, 0),
        unique: weapon.masterwork.length,
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
      })
    ),

  recentRolls: authenticatedProcedure
    .input(
      z.object({
        destinyMembershipId: z.string(),
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
