import { Knowledge } from "../../domain/entities/knowledge.js";
import type { SaveKnowledgePort } from "../ports/save-knowledge-port.js";

export type CreateKnowledgeInput = {
  title: string;
  body: string;
  tags?: string[];
};

/**
 * ナレッジ記事を作成する。
 *
 * @param repository ナレッジ永続化のPort。
 * @param input ユースケースの入力値。
 * @returns 作成されたナレッジEntity。
 */
export async function createKnowledge(
  repository: SaveKnowledgePort,
  input: CreateKnowledgeInput
): Promise<Knowledge> {
  const knowledge = Knowledge.create(input);
  return repository.save(knowledge);
}
