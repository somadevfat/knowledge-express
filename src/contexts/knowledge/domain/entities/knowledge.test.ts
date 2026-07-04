import { describe, expect, it } from "vitest";
import { DomainError } from "../errors/domain-error.js";
import { Knowledge } from "./knowledge.js";

describe("Knowledge Entity", () => {
  it("正常系: タイトルのtrimとタグの正規化を行う", () => {
    const knowledge = Knowledge.create({
      title: "  Clean Architecture  ",
      body: "Layer rules",
      tags: ["Domain", " domain ", "", "Use-Case"]
    });

    expect(knowledge.toProps()).toMatchObject({
      title: "Clean Architecture",
      tags: ["domain", "use-case"]
    });
  });

  it("境界値: タイトルが120文字なら作成できる", () => {
    const title = "a".repeat(120);

    const knowledge = Knowledge.create({
      title,
      body: "本文"
    });

    expect(knowledge.toProps().title).toBe(title);
  });

  it("異常系: 空タイトルはDomainErrorにする", () => {
    expect(() =>
      Knowledge.create({
        title: " ",
        body: "本文"
      })
    ).toThrow(DomainError);
  });

  it("異常系: タイトルが121文字ならDomainErrorにする", () => {
    expect(() =>
      Knowledge.create({
        title: "a".repeat(121),
        body: "本文"
      })
    ).toThrow(DomainError);
  });

  it("異常系: 空本文はDomainErrorにする", () => {
    expect(() =>
      Knowledge.create({
        title: "タイトル",
        body: " "
      })
    ).toThrow(DomainError);
  });

  it("正常系: 更新時に既存の本文を維持しながらタグだけ変更できる", () => {
    const knowledge = Knowledge.create({
      title: "Controller",
      body: "HTTPの都合を扱う",
      tags: ["interface-adapter"]
    });

    const updated = knowledge.update({
      tags: ["Presentation", "presentation"]
    });

    expect(updated.toProps()).toMatchObject({
      title: "Controller",
      body: "HTTPの都合を扱う",
      tags: ["presentation"]
    });
  });

  it("正常系: toPropsは配列とDateをコピーして返す", () => {
    const knowledge = Knowledge.create({
      title: "Immutable",
      body: "外部から直接変更させない。",
      tags: ["domain"]
    });

    const props = knowledge.toProps();
    props.tags.push("mutated");
    props.createdAt.setFullYear(2000);

    expect(knowledge.toProps().tags).toEqual(["domain"]);
    expect(knowledge.toProps().createdAt.getFullYear()).not.toBe(2000);
  });
});
