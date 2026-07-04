import { describe, expect, it } from "vitest";
import { DomainError } from "../../domain/errors/domain-error.js";
import { InMemoryKnowledgeRepository } from "../../infrastructure/repositories/in-memory-knowledge-repository.js";
import { createKnowledge } from "./create-knowledge.js";

describe("createKnowledge", () => {
  it("正常系: ナレッジ記事を作成して保存する", async () => {
    const repository = new InMemoryKnowledgeRepository();

    const created = await createKnowledge(repository, {
      title: " Repository Pattern ",
      body: "永続化の詳細を隠す。",
      tags: ["Clean-Architecture", "repository", "repository"]
    });

    expect(created.toProps()).toMatchObject({
      title: "Repository Pattern",
      body: "永続化の詳細を隠す。",
      tags: ["clean-architecture", "repository"]
    });
    await expect(repository.findById(created.toProps().id)).resolves.toBe(created);
  });

  it("境界値: タイトルが120文字なら作成できる", async () => {
    const repository = new InMemoryKnowledgeRepository();
    const title = "a".repeat(120);

    const created = await createKnowledge(repository, {
      title,
      body: "本文"
    });

    expect(created.toProps().title).toBe(title);
  });

  it("異常系: タイトルが121文字ならDomainErrorにする", async () => {
    const repository = new InMemoryKnowledgeRepository();

    await expect(
      createKnowledge(repository, {
        title: "a".repeat(121),
        body: "本文"
      })
    ).rejects.toBeInstanceOf(DomainError);
  });

  it("異常系: 本文が空ならDomainErrorにする", async () => {
    const repository = new InMemoryKnowledgeRepository();

    await expect(
      createKnowledge(repository, {
        title: "タイトル",
        body: " "
      })
    ).rejects.toBeInstanceOf(DomainError);
  });
});
