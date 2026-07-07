import "server-only";
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { siteViews } from "./db/schema";

const SITE_VIEWS_ROW_ID = 1;

/**
 * `cloudflare:workers`経由でD1バインディングを取得する。
 *
 * vinext(Cloudflare Workers)以外のランタイム（プレーンな`next dev`/`next build`など）では
 * `cloudflare:workers`モジュール自体が存在しないため、失敗した場合はundefinedを返す
 * （アクセス数機能を静かに無効化する）。
 */
export async function getViewsDatabaseBinding(): Promise<D1Database | undefined> {
  try {
    const { env } = await import("cloudflare:workers");
    return (env as { VIEWS_DB?: D1Database }).VIEWS_DB;
  } catch {
    return undefined;
  }
}

/**
 * サイト全体のアクセス数を1増やし、更新後の値を返す（`site_views`テーブルへupsert）。
 *
 * @param db D1データベース接続。
 * @returns 更新後のアクセス数。
 */
export async function recordSiteView(db: D1Database): Promise<number> {
  const client = drizzle(db, { schema: { siteViews } });

  const [row] = await client
    .insert(siteViews)
    .values({ id: SITE_VIEWS_ROW_ID, viewCount: 1 })
    .onConflictDoUpdate({
      target: siteViews.id,
      set: { viewCount: sql`${siteViews.viewCount} + 1` },
    })
    .returning({ viewCount: siteViews.viewCount });

  return row.viewCount;
}
