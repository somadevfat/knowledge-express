import "server-only";
import { parseFrontmatterBlock, type FrontmatterValue } from "./frontmatter";
import { type GitHubEnv, normalizeRepositoryName, readOptionalEnv } from "./knowledge-source";

/**
 * サイトのブランディング設定（`site.md`から読み込む、または既定値）。
 */
export type SiteConfig = {
  title: string;
  subtitle: string;
  logoText: string;
};

/**
 * `site.md`が無い・取得に失敗したときに使うフォールバック値。
 */
export const DEFAULT_SITE_CONFIG: SiteConfig = {
  title: "SE WIKI",
  subtitle: "実務で使える設計からデプロイまで、すべて解説する",
  logoText: "SE WIKI",
};

const SITE_CONFIG_PATH = "site.md";

/**
 * 参照先GitHubリポジトリ直下の`site.md`からサイトのブランディング設定を取得する。
 *
 * ファイルが無い・取得に失敗した場合はデフォルト設定にフォールバックする。
 */
export async function fetchSiteConfig(env: GitHubEnv): Promise<SiteConfig> {
  const owner = readOptionalEnv(env.GITHUB_OWNER);
  const repo = normalizeRepositoryName(readOptionalEnv(env.GITHUB_REPOSITORY));

  if (owner === undefined || repo === undefined) {
    return DEFAULT_SITE_CONFIG;
  }

  const branch = readOptionalEnv(env.GITHUB_BRANCH) ?? "main";
  const token = readOptionalEnv(env.GITHUB_TOKEN);

  try {
    const url = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${SITE_CONFIG_PATH}`;
    const response = await fetch(url, {
      headers: {
        "User-Agent": "se-wiki-frontend",
        ...(token === undefined ? {} : { Authorization: `Bearer ${token}` }),
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return DEFAULT_SITE_CONFIG;
    }

    const { frontmatter } = parseFrontmatterBlock(await response.text());

    return {
      title: pickString(frontmatter.title) ?? DEFAULT_SITE_CONFIG.title,
      subtitle: pickString(frontmatter.subtitle) ?? DEFAULT_SITE_CONFIG.subtitle,
      logoText: pickString(frontmatter.logoText) ?? DEFAULT_SITE_CONFIG.logoText,
    };
  } catch {
    return DEFAULT_SITE_CONFIG;
  }
}

/**
 * frontmatterの値が空でない文字列であればそれを返す。配列や空文字列はundefined扱い。
 */
function pickString(value: FrontmatterValue | undefined): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed.length === 0 ? undefined : trimmed;
}
