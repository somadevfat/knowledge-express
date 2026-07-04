import type { Knowledge, KnowledgeId } from "../../domain/entities/knowledge.js";

/**
 * IDでナレッジ記事を取得するためのPort。
 */
export interface FindKnowledgeByIdPort {
  /**
   * IDでナレッジ記事を1件取得する。
   *
   * @param id ナレッジ記事ID。
   * @returns 見つかったEntity。存在しない場合はnull。
   */
  findById(id: KnowledgeId): Promise<Knowledge | null>;
}
