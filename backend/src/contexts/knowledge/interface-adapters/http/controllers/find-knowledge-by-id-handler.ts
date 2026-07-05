import type { RequestHandler } from "express";
import type { FetchKnowledgeSourcePort } from "../../../application/ports/fetch-knowledge-source-port.js";
import { getKnowledge } from "../../../application/use-cases/get-knowledge.js";
import { presentKnowledge } from "../presenters/knowledge-presenter.js";

/**
 * ナレッジ詳細取得HTTPハンドラを生成する。
 *
 * @param source ナレッジソース取得Port。
 * @returns Express HTTPハンドラ。
 */
export function findKnowledgeByIdHandler(source: FetchKnowledgeSourcePort): RequestHandler {
  return async (req, res, next) => {
    try {
      const knowledge = await getKnowledge(source, String(req.params.id));
      res.status(200).json({ data: presentKnowledge(knowledge) });
    } catch (error) {
      next(error);
    }
  };
}

