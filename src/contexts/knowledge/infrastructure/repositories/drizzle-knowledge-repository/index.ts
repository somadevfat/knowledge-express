import type { DeleteKnowledgePort } from "../../../application/ports/delete-knowledge-port.js";
import type { FindKnowledgeByIdPort } from "../../../application/ports/find-knowledge-by-id-port.js";
import type { SaveKnowledgePort } from "../../../application/ports/save-knowledge-port.js";
import type { KnowledgeSearchQuery, SearchKnowledgePort } from "../../../application/ports/search-knowledge-port.js";
import type { Knowledge, KnowledgeId } from "../../../domain/entities/knowledge.js";
import { deleteKnowledgeById } from "./delete-knowledge-by-id.js";
import { findKnowledgeById } from "./find-knowledge-by-id.js";
import { saveKnowledge } from "./save-knowledge.js";
import { searchKnowledgeRows } from "./search-knowledge.js";
import type { KnowledgeDatabase } from "./types.js";

/**
 * PostgreSQLとDrizzleを使ったナレッジRepository実装。
 *
 * 個別のDB操作は操作別ファイルに分け、このクラスはPort実装の合成役に集中する。
 */
export class DrizzleKnowledgeRepository
  implements SaveKnowledgePort, FindKnowledgeByIdPort, SearchKnowledgePort, DeleteKnowledgePort
{
  /**
   * @param db Drizzleのデータベースクライアント。
   */
  constructor(private readonly db: KnowledgeDatabase) {}

  /**
   * ナレッジEntityを保存する。
   *
   * @param knowledge 保存するナレッジEntity。
   * @returns 保存後のナレッジEntity。
   */
  async save(knowledge: Knowledge): Promise<Knowledge> {
    return saveKnowledge(this.db, knowledge);
  }

  /**
   * IDでナレッジ記事を1件取得する。
   *
   * @param id ナレッジ記事ID。
   * @returns 見つかったEntity。存在しない場合はnull。
   */
  async findById(id: KnowledgeId): Promise<Knowledge | null> {
    return findKnowledgeById(this.db, id);
  }

  /**
   * ナレッジ記事を検索する。
   *
   * @param query 任意のキーワード条件とタグ条件。
   * @returns 更新日時の降順で並んだ検索結果。
   */
  async search(query: KnowledgeSearchQuery): Promise<Knowledge[]> {
    return searchKnowledgeRows(this.db, query);
  }

  /**
   * ナレッジ記事を1件削除する。
   *
   * @param id ナレッジ記事ID。
   * @returns 削除できた場合はtrue。
   */
  async deleteById(id: KnowledgeId): Promise<boolean> {
    return deleteKnowledgeById(this.db, id);
  }
}
