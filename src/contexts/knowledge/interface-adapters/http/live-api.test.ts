import { describe, expect, it } from "vitest";

const baseUrl = process.env.LIVE_API_BASE_URL;
const describeLive = baseUrl === undefined ? describe.skip : describe;

type KnowledgeResponse = {
  data: {
    id: string;
    title: string;
    body: string;
    tags: string[];
  };
};

describeLive("起動中ナレッジAPI疎通テスト", () => {
  it("正常系: 起動中のAPIサーバに対して作成、取得、削除を確認する", async () => {
    const title = `Live API ${Date.now()}`;

    const health = await fetch(`${baseUrl}/health`);
    expect(health.status).toBe(200);
    expect(await health.json()).toEqual({ status: "ok" });

    const createdResponse = await fetch(`${baseUrl}/knowledge`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        title,
        body: "起動中サーバへの疎通確認。",
        tags: ["live-test"]
      })
    });
    expect(createdResponse.status).toBe(201);

    const created = (await createdResponse.json()) as KnowledgeResponse;
    expect(created.data).toMatchObject({
      title,
      body: "起動中サーバへの疎通確認。",
      tags: ["live-test"]
    });

    const foundResponse = await fetch(`${baseUrl}/knowledge/${created.data.id}`);
    expect(foundResponse.status).toBe(200);
    const found = (await foundResponse.json()) as KnowledgeResponse;
    expect(found.data.id).toBe(created.data.id);

    const deletedResponse = await fetch(`${baseUrl}/knowledge/${created.data.id}`, {
      method: "DELETE"
    });
    expect(deletedResponse.status).toBe(204);
  });
});
