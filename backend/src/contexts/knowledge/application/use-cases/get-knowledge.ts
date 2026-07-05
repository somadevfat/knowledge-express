import type { Knowledge, KnowledgeId } from "../../domain/entities/knowledge.js";
import { NotFoundError } from "../errors/not-found-error.js";
import type { FetchKnowledgeSourcePort } from "../ports/fetch-knowledge-source-port.js";
import { listKnowledge } from "./list-knowledge.js";

/**
 * GitHub由来のナレッジ記事を1件取得する。
 *
 * @param source ナレッジソース取得Port。
 * @param id ナレッジ記事ID。
 * @returns 見つかったナレッジEntity。
 * @throws {NotFoundError} IDに一致する記事が存在しない場合。
 */
export async function getKnowledge(source: FetchKnowledgeSourcePort, id: KnowledgeId): Promise<Knowledge> {
  const knowledge = (await listKnowledge(source)).find((article) => article.toProps().id === id);
  if (knowledge === undefined) {
    throw new NotFoundError("Knowledge article was not found.");
  }
  return knowledge;
}

