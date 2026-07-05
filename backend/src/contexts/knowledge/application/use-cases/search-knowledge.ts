import type { Knowledge } from "../../domain/entities/knowledge.js";
import type { FetchKnowledgeSourcePort } from "../ports/fetch-knowledge-source-port.js";
import { listKnowledge } from "./list-knowledge.js";

export type KnowledgeSearchQuery = {
  q?: string;
  tag?: string;
};

/**
 * GitHub由来のナレッジ記事をキーワードとタグで検索する。
 *
 * @param source ナレッジソース取得Port。
 * @param query 検索条件。
 * @returns 条件に一致したナレッジEntity一覧。
 */
export async function searchKnowledge(
  source: FetchKnowledgeSourcePort,
  query: KnowledgeSearchQuery
): Promise<Knowledge[]> {
  const keyword = query.q?.trim().toLowerCase();
  const tag = query.tag?.trim().toLowerCase();

  return (await listKnowledge(source)).filter((knowledge) => {
    const props = knowledge.toProps();
    const matchesKeyword =
      keyword === undefined ||
      [props.title, props.body, props.excerpt, props.category].some((value) => value.toLowerCase().includes(keyword));
    const matchesTag = tag === undefined || props.tags.includes(tag);

    return matchesKeyword && matchesTag;
  });
}

