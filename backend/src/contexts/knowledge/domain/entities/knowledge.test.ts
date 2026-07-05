import { describe, expect, it } from "vitest";
import { DomainError } from "../errors/domain-error.js";
import { Knowledge } from "./knowledge.js";

describe("Knowledge", () => {
  it("正常系: Markdownのfrontmatterからナレッジ記事を生成する", () => {
    const knowledge = Knowledge.fromSourceDocument({
      path: "Clean Architecture/Controller.md",
      sourceUrl: "https://github.com/example/wiki/blob/main/Controller.md",
      updatedAt: new Date("2026-01-01T00:00:00.000Z"),
      content: `---
id: clean-architecture-controller
title: Controllerの責務
category: Clean Architecture
tags:
  - Clean-Architecture
  - controller
  - controller
order: 10
---

# Controllerの責務

ControllerはHTTP入力をUseCaseへ渡します。`
    });

    expect(knowledge.toProps()).toMatchObject({
      id: "clean-architecture-controller",
      title: "Controllerの責務",
      excerpt: "ControllerはHTTP入力をUseCaseへ渡します。",
      tags: ["clean-architecture", "controller"],
      category: "Clean Architecture",
      path: "Clean Architecture/Controller.md",
      order: 10,
      sourceUrl: "https://github.com/example/wiki/blob/main/Controller.md"
    });
  });

  it("正常系: frontmatterがない場合はファイルパスと見出しから値を補完する", () => {
    const knowledge = Knowledge.fromSourceDocument({
      path: "Backend/Express.md",
      sourceUrl: "https://github.com/example/wiki/blob/main/Backend/Express.md",
      content: "# Express設計\n\n薄いControllerを保ちます。"
    });

    expect(knowledge.toProps()).toMatchObject({
      id: "backend-express",
      title: "Express設計",
      category: "Backend",
      excerpt: "薄いControllerを保ちます。"
    });
  });

  it("境界値: タイトルは120文字まで許可する", () => {
    const title = "a".repeat(120);

    const knowledge = Knowledge.fromSourceDocument({
      path: "Boundary/Title.md",
      sourceUrl: "https://github.com/example/wiki/blob/main/Boundary/Title.md",
      content: `---
title: ${title}
---

本文です。`
    });

    expect(knowledge.toProps().title).toBe(title);
  });

  it("異常系: タイトルが120文字を超える場合はDomainErrorを投げる", () => {
    const title = "a".repeat(121);

    expect(() =>
      Knowledge.fromSourceDocument({
        path: "Boundary/Title.md",
        sourceUrl: "https://github.com/example/wiki/blob/main/Boundary/Title.md",
        content: `---
title: ${title}
---

本文です。`
      })
    ).toThrow(DomainError);
  });

  it("異常系: 本文が空の場合はDomainErrorを投げる", () => {
    expect(() =>
      Knowledge.fromSourceDocument({
        path: "Empty.md",
        sourceUrl: "https://github.com/example/wiki/blob/main/Empty.md",
        content: "---\ntitle: Empty\n---\n"
      })
    ).toThrow(DomainError);
  });
});

