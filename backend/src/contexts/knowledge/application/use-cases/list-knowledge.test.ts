import { describe, expect, it } from "vitest";
import { InMemoryKnowledgeSource } from "../../infrastructure/gateways/in-memory-knowledge-source.js";
import { listKnowledge } from "./list-knowledge.js";

describe("listKnowledge", () => {
  it("正常系: GitHub由来のMarkdownを表示順に並べて返す", async () => {
    const source = new InMemoryKnowledgeSource([
      {
        path: "B.md",
        sourceUrl: "https://github.com/example/wiki/blob/main/B.md",
        content: "---\ntitle: B\norder: 20\n---\n\n本文B"
      },
      {
        path: "A.md",
        sourceUrl: "https://github.com/example/wiki/blob/main/A.md",
        content: "---\ntitle: A\norder: 10\n---\n\n本文A"
      }
    ]);

    const results = await listKnowledge(source);

    expect(results.map((knowledge) => knowledge.toProps().title)).toEqual(["A", "B"]);
  });
});

