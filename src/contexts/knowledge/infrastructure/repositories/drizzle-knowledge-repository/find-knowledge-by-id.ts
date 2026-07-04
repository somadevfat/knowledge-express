import { eq } from "drizzle-orm";
import { knowledgeArticles } from "../../database/schema.js";
import { toKnowledgeEntity } from "./knowledge-row-mapper.js";
import type { KnowledgeDatabase } from "./types.js";

/**
 * IDでナレッジ記事を1件取得する。
 *
 * @param db Drizzleのデータベースクライアント。
 * @param id ナレッジ記事ID。
 * @returns 見つかったEntity。存在しない場合はnull。
 */
export async function findKnowledgeById(db: KnowledgeDatabase, id: string) {
  const [row] = await db.select().from(knowledgeArticles).where(eq(knowledgeArticles.id, id)).limit(1);
  return row === undefined ? null : toKnowledgeEntity(row);
}
