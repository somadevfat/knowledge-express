import "server-only";

type ParsedGitHubBlobUrl = {
  owner: string;
  repo: string;
  ref: string;
  path: string;
  startLine?: number;
  endLine?: number;
};

const GITHUB_BLOB_URL_PATTERN =
  /^https:\/\/github\.com\/([^/]+)\/([^/]+)\/blob\/([^/]+)\/([^#]+?)(?:#L(\d+)(?:-L(\d+))?)?$/;

const EMBED_FENCE_PATTERN = /```embed:(\S+)[ \t]*\r?\n[\s\S]*?```/g;

const LANGUAGE_BY_EXTENSION: Record<string, string> = {
  ts: "typescript",
  tsx: "tsx",
  js: "javascript",
  jsx: "jsx",
  json: "json",
  py: "python",
  go: "go",
  rb: "ruby",
  java: "java",
  yaml: "yaml",
  yml: "yaml",
  md: "markdown",
  css: "css",
  html: "html",
  sh: "bash",
};

/**
 * Markdown本文中の``` embed:<GitHubパーマリンク> ```フェンスを、実際にGitHubから
 * 取得したコードのフェンスへ展開する。
 *
 * パーマリンク（`blob/<commit sha>/...`）を前提としており、常に書いた時点の
 * コードを指す。取得に失敗した場合はエラー内容をコードフェンスとして埋め込む。
 */
export async function expandCodeEmbeds(
  markdown: string,
  githubToken: string | undefined,
): Promise<string> {
  const matches = [...markdown.matchAll(EMBED_FENCE_PATTERN)];
  if (matches.length === 0) {
    return markdown;
  }

  const replacements = await Promise.all(
    matches.map((match) => renderEmbed(match[1].trim(), githubToken)),
  );

  let result = "";
  let cursor = 0;
  matches.forEach((match, index) => {
    const start = match.index ?? 0;
    result += markdown.slice(cursor, start) + replacements[index];
    cursor = start + match[0].length;
  });
  result += markdown.slice(cursor);

  return result;
}

async function renderEmbed(
  url: string,
  githubToken: string | undefined,
): Promise<string> {
  const parsed = parseGitHubBlobUrl(url);
  if (parsed === undefined) {
    return codeFence(
      "text",
      `[embed error] Not a GitHub blob URL: ${url}`,
    );
  }

  try {
    const rawUrl = `https://raw.githubusercontent.com/${parsed.owner}/${parsed.repo}/${parsed.ref}/${parsed.path}`;
    const response = await fetch(rawUrl, {
      headers: {
        "User-Agent": "se-wiki-frontend",
        ...(githubToken === undefined
          ? {}
          : { Authorization: `Bearer ${githubToken}` }),
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return codeFence(
        "text",
        `[embed error] Failed to fetch ${parsed.owner}/${parsed.repo}/${parsed.path} (status=${response.status})`,
      );
    }

    const fullText = await response.text();
    const lines = fullText.split("\n");
    const selectedLines =
      parsed.startLine === undefined
        ? lines
        : lines.slice(parsed.startLine - 1, parsed.endLine ?? parsed.startLine);

    const language = inferLanguage(parsed.path);
    const lineSuffix =
      parsed.startLine === undefined
        ? ""
        : `#L${parsed.startLine}${parsed.endLine === undefined ? "" : `-L${parsed.endLine}`}`;
    const caption = `${parsed.owner}/${parsed.repo} — ${parsed.path}${lineSuffix}`;

    return `_[${caption}](${url})_\n\n${codeFence(language, selectedLines.join("\n"))}`;
  } catch {
    return codeFence("text", `[embed error] Could not reach GitHub for ${url}`);
  }
}

function parseGitHubBlobUrl(url: string): ParsedGitHubBlobUrl | undefined {
  const match = GITHUB_BLOB_URL_PATTERN.exec(url);
  if (match === null) {
    return undefined;
  }

  const [, owner, repo, ref, path, startLine, endLine] = match;
  return {
    owner,
    repo,
    ref,
    path,
    startLine: startLine === undefined ? undefined : Number(startLine),
    endLine: endLine === undefined ? undefined : Number(endLine),
  };
}

function inferLanguage(path: string): string {
  const extension = path.split(".").pop()?.toLowerCase() ?? "";
  return LANGUAGE_BY_EXTENSION[extension] ?? "text";
}

function codeFence(language: string, code: string): string {
  return "```" + language + "\n" + code + "\n```";
}
