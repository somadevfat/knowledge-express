import type { KnowledgeApiPorts } from "../../../application/ports/knowledge-api-ports.js";
import { findKnowledgeByIdHandler } from "./find-knowledge-by-id-handler.js";
import { getKnowledgeTreeHandler } from "./get-knowledge-tree-handler.js";
import { listKnowledgeHandler } from "./list-knowledge-handler.js";
import { searchKnowledgeHandler } from "./search-knowledge-handler.js";
import { syncKnowledgeHandler } from "./sync-knowledge-handler.js";
import type { KnowledgeController } from "./types.js";

/**
 * ナレッジAPI用のHTTPハンドラ群を生成する。
 *
 * @param source Composition Rootから注入されるナレッジソースPort。
 * @returns Expressのリクエストハンドラ群。
 */
export function createKnowledgeController(source: KnowledgeApiPorts): KnowledgeController {
  return {
    list: listKnowledgeHandler(source),
    findById: findKnowledgeByIdHandler(source),
    search: searchKnowledgeHandler(source),
    tree: getKnowledgeTreeHandler(source),
    sync: syncKnowledgeHandler(source)
  };
}

