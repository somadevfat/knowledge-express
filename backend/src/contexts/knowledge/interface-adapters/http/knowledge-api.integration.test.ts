import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../../../../app.js";
import { InMemoryKnowledgeSource } from "../../infrastructure/gateways/in-memory-knowledge-source.js";

describe("ナレッジAPI結合テスト", () => {
  let app: ReturnType<typeof createApp>;

  beforeEach(() => {
    app = createApp(
      new InMemoryKnowledgeSource([
        {
          path: "Clean Architecture/Controller.md",
          sourceUrl: "https://github.com/example/wiki/blob/main/Clean%20Architecture/Controller.md",
          updatedAt: new Date("2026-01-01T00:00:00.000Z"),
          content: `---
id: controller
title: Controller
category: Clean Architecture
tags:
  - interface
order: 10
---

# Controller

HTTP入力をUseCaseへ渡します。`
        },
        {
          path: "Clean Architecture/Entity.md",
          sourceUrl: "https://github.com/example/wiki/blob/main/Clean%20Architecture/Entity.md",
          updatedAt: new Date("2026-01-02T00:00:00.000Z"),
          content: `---
id: entity
title: Entity
category: Clean Architecture
tags:
  - domain
order: 20
---

# Entity

Domain rulesを守ります。`
        }
      ])
    );
  });

  it("正常系: GET /health は稼働状態を返す", async () => {
    const response = await request(app).get("/health").expect(200);

    expect(response.body).toEqual({
      status: "ok"
    });
  });

  it("正常系: GET /knowledge はGitHub由来の記事一覧を返す", async () => {
    const response = await request(app).get("/knowledge").expect(200);

    expect(response.body.data).toHaveLength(2);
    expect(response.body.data[0]).toMatchObject({
      id: "controller",
      title: "Controller",
      category: "Clean Architecture",
      tags: ["interface"],
      sourceUrl: "https://github.com/example/wiki/blob/main/Clean%20Architecture/Controller.md"
    });
  });

  it("正常系: GET /knowledge/:id は記事詳細を返す", async () => {
    const response = await request(app).get("/knowledge/entity").expect(200);

    expect(response.body.data).toMatchObject({
      id: "entity",
      title: "Entity",
      body: "# Entity\n\nDomain rulesを守ります。",
      excerpt: "Domain rulesを守ります。"
    });
  });

  it("正常系: GET /knowledge/search はキーワードとタグで検索する", async () => {
    const response = await request(app).get("/knowledge/search").query({ q: "rules", tag: "domain" }).expect(200);

    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0]).toMatchObject({
      id: "entity",
      title: "Entity"
    });
  });

  it("正常系: GET /knowledge/tree はWikiツリーを返す", async () => {
    const response = await request(app).get("/knowledge/tree").expect(200);

    expect(response.body.data).toEqual([
      {
        id: "category:Clean Architecture",
        title: "Clean Architecture",
        path: "Clean Architecture",
        children: [
          {
            id: "controller",
            title: "Controller",
            path: "Clean Architecture/Controller.md",
            children: []
          },
          {
            id: "entity",
            title: "Entity",
            path: "Clean Architecture/Entity.md",
            children: []
          }
        ]
      }
    ]);
  });

  it("正常系: POST /knowledge/sync は取得件数を返す", async () => {
    const response = await request(app).post("/knowledge/sync").expect(200);

    expect(response.body.data).toMatchObject({
      syncedCount: 2
    });
    expect(response.body.data.syncedAt).toEqual(expect.any(String));
  });

  it("異常系: 不正な検索クエリは共通エラー形式で返す", async () => {
    const response = await request(app).get("/knowledge/search").query({ q: "" }).expect(400);

    expect(response.body.error).toMatchObject({
      code: "VALIDATION_ERROR",
      message: "Request validation failed."
    });
  });

  it("異常系: 存在しないIDの取得は404を返す", async () => {
    const response = await request(app).get("/knowledge/missing-id").expect(404);

    expect(response.body.error).toMatchObject({
      code: "NOT_FOUND"
    });
  });
});

