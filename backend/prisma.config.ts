import "dotenv/config";
import { defineConfig } from "prisma/config";

const dbUrl = process.env["DATABASE_URL"] || "postgresql://postgres:postgres@localhost:5432/cleargig";

// Supabase: If DATABASE_URL uses transaction pooler port 6543, Prisma Migrate requires port 5432 (Session mode) for advisory locks
let directUrl = process.env["DIRECT_URL"];
if (!directUrl && dbUrl.includes(":6543")) {
  directUrl = dbUrl
    .replace(":6543", ":5432")
    .replace("?pgbouncer=true", "")
    .replace("&pgbouncer=true", "");
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: dbUrl,
    ...(directUrl ? { directUrl } : {}),
  },
});
