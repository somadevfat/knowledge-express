import { DomainError } from "./errors";
import { parseFrontmatterBlock } from "./frontmatter";

export type KnowledgeId = string;

/**
 * ナレッジ記事Entityが内部に保持する値。
 */
export type KnowledgeProps = {
  id: KnowledgeId;
  title: string;
  body: string;
  excerpt: string;
  tags: string[];
  category: string;
  path: string;
  order: number;
  sourceUrl: string;
  updatedAt?: Date;
};

/**
 * GitHubから取得したMarkdown文書1件分の生データ（Entity生成前の入力）。
 */
export type KnowledgeSourceDocument = {
  path: string;
  content: string;
  sourceUrl: string;
  updatedAt?: Date;
};

/**
 * Markdown frontmatterから読み取れる、記事メタ情報の任意項目。
 */
type Frontmatter = {
  id?: string;
  title?: string;
  excerpt?: string;
  category?: string;
  tags?: string[];
  order?: number;
};

/**
 * GitHub上のMarkdownから作られるナレッジ記事Entity。
 *
 * Markdown/frontmatter由来の記事がアプリ内で扱える状態かを保証する。
 */
export class Knowledge {
  /**
   * 外部からは呼び出せない。{@link Knowledge.fromSourceDocument}経由でのみ生成する。
   */
  private constructor(private readonly props: KnowledgeProps) {}

  /**
   * GitHubなど外部ソースから取得したMarkdown文書をナレッジEntityへ変換する。
   *
   * @param document 外部ソースから取得したMarkdown文書。
   * @returns Markdown文書から生成したナレッジEntity。
   * @throws {DomainError} 記事として必要な値が不足している場合。
   */
  static fromSourceDocument(document: KnowledgeSourceDocument): Knowledge {
    const parsed = parseMarkdown(document.content);
    const body = validateBody(parsed.body);
    const title = validateTitle(parsed.frontmatter.title ?? extractTitleFromBody(body) ?? basenameWithoutExtension(document.path));

    return new Knowledge({
      id: validateId(parsed.frontmatter.id ?? slugifyPath(document.path)),
      title,
      body,
      excerpt: validateExcerpt(parsed.frontmatter.excerpt ?? createExcerpt(body)),
      tags: normalizeTags(parsed.frontmatter.tags ?? []),
      category: validateCategory(parsed.frontmatter.category ?? categoryFromPath(document.path)),
      path: validatePath(document.path),
      order: parsed.frontmatter.order ?? 0,
      sourceUrl: validateSourceUrl(document.sourceUrl),
      updatedAt: document.updatedAt === undefined ? undefined : new Date(document.updatedAt)
    });
  }

  /**
   * Entityをプレーンな値へ変換する。
   *
   * @returns 外部から直接変更されないようにコピーしたEntityの値。
   */
  toProps(): KnowledgeProps {
    return {
      ...this.props,
      tags: [...this.props.tags],
      updatedAt: this.props.updatedAt === undefined ? undefined : new Date(this.props.updatedAt)
    };
  }
}

/**
 * Markdown文書をfrontmatterと本文に分解し、frontmatterの値を既知の項目へ変換する。
 *
 * @param content Markdown文書の生テキスト（frontmatterを含む）。
 */
function parseMarkdown(content: string): { frontmatter: Frontmatter; body: string } {
  const { frontmatter: raw, body } = parseFrontmatterBlock(content);
  const frontmatter: Frontmatter = {};

  if (typeof raw.id === "string") frontmatter.id = raw.id;
  if (typeof raw.title === "string") frontmatter.title = raw.title;
  if (typeof raw.excerpt === "string") frontmatter.excerpt = raw.excerpt;
  if (typeof raw.category === "string") frontmatter.category = raw.category;
  if (typeof raw.order === "string") frontmatter.order = Number(raw.order);
  if (Array.isArray(raw.tags)) {
    frontmatter.tags = raw.tags;
  } else if (typeof raw.tags === "string" && raw.tags.length > 0) {
    frontmatter.tags = raw.tags.split(",").map((tag) => tag.trim());
  }

  return { frontmatter, body };
}

/**
 * 記事IDが空でないことを検証する。
 *
 * @throws {DomainError} idが空文字列の場合。
 */
function validateId(id: string): string {
  const trimmed = id.trim();
  if (trimmed.length < 1) {
    throw new DomainError("Knowledge id is required.");
  }
  return trimmed;
}

/**
 * タイトルが空でなく、120文字以内であることを検証する。
 *
 * @throws {DomainError} titleが空、または120文字を超える場合。
 */
function validateTitle(title: string): string {
  const trimmed = title.trim();
  if (trimmed.length < 1) {
    throw new DomainError("Title is required.");
  }
  if (trimmed.length > 120) {
    throw new DomainError("Title must be 120 characters or less.");
  }
  return trimmed;
}

/**
 * 本文が空でないことを検証する。
 *
 * @throws {DomainError} bodyが空文字列の場合。
 */
function validateBody(body: string): string {
  const trimmed = body.trim();
  if (trimmed.length < 1) {
    throw new DomainError("Body is required.");
  }
  return trimmed;
}

/**
 * 抜粋を160文字以内に丸める（バリデーションエラーは投げない）。
 */
function validateExcerpt(excerpt: string): string {
  return excerpt.trim().slice(0, 160);
}

/**
 * カテゴリ名をトリムし、空であれば`"General"`にフォールバックする。
 */
function validateCategory(category: string): string {
  const trimmed = category.trim();
  return trimmed.length === 0 ? "General" : trimmed;
}

/**
 * GitHub上のファイルパスが空でないことを検証する。
 *
 * @throws {DomainError} pathが空文字列の場合。
 */
function validatePath(path: string): string {
  const trimmed = path.trim();
  if (trimmed.length < 1) {
    throw new DomainError("Path is required.");
  }
  return trimmed;
}

/**
 * GitHub上のソースURLが空でないことを検証する。
 *
 * @throws {DomainError} sourceUrlが空文字列の場合。
 */
function validateSourceUrl(sourceUrl: string): string {
  const trimmed = sourceUrl.trim();
  if (trimmed.length < 1) {
    throw new DomainError("Source URL is required.");
  }
  return trimmed;
}

/**
 * タグを小文字化・トリムし、重複を取り除く。
 */
function normalizeTags(tags: string[]): string[] {
  return [...new Set(tags.map((tag) => tag.trim().toLowerCase()).filter(Boolean))];
}

/**
 * frontmatterに`title`が無いとき、本文先頭の`# `見出しをタイトル代わりに使う。
 *
 * @returns 見つかった見出しテキスト。無ければundefined。
 */
function extractTitleFromBody(body: string): string | undefined {
  const heading = body.split("\n").find((line) => line.startsWith("# "));
  return heading?.replace(/^#\s+/, "").trim();
}

/**
 * frontmatterに`excerpt`が無いとき、本文最初の見出し以外の段落から抜粋を作る。
 * Markdown装飾記号を取り除き160文字に丸める。
 */
function createExcerpt(body: string): string {
  const paragraph = body
    .split("\n")
    .map((line) => line.trim())
    .find((line) => line.length > 0 && !line.startsWith("#"));

  return stripMarkdown(paragraph ?? body).slice(0, 160);
}

/**
 * 抜粋生成時に、Markdownの装飾記号（強調・見出し・リンク記号等）を取り除く。
 */
function stripMarkdown(value: string): string {
  return value.replace(/[`*_#[\]()]/g, "").trim();
}

/**
 * ファイルパスから拡張子`.md`を除いたファイル名部分を取り出す（title未指定時の最終フォールバック）。
 */
function basenameWithoutExtension(path: string): string {
  const basename = path.split("/").at(-1) ?? path;
  return basename.replace(/\.md$/i, "");
}

/**
 * frontmatterに`category`が無いとき、ファイルパスの親ディレクトリをカテゴリ名として使う。
 * ルート直下のファイルは`"General"`になる。
 */
function categoryFromPath(path: string): string {
  const parts = path.split("/").slice(0, -1);
  return parts.length === 0 ? "General" : parts.join("/");
}

/**
 * frontmatterに`id`が無いとき、ファイルパスからURLセーフなIDを生成する。
 */
function slugifyPath(path: string): string {
  return path
    .replace(/\.md$/i, "")
    .replace(/[^A-Za-z0-9/_-]+/g, "-")
    .replace(/\//g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}
