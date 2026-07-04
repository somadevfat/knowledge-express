import type { DeleteKnowledgePort } from "./delete-knowledge-port.js";
import type { FindKnowledgeByIdPort } from "./find-knowledge-by-id-port.js";
import type { SaveKnowledgePort } from "./save-knowledge-port.js";
import type { SearchKnowledgePort } from "./search-knowledge-port.js";

/**
 * HTTP APIがナレッジUseCase群を呼ぶために必要なPortの集合。
 */
export type KnowledgeApiPorts = SaveKnowledgePort & FindKnowledgeByIdPort & SearchKnowledgePort & DeleteKnowledgePort;
