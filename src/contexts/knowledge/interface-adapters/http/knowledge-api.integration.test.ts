import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../../../../app.js";
import { InMemoryKnowledgeRepository } from "../../infrastructure/repositories/in-memory-knowledge-repository.js";

describe("ナレッジAPI結合テスト", () => {
  let app: ReturnType<typeof createApp>;

  beforeEach(() => {
    app = createApp(new InMemoryKnowledgeRepository());
  });

  it("正常系: GET /health は稼働状態を返す", async () => {
    const response = await request(app).get("/health").expect(200);

    expect(response.body).toEqual({
      status: "ok"
    });
  });

  it("正常系: POST /knowledge はナレッジ記事を作成する", async () => {
    const response = await request(app)
      .post("/knowledge")
      .send({
        title: "Repository Port",
        body: "Application層はPortに依存する。",
        tags: ["Clean-Architecture", "repository", "repository"]
      })
      .expect(201);

    expect(response.body.data).toMatchObject({
      title: "Repository Port",
      body: "Application層はPortに依存する。",
      tags: ["clean-architecture", "repository"]
    });
    expect(response.body.data.id).toEqual(expect.any(String));
    expect(response.body.data.createdAt).toEqual(expect.any(String));
    expect(response.body.data.updatedAt).toEqual(expect.any(String));
  });

  it("正常系: GET /knowledge/:id は作成済みナレッジ記事を取得する", async () => {
    const created = await request(app)
      .post("/knowledge")
      .send({
        title: "Use Case",
        body: "Application固有の処理を書く。",
        tags: ["application"]
      })
      .expect(201);

    const response = await request(app).get(`/knowledge/${created.body.data.id}`).expect(200);

    expect(response.body.data).toMatchObject({
      id: created.body.data.id,
      title: "Use Case",
      body: "Application固有の処理を書く。",
      tags: ["application"]
    });
  });

  it("正常系: GET /knowledge はキーワードとタグで検索する", async () => {
    await request(app)
      .post("/knowledge")
      .send({
        title: "Controller",
        body: "HTTPの都合をApplication層へ変換する。",
        tags: ["interface-adapter"]
      })
      .expect(201);
    await request(app)
      .post("/knowledge")
      .send({
        title: "Entity",
        body: "Domain rulesを守る。",
        tags: ["domain"]
      })
      .expect(201);

    const response = await request(app).get("/knowledge").query({ q: "rules", tag: "domain" }).expect(200);

    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0]).toMatchObject({
      title: "Entity",
      tags: ["domain"]
    });
  });

  it("正常系: PUT /knowledge/:id はナレッジ記事を更新する", async () => {
    const created = await request(app)
      .post("/knowledge")
      .send({
        title: "Before",
        body: "更新前",
        tags: ["old"]
      })
      .expect(201);

    const response = await request(app)
      .put(`/knowledge/${created.body.data.id}`)
      .send({
        title: "After",
        tags: ["new"]
      })
      .expect(200);

    expect(response.body.data).toMatchObject({
      id: created.body.data.id,
      title: "After",
      body: "更新前",
      tags: ["new"]
    });
  });

  it("正常系: DELETE /knowledge/:id はナレッジ記事を削除する", async () => {
    const created = await request(app)
      .post("/knowledge")
      .send({
        title: "Delete target",
        body: "削除対象"
      })
      .expect(201);

    await request(app).delete(`/knowledge/${created.body.data.id}`).expect(204);
    await request(app).get(`/knowledge/${created.body.data.id}`).expect(404);
  });

  it("異常系: 不正なリクエストは共通エラー形式で返す", async () => {
    const response = await request(app)
      .post("/knowledge")
      .send({
        title: "",
        body: ""
      })
      .expect(400);

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
