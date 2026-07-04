import type { Knowledge, KnowledgeId, UpdateKnowledgeParams } from "../../domain/entities/knowledge.js";
import { NotFoundError } from "../errors/not-found-error.js";
import type { FindKnowledgeByIdPort } from "../ports/find-knowledge-by-id-port.js";
import type { SaveKnowledgePort } from "../ports/save-knowledge-port.js";

export type UpdateKnowledgeInput = UpdateKnowledgeParams;

/**
 * ナレッジ記事を更新する。
 *
 * @param repository ナレッジ永続化のPort。
 * @param id ナレッジ記事ID。
 * @param input ユースケースの入力値。
 * @returns 更新後のナレッジEntity。
 * @throws {NotFoundError} 更新対象が存在しない場合。
 */
export async function updateKnowledge(
  repository: FindKnowledgeByIdPort & SaveKnowledgePort,
  id: KnowledgeId,
  input: UpdateKnowledgeInput
): Promise<Knowledge> {
  const current = await repository.findById(id);
  if (current === null) {
    throw new NotFoundError("Knowledge article was not found.");
  }

  return repository.save(current.update(input));
}
