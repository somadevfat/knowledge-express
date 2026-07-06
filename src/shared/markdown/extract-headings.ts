export type MarkdownHeading = {
  id: string;
  depth: number;
  text: string;
};

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

function slugifyHeading(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[`*_()[\]{}]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^\p{Letter}\p{Number}-]/gu, "");
}
