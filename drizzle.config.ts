import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/contexts/knowledge/infrastructure/database/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "postgres://postgres:postgres@localhost:5433/knowledge_app"
  }
});
