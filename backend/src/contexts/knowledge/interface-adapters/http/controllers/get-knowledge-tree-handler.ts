import type { RequestHandler } from "express";
import type { FetchKnowledgeSourcePort } from "../../../application/ports/fetch-knowledge-source-port.js";
import { getKnowledgeTree } from "../../../application/use-cases/get-knowledge-tree.js";

/**
 * ナレッジツリーHTTPハンドラを生成する。
 *
 * @param source ナレッジソース取得Port。
 * @returns Express HTTPハンドラ。
 */
export function getKnowledgeTreeHandler(source: FetchKnowledgeSourcePort): RequestHandler {
  return async (_req, res, next) => {
    try {
      res.status(200).json({ data: await getKnowledgeTree(source) });
    } catch (error) {
      next(error);
    }
  };
}

