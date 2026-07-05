import { describe, expect, it } from "vitest";

const baseUrl = process.env.LIVE_API_BASE_URL;
const describeLive = baseUrl === undefined ? describe.skip : describe;

type KnowledgeListResponse = {
  data: Array<{
    id: string;
    title: string;
    body: string;
    tags: string[];
  }>;
};

describeLive("起動中ナレッジAPI疎通テスト", () => {
  it("正常系: 起動中のAPIサーバに対して一覧、詳細、同期を確認する", async () => {
    const health = await fetch(`${baseUrl}/health`);
    expect(health.status).toBe(200);
    expect(await health.json()).toEqual({ status: "ok" });

    const listResponse = await fetch(`${baseUrl}/knowledge`);
    expect(listResponse.status).toBe(200);

    const list = (await listResponse.json()) as KnowledgeListResponse;
    expect(Array.isArray(list.data)).toBe(true);

    if (list.data.length > 0) {
      const foundResponse = await fetch(`${baseUrl}/knowledge/${list.data[0]?.id}`);
      expect(foundResponse.status).toBe(200);
    }

    const syncResponse = await fetch(`${baseUrl}/knowledge/sync`, {
      method: "POST"
    });
    expect(syncResponse.status).toBe(200);
  });
});
