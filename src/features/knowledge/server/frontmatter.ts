/**
 * frontmatterの1項目の値。単純な文字列、またはYAMLのリスト記法（`- item`）由来の配列。
 */
export type FrontmatterValue = string | string[];

/**
 * `---`区切りのfrontmatterブロックとMarkdown本文を分離する。
 *
 * @param content Markdown文書の生テキスト。
 * @returns 解析したfrontmatter（キーごとの値）と、frontmatterを除いた本文。
 *   frontmatterブロックが無い、または終端の`---`が見つからない場合は
 *   `frontmatter: {}`・`body`は元のテキスト全体を返す。
 */
export function parseFrontmatterBlock(content: string): {
  frontmatter: Record<string, FrontmatterValue>;
  body: string;
} {
  if (!content.startsWith("---\n")) {
    return { frontmatter: {}, body: content.trim() };
  }

  const endIndex = content.indexOf("\n---", 4);
  if (endIndex === -1) {
    return { frontmatter: {}, body: content.trim() };
  }

  const frontmatterText = content.slice(4, endIndex).trim();
  const body = content.slice(endIndex + 4).trim();

  return { frontmatter: parseFrontmatterLines(frontmatterText), body };
}

/**
 * frontmatterブロック本文（`---`の中身）を1行ずつ`key: value`として解析する。
 * 値が空でその次の行から`- `で始まるリストが続く場合は、配列としてまとめて取り込む。
 *
 * @param text frontmatterブロックの中身（開始/終端の`---`を除いたテキスト）。
 */
function parseFrontmatterLines(text: string): Record<string, FrontmatterValue> {
  const result: Record<string, FrontmatterValue> = {};
  const lines = text.split("\n");

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index]?.trimEnd() ?? "";
    const match = /^([A-Za-z0-9_-]+):\s*(.*)$/.exec(line);
    if (match === null) {
      continue;
    }

    const key = match[1];
    const rawValue = stripQuotes(match[2].trim());

    if (rawValue === "") {
      const items: string[] = [];
      for (let itemIndex = index + 1; itemIndex < lines.length; itemIndex += 1) {
        const itemLine = lines[itemIndex]?.trim() ?? "";
        if (!itemLine.startsWith("- ")) {
          break;
        }
        items.push(stripQuotes(itemLine.slice(2).trim()));
        index = itemIndex;
      }
      if (items.length > 0) {
        result[key] = items;
        continue;
      }
    }

    result[key] = rawValue;
  }

  return result;
}

/**
 * 値を囲むシングル/ダブルクォートを取り除く（`title: "foo"`のような記法に対応）。
 */
function stripQuotes(value: string): string {
  return value.replace(/^["']|["']$/g, "");
}
