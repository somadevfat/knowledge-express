import { describe, expect, it } from "vitest";
import { InMemoryKnowledgeSource } from "../../infrastructure/gateways/in-memory-knowledge-source.js";
import { syncKnowledge } from "./sync-knowledge.js";

describe("syncKnowledge", () => {
  it("正常系: 外部ソースから取得できた件数を返す", async () => {
    const source = new InMemoryKnowledgeSource([
      {
        path: "A.md",
        sourceUrl: "https://github.com/example/wiki/blob/main/A.md",
        content: "# A\n\n本文A"
      }
    ]);

    const result = await syncKnowledge(source);

    expect(result.syncedCount).toBe(1);
    expect(result.syncedAt).toBeInstanceOf(Date);
  });
});
