export type FrontmatterValue = string | string[];

/**
 * `---`区切りのfrontmatterブロックとMarkdown本文を分離する。
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

function stripQuotes(value: string): string {
  return value.replace(/^["']|["']$/g, "");
}
