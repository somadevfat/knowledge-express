import { Knowledge } from "../../../domain/entities/knowledge.js";
import type { KnowledgeRow } from "./types.js";

/**
 * DB rowをDomain Entityへ変換する。
 *
 * @param row Drizzleから取得したナレッジ記事row。
 * @returns 復元されたナレッジEntity。
 */
export function toKnowledgeEntity(row: KnowledgeRow): Knowledge {
  return Knowledge.reconstruct({
    id: row.id,
    title: row.title,
    body: row.body,
    tags: row.tags,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt
  });
}
