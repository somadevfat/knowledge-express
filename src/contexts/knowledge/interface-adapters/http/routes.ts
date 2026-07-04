import { Router } from "express";
import type { KnowledgeApiPorts } from "../../application/ports/knowledge-api-ports.js";
import { createKnowledgeController } from "./controllers/knowledge-controller.js";

/**
 * ナレッジコンテキストのAPIルータを生成する。
 *
 * @param repository ナレッジ永続化のPort。
 * @returns Expressルータ。
 */
export function createRouter(repository: KnowledgeApiPorts): Router {
  const router = Router();
  const knowledge = createKnowledgeController(repository);

  router.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok" });
  });

  router.get("/knowledge", knowledge.search);
  router.get("/knowledge/:id", knowledge.findById);
  router.post("/knowledge", knowledge.create);
  router.put("/knowledge/:id", knowledge.update);
  router.delete("/knowledge/:id", knowledge.remove);

  return router;
}
