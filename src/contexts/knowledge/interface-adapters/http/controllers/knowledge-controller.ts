import type { RequestHandler } from "express";
import type { KnowledgeApiPorts } from "../../../application/ports/knowledge-api-ports.js";
import { createKnowledge } from "../../../application/use-cases/create-knowledge.js";
import { deleteKnowledge } from "../../../application/use-cases/delete-knowledge.js";
import { getKnowledge } from "../../../application/use-cases/get-knowledge.js";
import { searchKnowledge } from "../../../application/use-cases/search-knowledge.js";
import { updateKnowledge } from "../../../application/use-cases/update-knowledge.js";
import { presentKnowledge } from "../presenters/knowledge-presenter.js";
import {
  createKnowledgeSchema,
  knowledgeIdParamsSchema,
  searchKnowledgeSchema,
  updateKnowledgeSchema
} from "../schemas/knowledge-schema.js";

/**
 * ナレッジAPI用のHTTPハンドラを生成する。
 *
 * @param repository Composition Rootから注入される永続化Port。
 * @returns Expressのリクエストハンドラ群。
 */
export function createKnowledgeController(repository: KnowledgeApiPorts): {
  create: RequestHandler;
  findById: RequestHandler;
  search: RequestHandler;
  update: RequestHandler;
  remove: RequestHandler;
} {
  return {
    create: async (req, res, next) => {
      try {
        const input = createKnowledgeSchema.parse(req.body);
        const knowledge = await createKnowledge(repository, input);
        res.status(201).json({ data: presentKnowledge(knowledge) });
      } catch (error) {
        next(error);
      }
    },

    findById: async (req, res, next) => {
      try {
        const params = knowledgeIdParamsSchema.parse(req.params);
        const knowledge = await getKnowledge(repository, params.id);
        res.status(200).json({ data: presentKnowledge(knowledge) });
      } catch (error) {
        next(error);
      }
    },

    search: async (req, res, next) => {
      try {
        const query = searchKnowledgeSchema.parse(req.query);
        const knowledgeList = await searchKnowledge(repository, query);
        res.status(200).json({ data: knowledgeList.map(presentKnowledge) });
      } catch (error) {
        next(error);
      }
    },

    update: async (req, res, next) => {
      try {
        const params = knowledgeIdParamsSchema.parse(req.params);
        const input = updateKnowledgeSchema.parse(req.body);
        const knowledge = await updateKnowledge(repository, params.id, input);
        res.status(200).json({ data: presentKnowledge(knowledge) });
      } catch (error) {
        next(error);
      }
    },

    remove: async (req, res, next) => {
      try {
        const params = knowledgeIdParamsSchema.parse(req.params);
        await deleteKnowledge(repository, params.id);
        res.status(204).send();
      } catch (error) {
        next(error);
      }
    }
  };
}
