import type { RequestHandler } from "express";
import type { FetchKnowledgeSourcePort } from "../../../application/ports/fetch-knowledge-source-port.js";
import type { KnowledgeSearchQuery } from "../../../application/use-cases/search-knowledge.js";
import { searchKnowledge } from "../../../application/use-cases/search-knowledge.js";
import { presentKnowledge } from "../presenters/knowledge-presenter.js";

/**
 * ナレッジ検索HTTPハンドラを生成する。
 *
 * @param source ナレッジソース取得Port。
 * @returns Express HTTPハンドラ。
 */
export function searchKnowledgeHandler(source: FetchKnowledgeSourcePort): RequestHandler {
  return async (req, res, next) => {
    try {
      const query: KnowledgeSearchQuery = {
        q: typeof req.query.q === "string" ? req.query.q : undefined,
        tag: typeof req.query.tag === "string" ? req.query.tag : undefined
      };
      const knowledgeList = await searchKnowledge(source, query);
      res.status(200).json({ data: knowledgeList.map(presentKnowledge) });
    } catch (error) {
      next(error);
    }
  };
}

