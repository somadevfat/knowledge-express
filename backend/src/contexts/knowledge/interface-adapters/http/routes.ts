import { Router } from "express";
import type { KnowledgeApiPorts } from "../../application/ports/knowledge-api-ports.js";
import { createKnowledgeController } from "./controllers/index.js";

/**
 * ナレッジコンテキストのAPIルータを生成する。
 *
 * @param source ナレッジソース取得Port。
 * @returns Expressルータ。
 */
export function createRouter(source: KnowledgeApiPorts): Router {
  const router = Router();
  const knowledge = createKnowledgeController(source);

  router.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok" });
  });

  router.get("/knowledge/tree", knowledge.tree);
  router.get("/knowledge/search", knowledge.search);
  router.get("/knowledge", knowledge.list);
  router.get("/knowledge/:id", knowledge.findById);
  router.post("/knowledge/sync", knowledge.sync);

  return router;
}
