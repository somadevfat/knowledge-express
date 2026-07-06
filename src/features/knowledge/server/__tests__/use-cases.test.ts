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
    /* Arrange */
    const source = createSource();

    /* Act */
    const articles = await listKnowledge(source);

    /* Assert */
    expect(articles.map((article) => article.toProps().id)).toEqual([
      "express-setup",
      "entity",
      "controller",
    ]);
  });
});

describe("getKnowledge", () => {
  it("正常系: idに一致する記事を返す", async () => {
    /* Arrange */
    const source = createSource();

    /* Act */
    const article = await getKnowledge(source, "entity");

    /* Assert */
    expect(article.toProps().title).toBe("Entity");
  });

  it("異常系: idに一致する記事が無い場合はNotFoundErrorを投げる", async () => {
    /* Arrange */
    const source = createSource();

    /* Act */
    const act = getKnowledge(source, "missing");

    /* Assert */
    await expect(act).rejects.toThrow(NotFoundError);
  });
});

describe("searchKnowledge", () => {
  it("正常系: キーワードは本文・タイトル・カテゴリを対象に部分一致する", async () => {
    /* Arrange */
    const source = createSource();

    /* Act */
    const results = await searchKnowledge(source, { q: "ドメイン" });

    /* Assert */
    expect(results.map((r) => r.toProps().id)).toEqual(["entity"]);
  });

  it("正常系: タグとキーワードを両方指定すると両方に一致する記事だけ返す", async () => {
    /* Arrange */
    const source = createSource();

    /* Act */
    const results = await searchKnowledge(source, { q: "Express", tag: "express" });

    /* Assert */
    expect(results.map((r) => r.toProps().id)).toEqual(["express-setup"]);
  });

  it("異常系: 条件に一致する記事が無ければ空配列を返す", async () => {
    /* Arrange */
    const source = createSource();

    /* Act */
    const results = await searchKnowledge(source, { q: "存在しない単語" });

    /* Assert */
    expect(results).toEqual([]);
  });
});

describe("getKnowledgeTree", () => {
  it("正常系: カテゴリごとにグルーピングし、カテゴリ内は記事タイトルの辞書順で並べる", async () => {
    /* Arrange */
    const source = createSource();

    /* Act */
    const tree = await getKnowledgeTree(source);

    /* Assert */
    expect(tree.map((node) => node.title)).toEqual(["Backend", "Clean Architecture"]);
    const cleanArchitecture = tree.find((node) => node.title === "Clean Architecture");
    expect(cleanArchitecture?.children.map((child) => child.title)).toEqual([
      "Controller",
      "Entity",
    ]);
  });
});
