import type { KnowledgeSourceDocument } from "../../domain/entities/knowledge.js";

/**
 * GitHubなど外部ナレッジソースからMarkdown文書を取得するためのPort。
 */
export interface FetchKnowledgeSourcePort {
  /**
   * 外部ナレッジソースにあるMarkdown文書をすべて取得する。
   *
   * @returns 外部ソースから取得したMarkdown文書一覧。
   */
  fetchAll(): Promise<KnowledgeSourceDocument[]>;
}

