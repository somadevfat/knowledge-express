import { integer, sqliteTable } from "drizzle-orm/sqlite-core";

/**
 * サイト全体のアクセス数（Cloudflare D1）。常に`id = 1`の単一行のみ持つ。
 *
 * スキーマ変更時はDrizzle Kitでマイグレーションを生成し、
 * `wrangler d1 migrations apply se-wiki-views --local/--remote`で適用する。
 */
export const siteViews = sqliteTable("site_views", {
  id: integer("id").primaryKey(),
  viewCount: integer("view_count").notNull().default(0),
});
