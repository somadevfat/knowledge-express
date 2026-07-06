import { describe, expect, it } from "vitest";
import { NotFoundError } from "../errors";
import { InMemoryKnowledgeSource } from "../knowledge-source";
import {
  getKnowledge,
  getKnowledgeTree,
  listKnowledge,
  searchKnowledge,
} from "../use-cases";

function createSource() {
  return new InMemoryKnowledgeSource([
    {
      path: "Clean Architecture/Controller.md",
      sourceUrl: "https://github.com/example/wiki/blob/main/Controller.md",
      content: `---
id: controller
title: Controller
category: Clean Architecture
tags:
  - clean-architecture
order: 20
---

# Controller
HTTP入力を受け取ります。`,
    },
    {
      path: "Clean Architecture/Entity.md",
      sourceUrl: "https://github.com/example/wiki/blob/main/Entity.md",
      content: `---
id: entity
title: Entity
category: Clean Architecture
tags:
  - domain
order: 10
---

# Entity
ドメインルールを守ります。`,
    },
    {
      path: "Backend/Express.md",
      sourceUrl: "https://github.com/example/wiki/blob/main/Express.md",
      content: `---
id: express-setup
title: Express Setup
category: Backend
tags:
  - express
order: 1
---

# Express Setup
サーバーを起動します。`,
    },
  ]);
}

describe("listKnowledge", () => {
  it("正常系: order昇順、同順位はtitleの辞書順で並べる", async () => {
    const articles = await listKnowledge(createSource());
    expect(articles.map((article) => article.toProps().id)).toEqual([
      "express-setup",
      "entity",
      "controller",
    ]);
  });
});

describe("getKnowledge", () => {
  it("正常系: idに一致する記事を返す", async () => {
    const article = await getKnowledge(createSource(), "entity");
    expect(article.toProps().title).toBe("Entity");
  });

  it("異常系: idに一致する記事が無い場合はNotFoundErrorを投げる", async () => {
    await expect(getKnowledge(createSource(), "missing")).rejects.toThrow(
      NotFoundError,
    );
  });
});

describe("searchKnowledge", () => {
  it("正常系: キーワードは本文・タイトル・カテゴリを対象に部分一致する", async () => {
    const results = await searchKnowledge(createSource(), { q: "ドメイン" });
    expect(results.map((r) => r.toProps().id)).toEqual(["entity"]);
  });

  it("正常系: タグとキーワードを両方指定すると両方に一致する記事だけ返す", async () => {
    const results = await searchKnowledge(createSource(), {
      q: "Express",
      tag: "express",
    });
    expect(results.map((r) => r.toProps().id)).toEqual(["express-setup"]);
  });

  it("異常系: 条件に一致する記事が無ければ空配列を返す", async () => {
    const results = await searchKnowledge(createSource(), { q: "存在しない単語" });
    expect(results).toEqual([]);
  });
});

describe("getKnowledgeTree", () => {
  it("正常系: カテゴリごとにグルーピングし、カテゴリ内は記事タイトルの辞書順で並べる", async () => {
    const tree = await getKnowledgeTree(createSource());

    expect(tree.map((node) => node.title)).toEqual(["Backend", "Clean Architecture"]);

    const cleanArchitecture = tree.find((node) => node.title === "Clean Architecture");
    expect(cleanArchitecture?.children.map((child) => child.title)).toEqual([
      "Controller",
      "Entity",
    ]);
  });
});
