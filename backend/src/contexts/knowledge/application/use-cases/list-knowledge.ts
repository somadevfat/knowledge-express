import { Knowledge } from "../../domain/entities/knowledge.js";
import type { FetchKnowledgeSourcePort } from "../ports/fetch-knowledge-source-port.js";

/**
 * GitHub由来のナレッジ記事を一覧取得する。
 *
 * @param source ナレッジソース取得Port。
 * @returns 表示順に並べたナレッジ記事一覧。
 */
export async function listKnowledge(source: FetchKnowledgeSourcePort): Promise<Knowledge[]> {
  const documents = await source.fetchAll();
  return documents
    .map((document) => Knowledge.fromSourceDocument(document))
    .sort((current, next) => {
      const currentProps = current.toProps();
      const nextProps = next.toProps();
      return currentProps.order - nextProps.order || currentProps.title.localeCompare(nextProps.title);
    });
}

