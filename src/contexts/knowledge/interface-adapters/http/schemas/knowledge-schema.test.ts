import { describe, expect, it } from "vitest";
import {
  createKnowledgeSchema,
  knowledgeIdParamsSchema,
  searchKnowledgeSchema,
  updateKnowledgeSchema
} from "./knowledge-schema.js";

describe("knowledge HTTP schemas", () => {
  it("正常系: 作成リクエストを検証できる", () => {
    const result = createKnowledgeSchema.safeParse({
      title: "Repository",
      body: "永続化の詳細を隠す",
      tags: ["clean-architecture"]
    });

    expect(result.success).toBe(true);
  });

  it("境界値: 作成リクエストのタイトルは120文字まで許可する", () => {
    const result = createKnowledgeSchema.safeParse({
      title: "a".repeat(120),
      body: "本文"
    });

    expect(result.success).toBe(true);
  });

  it("異常系: 作成リクエストのタイトルが121文字なら失敗する", () => {
    const result = createKnowledgeSchema.safeParse({
      title: "a".repeat(121),
      body: "本文"
    });

    expect(result.success).toBe(false);
  });

  it("異常系: 更新リクエストは最低1項目を要求する", () => {
    const result = updateKnowledgeSchema.safeParse({});

    expect(result.success).toBe(false);
  });

  it("正常系: 検索クエリはqまたはtagを任意で受け取れる", () => {
    const result = searchKnowledgeSchema.safeParse({
      q: "use case",
      tag: "application"
    });

    expect(result.success).toBe(true);
  });

  it("異常系: 空文字の検索クエリは失敗する", () => {
    const result = searchKnowledgeSchema.safeParse({
      q: ""
    });

    expect(result.success).toBe(false);
  });

  it("正常系: パスパラメータのidを検証できる", () => {
    const result = knowledgeIdParamsSchema.safeParse({
      id: "knowledge-id"
    });

    expect(result.success).toBe(true);
  });
});
