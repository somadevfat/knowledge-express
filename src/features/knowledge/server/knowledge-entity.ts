import { DomainError } from "./errors";
import { parseFrontmatterBlock } from "./frontmatter";

export type KnowledgeId = string;

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

export type KnowledgeSourceDocument = {
  path: string;
  content: string;
  sourceUrl: string;
  updatedAt?: Date;
};

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

function validateId(id: string): string {
  const trimmed = id.trim();
  if (trimmed.length < 1) {
    throw new DomainError("Knowledge id is required.");
  }
  return trimmed;
}

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

function validateBody(body: string): string {
  const trimmed = body.trim();
  if (trimmed.length < 1) {
    throw new DomainError("Body is required.");
  }
  return trimmed;
}

function validateExcerpt(excerpt: string): string {
  return excerpt.trim().slice(0, 160);
}

function validateCategory(category: string): string {
  const trimmed = category.trim();
  return trimmed.length === 0 ? "General" : trimmed;
}

function validatePath(path: string): string {
  const trimmed = path.trim();
  if (trimmed.length < 1) {
    throw new DomainError("Path is required.");
  }
  return trimmed;
}

function validateSourceUrl(sourceUrl: string): string {
  const trimmed = sourceUrl.trim();
  if (trimmed.length < 1) {
    throw new DomainError("Source URL is required.");
  }
  return trimmed;
}

function normalizeTags(tags: string[]): string[] {
  return [...new Set(tags.map((tag) => tag.trim().toLowerCase()).filter(Boolean))];
}

function extractTitleFromBody(body: string): string | undefined {
  const heading = body.split("\n").find((line) => line.startsWith("# "));
  return heading?.replace(/^#\s+/, "").trim();
}

function createExcerpt(body: string): string {
  const paragraph = body
    .split("\n")
    .map((line) => line.trim())
    .find((line) => line.length > 0 && !line.startsWith("#"));

  return stripMarkdown(paragraph ?? body).slice(0, 160);
}

function stripMarkdown(value: string): string {
  return value.replace(/[`*_#[\]()]/g, "").trim();
}

function basenameWithoutExtension(path: string): string {
  const basename = path.split("/").at(-1) ?? path;
  return basename.replace(/\.md$/i, "");
}

function categoryFromPath(path: string): string {
  const parts = path.split("/").slice(0, -1);
  return parts.length === 0 ? "General" : parts.join("/");
}

function slugifyPath(path: string): string {
  return path
    .replace(/\.md$/i, "")
    .replace(/[^A-Za-z0-9/_-]+/g, "-")
    .replace(/\//g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}
