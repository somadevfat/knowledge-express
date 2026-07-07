import { defineConfig } from "drizzle-kit";

/**
 * Drizzle Kit設定。スキーマの型生成・マイグレーションSQL生成に使う。
 *
 * 実際の適用（`wrangler d1 migrations apply se-wiki-views --local/--remote`）は
 * Wrangler側で行う。`drizzle-kit generate`で`./migrations`にSQLを追加してから、
 * Wranglerで適用する運用。
 */
export default defineConfig({
  dialect: "sqlite",
  driver: "d1-http",
  schema: "./src/features/knowledge/server/db/schema.ts",
  out: "./migrations",
  dbCredentials: {
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID ?? "",
    databaseId: process.env.CLOUDFLARE_DATABASE_ID ?? "",
    token: process.env.CLOUDFLARE_D1_TOKEN ?? "",
  },
});
