import type { Knowledge, KnowledgeId } from "../../domain/entities/knowledge.js";
import { NotFoundError } from "../errors/not-found-error.js";
import type { FindKnowledgeByIdPort } from "../ports/find-knowledge-by-id-port.js";

/**
 * ナレッジ記事を1件取得する。
 *
 * @param repository ナレッジ永続化のPort。
 * @param id ナレッジ記事ID。
 * @returns 見つかったナレッジEntity。
 * @throws {NotFoundError} 対象が存在しない場合。
 */
export async function getKnowledge(repository: FindKnowledgeByIdPort, id: KnowledgeId): Promise<Knowledge> {
  const knowledge = await repository.findById(id);
  if (knowledge === null) {
    throw new NotFoundError("Knowledge article was not found.");
  }
  return knowledge;
}
