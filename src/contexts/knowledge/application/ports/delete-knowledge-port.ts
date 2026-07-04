import type { KnowledgeId } from "../../domain/entities/knowledge.js";

/**
 * ナレッジ記事を削除するためのPort。
 */
export interface DeleteKnowledgePort {
  /**
   * ナレッジ記事を1件削除する。
   *
   * @param id ナレッジ記事ID。
   * @returns 削除できた場合はtrue。
   */
  deleteById(id: KnowledgeId): Promise<boolean>;
}
