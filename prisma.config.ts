import { config } from "dotenv";
import { defineConfig } from "prisma/config";

// Load .env.local for Prisma CLI (Next.js loads it automatically at runtime)
config({ path: ".env.local" });

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL!,
  },
});
