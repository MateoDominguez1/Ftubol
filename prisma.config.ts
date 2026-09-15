import "dotenv/config";
import { defineConfig, env } from "prisma/config";

// El runtime de la app (src/lib/prisma.ts) usa DATABASE_URL (conexión con pooling)
// a través del driver adapter. El CLI de Prisma (migrate/introspect) usa acá la
// conexión directa (DIRECT_URL), ya que el pooler de Supabase no soporta migraciones.
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: env("DIRECT_URL"),
  },
});
