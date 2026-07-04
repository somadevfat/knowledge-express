import { describe, expect, it } from "vitest";
import { InMemoryKnowledgeRepository } from "../../infrastructure/repositories/in-memory-knowledge-repository.js";
import { createKnowledge } from "./create-knowledge.js";
import { searchKnowledge } from "./search-knowledge.js";

describe("searchKnowledge", () => {
  it("正常系: キーワードとタグの両方に一致する記事だけ返す", async () => {
    const repository = new InMemoryKnowledgeRepository();
    await createKnowledge(repository, {
      title: "Controller",
      body: "HTTPの都合をApplication層へ変換する。",
      tags: ["interface-adapter"]
    });
    await createKnowledge(repository, {
      title: "Entity",
      body: "Domain rulesを守る。",
      tags: ["domain"]
    });

    const results = await searchKnowledge(repository, {
      q: "rules",
      tag: "domain"
    });

    expect(results).toHaveLength(1);
    expect(results[0]?.toProps().title).toBe("Entity");
  });

  it("正常系: 条件なしなら全件を返す", async () => {
    const repository = new InMemoryKnowledgeRepository();
    await createKnowledge(repository, {
      title: "A",
      body: "本文A"
    });
    await createKnowledge(repository, {
      title: "B",
      body: "本文B"
    });

    const results = await searchKnowledge(repository, {});

    expect(results).toHaveLength(2);
  });

  it("正常系: タグ検索は大文字小文字を区別しない", async () => {
    const repository = new InMemoryKnowledgeRepository();
    await createKnowledge(repository, {
      title: "Repository",
      body: "Portを実装する。",
      tags: ["Clean-Architecture"]
    });

    const results = await searchKnowledge(repository, {
      tag: "CLEAN-ARCHITECTURE"
    });

    expect(results).toHaveLength(1);
  });
});
