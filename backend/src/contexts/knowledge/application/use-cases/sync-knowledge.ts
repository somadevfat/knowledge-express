import type { FetchKnowledgeSourcePort } from "../ports/fetch-knowledge-source-port.js";

export type SyncKnowledgeResult = {
  syncedCount: number;
  syncedAt: Date;
};

/**
 * GitHub由来のナレッジ記事を再取得する。
 *
 * 現在のMVPでは永続キャッシュを更新せず、外部ソースへ疎通して件数を返す。
 *
 * @param source ナレッジソース取得Port。
 * @returns 同期結果。
 */
export async function syncKnowledge(source: FetchKnowledgeSourcePort): Promise<SyncKnowledgeResult> {
  const documents = await source.fetchAll();
  return {
    syncedCount: documents.length,
    syncedAt: new Date()
  };
}
