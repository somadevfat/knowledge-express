import { DatabaseSync, type SQLInputValue } from "node:sqlite";
import { describe, expect, it, vi } from "vitest";
import { getViewsDatabaseBinding, recordSiteView } from "../view-count";

/**
 * `node:sqlite`（実SQLiteエンジン）をD1Database互換の最小インターフェースへ包んだテスト用フェイク。
 * Drizzleが実際に呼び出す`prepare(sql).bind(...params).run()/.all()/.get()`だけを実装する。
 */
function createFakeD1Database(): D1Database {
  const db = new DatabaseSync(":memory:");
  db.exec(
    "CREATE TABLE site_views (id INTEGER PRIMARY KEY CHECK (id = 1), view_count INTEGER NOT NULL DEFAULT 0)",
  );

  return {
    prepare(query: string) {
      const stmt = db.prepare(query);
      return {
        bind(...params: SQLInputValue[]) {
          return {
            async run() {
              stmt.run(...params);
              return {};
            },
            async all() {
              return { results: stmt.all(...params) };
            },
            async first() {
              return stmt.get(...params);
            },
            async raw() {
              return stmt.all(...params).map((row) => Object.values(row as object));
            },
          };
        },
      };
    },
  } as unknown as D1Database;
}

describe("recordSiteView", () => {
  it("正常系: 初回はview_countが1になる", async () => {
    /* Arrange */
    const db = createFakeD1Database();

    /* Act */
    const count = await recordSiteView(db);

    /* Assert */
    expect(count).toBe(1);
  });

  it("正常系: 呼ぶたびにview_countが1ずつ増える", async () => {
    /* Arrange */
    const db = createFakeD1Database();
    await recordSiteView(db);
    await recordSiteView(db);

    /* Act */
    const count = await recordSiteView(db);

    /* Assert */
    expect(count).toBe(3);
  });
});

describe("getViewsDatabaseBinding", () => {
  it("正常系: cloudflare:workersのenvにVIEWS_DBがあればそれを返す", async () => {
    /* Arrange */
    const fakeDb = createFakeD1Database();
    vi.doMock("cloudflare:workers", () => ({ env: { VIEWS_DB: fakeDb } }));
    const { getViewsDatabaseBinding: getBindingWithMock } = await import("../view-count");

    /* Act */
    const db = await getBindingWithMock();

    /* Assert */
    expect(db).toBe(fakeDb);
    vi.doUnmock("cloudflare:workers");
  });

  it("異常系: cloudflare:workersが存在しないランタイムではundefinedを返す", async () => {
    /* Arrange */
    // vitestはプレーンなNode環境なので、cloudflare:workersは元々解決できない。

    /* Act */
    const db = await getViewsDatabaseBinding();

    /* Assert */
    expect(db).toBeUndefined();
  });
});
