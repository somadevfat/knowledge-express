import type { Knowledge } from "../../domain/entities/knowledge.js";

export type KnowledgeSearchQuery = {
  q?: string;
  tag?: string;
};

/**
 * ナレッジ記事を検索するためのPort。
 */
export interface SearchKnowledgePort {
  /**
   * ナレッジ記事を検索する。
   *
   * @param query 任意のキーワード条件とタグ条件。
   * @returns 更新日時の降順で並んだ検索結果。
   */
  search(query: KnowledgeSearchQuery): Promise<Knowledge[]>;
}
