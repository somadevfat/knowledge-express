import { and, arrayContains, desc, ilike, or } from "drizzle-orm";
import type { KnowledgeSearchQuery } from "../../../application/ports/search-knowledge-port.js";
import { knowledgeArticles } from "../../database/schema.js";
import { toKnowledgeEntity } from "./knowledge-row-mapper.js";
import type { KnowledgeDatabase } from "./types.js";

/**
 * ナレッジ記事を検索する。
 *
 * @param db Drizzleのデータベースクライアント。
 * @param query 任意のキーワード条件とタグ条件。
 * @returns 更新日時の降順で並んだ検索結果。
 */
export async function searchKnowledgeRows(db: KnowledgeDatabase, query: KnowledgeSearchQuery) {
  const filters = [];

  if (query.q !== undefined) {
    const keyword = `%${query.q}%`;
    filters.push(or(ilike(knowledgeArticles.title, keyword), ilike(knowledgeArticles.body, keyword)));
  }

  if (query.tag !== undefined) {
    filters.push(arrayContains(knowledgeArticles.tags, [query.tag.toLowerCase()]));
  }

  const where = filters.length === 0 ? undefined : and(...filters);
  const rows = await db.select().from(knowledgeArticles).where(where).orderBy(desc(knowledgeArticles.updatedAt));

  return rows.map(toKnowledgeEntity);
}
