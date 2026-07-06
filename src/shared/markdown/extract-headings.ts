/**
 * 記事本文から抽出した見出し1件（目次表示に使う）。
 */
export type MarkdownHeading = {
  id: string;
  depth: number;
  text: string;
};

/**
 * Markdown本文からh2/h3見出しを抽出する。h1・それ以外の深さの見出しは無視する。
 *
 * @param markdown 記事本文（Markdown）。
 * @returns 出現順の見出し一覧。見出しが無ければ空配列。
 */
export function extractHeadings(markdown: string): MarkdownHeading[] {
  return markdown
    .split("\n")
    .map((line) => /^(#{2,3})\s+(.+)$/.exec(line.trim()))
    .filter((match): match is RegExpExecArray => match !== null)
    .map((match) => ({
      id: slugifyHeading(match[2]),
      depth: match[1].length,
      text: match[2].replace(/[`*_]/g, "").trim(),
    }));
}

/**
 * 見出しテキストを、目次のアンカーリンク（`#slug`）に使えるスラッグへ変換する。
 * `rehype-slug`が本文側に振るidと一致させるための実装。
 */
function slugifyHeading(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[`*_()[\]{}]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^\p{Letter}\p{Number}-]/gu, "");
}
