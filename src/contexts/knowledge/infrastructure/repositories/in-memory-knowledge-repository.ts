import type { DeleteKnowledgePort } from "../../application/ports/delete-knowledge-port.js";
import type { FindKnowledgeByIdPort } from "../../application/ports/find-knowledge-by-id-port.js";
import type { SaveKnowledgePort } from "../../application/ports/save-knowledge-port.js";
import type { KnowledgeSearchQuery, SearchKnowledgePort } from "../../application/ports/search-knowledge-port.js";
import type { Knowledge, KnowledgeId } from "../../domain/entities/knowledge.js";

/**
 * ユースケーステストやデモで使うインメモリRepository実装。
 */
export class InMemoryKnowledgeRepository
  implements SaveKnowledgePort, FindKnowledgeByIdPort, SearchKnowledgePort, DeleteKnowledgePort
{
  private readonly store = new Map<KnowledgeId, Knowledge>();

  /**
   * ナレッジEntityをメモリ上に保存する。
   *
   * @param knowledge 保存するナレッジEntity。
   * @returns 保存後のナレッジEntity。
   */
  async save(knowledge: Knowledge): Promise<Knowledge> {
    this.store.set(knowledge.toProps().id, knowledge);
    return knowledge;
  }

  /**
   * IDでナレッジ記事を1件取得する。
   *
   * @param id ナレッジ記事ID。
   * @returns 見つかったEntity。存在しない場合はnull。
   */
  async findById(id: KnowledgeId): Promise<Knowledge | null> {
    return this.store.get(id) ?? null;
  }

  /**
   * ナレッジ記事を検索する。
   *
   * @param query 任意のキーワード条件とタグ条件。
   * @returns 更新日時の降順で並んだ検索結果。
   */
  async search(query: KnowledgeSearchQuery): Promise<Knowledge[]> {
    const q = query.q?.toLowerCase();
    const tag = query.tag?.toLowerCase();

    return [...this.store.values()]
      .filter((knowledge) => {
        const props = knowledge.toProps();
        const matchesKeyword =
          q === undefined || props.title.toLowerCase().includes(q) || props.body.toLowerCase().includes(q);
        const matchesTag = tag === undefined || props.tags.includes(tag);

        return matchesKeyword && matchesTag;
      })
      .sort((a, b) => b.toProps().updatedAt.getTime() - a.toProps().updatedAt.getTime());
  }

  /**
   * ナレッジ記事を1件削除する。
   *
   * @param id ナレッジ記事ID。
   * @returns 削除できた場合はtrue。
   */
  async deleteById(id: KnowledgeId): Promise<boolean> {
    return this.store.delete(id);
  }
}
