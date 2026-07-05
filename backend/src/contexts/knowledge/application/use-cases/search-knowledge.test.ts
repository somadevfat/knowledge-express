import { describe, expect, it } from "vitest";
import { InMemoryKnowledgeSource } from "../../infrastructure/gateways/in-memory-knowledge-source.js";
import { searchKnowledge } from "./search-knowledge.js";

describe("searchKnowledge", () => {
  it("正常系: キーワードとタグに一致する記事を返す", async () => {
    const source = new InMemoryKnowledgeSource([
      {
        path: "Controller.md",
        sourceUrl: "https://github.com/example/wiki/blob/main/Controller.md",
        content: "---\ntitle: Controller\ntags:\n  - interface\n---\n\nHTTP入力を変換します。"
      },
      {
        path: "Entity.md",
        sourceUrl: "https://github.com/example/wiki/blob/main/Entity.md",
        content: "---\ntitle: Entity\ntags:\n  - domain\n---\n\nDomain rulesを守ります。"
      }
    ]);

    const results = await searchKnowledge(source, { q: "rules", tag: "domain" });

    expect(results).toHaveLength(1);
    expect(results[0]?.toProps()).toMatchObject({
      title: "Entity",
      tags: ["domain"]
    });
  });

  it("正常系: 条件がない場合は全件返す", async () => {
    const source = new InMemoryKnowledgeSource([
      {
        path: "A.md",
        sourceUrl: "https://github.com/example/wiki/blob/main/A.md",
        content: "# A\n\n本文A"
      },
      {
        path: "B.md",
        sourceUrl: "https://github.com/example/wiki/blob/main/B.md",
        content: "# B\n\n本文B"
      }
    ]);

    const results = await searchKnowledge(source, {});

    expect(results).toHaveLength(2);
  });
});

