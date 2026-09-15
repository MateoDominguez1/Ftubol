import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

declare global {
  var prismaGlobal: PrismaClient | undefined;
}

function createPrismaClient() {
  // max bajo: la base local de desarrollo (`prisma dev`) tolera pocas conexiones
  // concurrentes; en producción (Supabase/Neon) DATABASE_URL ya pasa por un pooler.
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
    max: 8,
  });
  return new PrismaClient({ adapter });
}

export const prisma = globalThis.prismaGlobal ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.prismaGlobal = prisma;
}
