import "server-only";

import { PrismaClient } from "@prisma/client";
import { PrismaLibSQL } from "@prisma/adapter-libsql";
import { createClient } from "@libsql/client";

const prismaClientSingleton = () => {
  return new PrismaClient({
    adapter: !process.env.VERCEL_ENV
      ? new PrismaLibSQL(
          createClient({
            url: `${process.env.TURSO_DATABASE_URL}`,
            authToken: `${process.env.TURSO_AUTH_TOKEN}`,
          })
        )
      : null,
  });
};

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

export const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") globalThis.prismaGlobal = prisma;
