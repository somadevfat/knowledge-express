import type { Knowledge } from "../../domain/entities/knowledge.js";
import type { KnowledgeSearchQuery, SearchKnowledgePort } from "../ports/search-knowledge-port.js";

/**
 * ナレッジ記事を検索する。
 *
 * @param repository ナレッジ永続化のPort。
 * @param query 任意のキーワード条件とタグ条件。
 * @returns 条件に一致したナレッジEntity一覧。
 */
export async function searchKnowledge(
  repository: SearchKnowledgePort,
  query: KnowledgeSearchQuery
): Promise<Knowledge[]> {
  return repository.search(query);
}
