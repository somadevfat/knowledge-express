import type { RequestHandler } from "express";
import type { FetchKnowledgeSourcePort } from "../../../application/ports/fetch-knowledge-source-port.js";
import { listKnowledge } from "../../../application/use-cases/list-knowledge.js";
import { presentKnowledge } from "../presenters/knowledge-presenter.js";

/**
 * ナレッジ一覧HTTPハンドラを生成する。
 *
 * @param source ナレッジソース取得Port。
 * @returns Express HTTPハンドラ。
 */
export function listKnowledgeHandler(source: FetchKnowledgeSourcePort): RequestHandler {
  return async (_req, res, next) => {
    try {
      const knowledgeList = await listKnowledge(source);
      res.status(200).json({ data: knowledgeList.map(presentKnowledge) });
    } catch (error) {
      next(error);
    }
  };
}

