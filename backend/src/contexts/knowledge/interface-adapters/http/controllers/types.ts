import type { RequestHandler } from "express";

export type KnowledgeController = {
  list: RequestHandler;
  findById: RequestHandler;
  search: RequestHandler;
  tree: RequestHandler;
  sync: RequestHandler;
};

