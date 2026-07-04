import type { KnowledgeId } from "../../domain/entities/knowledge.js";
import { NotFoundError } from "../errors/not-found-error.js";
import type { DeleteKnowledgePort } from "../ports/delete-knowledge-port.js";

/**
 * ナレッジ記事を削除する。
 *
 * @param repository ナレッジ永続化のPort。
 * @param id ナレッジ記事ID。
 * @returns 戻り値はない。
 * @throws {NotFoundError} 削除対象が存在しない場合。
 */
export async function deleteKnowledge(repository: DeleteKnowledgePort, id: KnowledgeId): Promise<void> {
  const deleted = await repository.deleteById(id);
  if (!deleted) {
    throw new NotFoundError("Knowledge article was not found.");
  }
}
