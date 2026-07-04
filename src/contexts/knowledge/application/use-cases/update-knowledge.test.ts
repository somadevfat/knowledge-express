import { describe, expect, it } from "vitest";
import { NotFoundError } from "../errors/not-found-error.js";
import { DomainError } from "../../domain/errors/domain-error.js";
import { InMemoryKnowledgeRepository } from "../../infrastructure/repositories/in-memory-knowledge-repository.js";
import { createKnowledge } from "./create-knowledge.js";
import { updateKnowledge } from "./update-knowledge.js";

describe("updateKnowledge", () => {
  it("正常系: 指定した項目だけ更新し、未指定項目は維持する", async () => {
    const repository = new InMemoryKnowledgeRepository();
    const created = await createKnowledge(repository, {
      title: "Before",
      body: "更新前の本文",
      tags: ["old"]
    });

    const updated = await updateKnowledge(repository, created.toProps().id, {
      title: "After",
      tags: ["new"]
    });

    expect(updated.toProps()).toMatchObject({
      id: created.toProps().id,
      title: "After",
      body: "更新前の本文",
      tags: ["new"]
    });
  });

  it("境界値: 更新後タイトルが120文字なら更新できる", async () => {
    const repository = new InMemoryKnowledgeRepository();
    const created = await createKnowledge(repository, {
      title: "Before",
      body: "本文"
    });
    const title = "a".repeat(120);

    const updated = await updateKnowledge(repository, created.toProps().id, {
      title
    });

    expect(updated.toProps().title).toBe(title);
  });

  it("異常系: 存在しないIDならNotFoundErrorにする", async () => {
    const repository = new InMemoryKnowledgeRepository();

    await expect(updateKnowledge(repository, "missing-id", { title: "After" })).rejects.toBeInstanceOf(NotFoundError);
  });

  it("異常系: 更新後タイトルが121文字ならDomainErrorにする", async () => {
    const repository = new InMemoryKnowledgeRepository();
    const created = await createKnowledge(repository, {
      title: "Before",
      body: "本文"
    });

    await expect(
      updateKnowledge(repository, created.toProps().id, {
        title: "a".repeat(121)
      })
    ).rejects.toBeInstanceOf(DomainError);
  });
});
