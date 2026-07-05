import type { RequestHandler } from "express";
import type { FetchKnowledgeSourcePort } from "../../../application/ports/fetch-knowledge-source-port.js";
import { syncKnowledge } from "../../../application/use-cases/sync-knowledge.js";

/**
 * ナレッジ同期HTTPハンドラを生成する。
 *
 * @param source ナレッジソース取得Port。
 * @returns Express HTTPハンドラ。
 */
export function syncKnowledgeHandler(source: FetchKnowledgeSourcePort): RequestHandler {
  return async (_req, res, next) => {
    try {
      const result = await syncKnowledge(source);
      res.status(200).json({
        data: {
          syncedCount: result.syncedCount,
          syncedAt: result.syncedAt.toISOString()
        }
      });
    } catch (error) {
      next(error);
    }
  };
}
