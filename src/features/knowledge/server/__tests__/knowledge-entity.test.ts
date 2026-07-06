import { describe, expect, it } from "vitest";
import { DomainError } from "../errors";
import { Knowledge } from "../knowledge-entity";

describe("Knowledge.fromSourceDocument", () => {
  it("正常系: frontmatterからidやtagsなどを取り出す", () => {
    /* Arrange */
    const document = {
      path: "Clean Architecture/Controller.md",
      sourceUrl: "https://github.com/example/wiki/blob/main/Controller.md",
      content: `---
id: clean-architecture-controller
title: Controllerの責務
category: Clean Architecture
tags:
  - clean-architecture
  - controller
order: 10
---

# Controllerの責務

HTTP入力をUseCaseへ渡します。`,
    };

    /* Act */
    const knowledge = Knowledge.fromSourceDocument(document);

    /* Assert */
    expect(knowledge.toProps()).toMatchObject({
      id: "clean-architecture-controller",
      title: "Controllerの責務",
      category: "Clean Architecture",
      tags: ["clean-architecture", "controller"],
      order: 10,
      body: "# Controllerの責務\n\nHTTP入力をUseCaseへ渡します。",
    });
  });

  it("正常系: frontmatterが無い場合はpathと本文から補完する", () => {
    /* Arrange */
    const document = {
      path: "guides/getting-started.md",
      sourceUrl: "https://github.com/example/wiki/blob/main/guides/getting-started.md",
      content: "# はじめに\n\nようこそ。",
    };

    /* Act */
    const props = Knowledge.fromSourceDocument(document).toProps();

    /* Assert */
    expect(props.title).toBe("はじめに");
    expect(props.category).toBe("guides");
    expect(props.id).toBe("guides-getting-started");
    expect(props.tags).toEqual([]);
  });

  it("異常系: 本文が空だとDomainErrorを投げる", () => {
    /* Arrange */
    const document = {
      path: "empty.md",
      sourceUrl: "https://github.com/example/wiki/blob/main/empty.md",
      content: "---\ntitle: 空の記事\n---\n\n",
    };

    /* Act */
    const act = () => Knowledge.fromSourceDocument(document);

    /* Assert */
    expect(act).toThrow(DomainError);
  });

  it("異常系: titleが120文字を超えるとDomainErrorを投げる", () => {
    /* Arrange */
    const longTitle = "あ".repeat(121);
    const document = {
      path: "long-title.md",
      sourceUrl: "https://github.com/example/wiki/blob/main/long-title.md",
      content: `---\ntitle: ${longTitle}\n---\n\n本文`,
    };

    /* Act */
    const act = () => Knowledge.fromSourceDocument(document);

    /* Assert */
    expect(act).toThrow(DomainError);
  });
});

describe("Knowledge#toProps", () => {
  it("正常系: 返す配列/Dateは呼び出しごとに独立したコピーになる", () => {
    /* Arrange */
    const knowledge = Knowledge.fromSourceDocument({
      path: "a.md",
      sourceUrl: "https://github.com/example/wiki/blob/main/a.md",
      content: "---\ntitle: A\ntags:\n  - x\n---\n\n本文",
      updatedAt: new Date("2026-01-01T00:00:00.000Z"),
    });

    /* Act */
    const first = knowledge.toProps();
    first.tags.push("mutated");
    first.updatedAt?.setFullYear(1999);
    const second = knowledge.toProps();

    /* Assert */
    expect(second.tags).toEqual(["x"]);
    expect(second.updatedAt?.getFullYear()).toBe(2026);
  });
});
