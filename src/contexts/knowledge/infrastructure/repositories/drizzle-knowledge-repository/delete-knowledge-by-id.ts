import { eq } from "drizzle-orm";
import { knowledgeArticles } from "../../database/schema.js";
import type { KnowledgeDatabase } from "./types.js";

/**
 * ナレッジ記事を1件削除する。
 *
 * @param db Drizzleのデータベースクライアント。
 * @param id ナレッジ記事ID。
 * @returns 削除できた場合はtrue。
 */
export async function deleteKnowledgeById(db: KnowledgeDatabase, id: string): Promise<boolean> {
  const deletedRows = await db.delete(knowledgeArticles).where(eq(knowledgeArticles.id, id)).returning({
    id: knowledgeArticles.id
  });

  return deletedRows.length > 0;
}
