import "server-only";
import { createKnowledgeSourceFromEnv } from "../server/knowledge-source";
import {
  getKnowledge as getKnowledgeUseCase,
  getKnowledgeTree as getKnowledgeTreeUseCase,
  listKnowledge,
  searchKnowledge as searchKnowledgeUseCase,
} from "../server/use-cases";
import { presentKnowledge } from "../server/present-knowledge";
import { fetchSiteConfig } from "../server/site-config";
import {
  getViewsDatabaseBinding,
  recordSiteView as recordSiteViewInDb,
} from "../server/view-count";
import type { Knowledge, KnowledgeTreeNode } from "../types/knowledge";

export { NotFoundError } from "../server/errors";
export type { SiteConfig } from "../server/site-config";

/**
 * ナレッジソース（GitHub、または設定が無ければサンプル）。プロセス内で使い回す。
 *
 * このファイルは`features/knowledge/server/**`への唯一の公開インターフェースであり、
 * `app/`配下や他のfeatureからは必ずここ経由でナレッジ機能を呼び出す
 * （ESLintの`no-restricted-imports`で強制している）。
 */
const source = createKnowledgeSourceFromEnv(process.env);

/**
 * ナレッジ記事の一覧を取得する（order昇順、同順位はタイトルの辞書順）。
 */
export async function getKnowledgeList(): Promise<Knowledge[]> {
  const articles = await listKnowledge(source);
  return articles.map(presentKnowledge);
}

/**
 * ナレッジ記事を1件取得する。
 *
 * @param id 記事ID。
 * @throws {NotFoundError} IDに一致する記事が存在しない場合。
 */
export async function getKnowledge(id: string): Promise<Knowledge> {
  const article = await getKnowledgeUseCase(source, id);
  return presentKnowledge(article);
}

/**
 * Wikiサイドバー用のカテゴリ/記事ツリーを取得する。
 */
export async function getKnowledgeTree(): Promise<KnowledgeTreeNode[]> {
  return getKnowledgeTreeUseCase(source);
}

/**
 * キーワードとタグでナレッジ記事を検索する。
 *
 * @param params `q`（キーワード、部分一致）と`tag`（完全一致）。どちらも省略可。
 */
export async function searchKnowledge(params: {
  q?: string;
  tag?: string;
}): Promise<Knowledge[]> {
  const articles = await searchKnowledgeUseCase(source, params);
  return articles.map(presentKnowledge);
}

/**
 * サイトのブランディング設定（タイトル・サブタイトル・ロゴ文字列）を取得する。
 */
export async function getSiteConfig() {
  return fetchSiteConfig(process.env);
}

/**
 * 全記事に付与されているタグを重複なく・辞書順で取得する
 * （検索フォームのタグ選択肢に使う）。
 */
export async function getAllTags(): Promise<string[]> {
  const articles = await listKnowledge(source);
  const tags = new Set<string>();
  for (const article of articles) {
    for (const tag of article.toProps().tags) {
      tags.add(tag);
    }
  }
  return [...tags].sort();
}

/**
 * サイト全体のアクセス数を1増やし、更新後の値を返す。
 *
 * Cloudflare D1（vinext経由）が使えないランタイム（プレーンな`next dev`/`next build`など）
 * では何もせずundefinedを返す。
 */
export async function recordSiteView(): Promise<number | undefined> {
  const db = await getViewsDatabaseBinding();
  if (db === undefined) {
    return undefined;
  }
  return recordSiteViewInDb(db);
}
