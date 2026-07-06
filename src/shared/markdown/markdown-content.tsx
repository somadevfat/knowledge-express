import ReactMarkdown from "react-markdown";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeHighlight from "rehype-highlight";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import { expandCodeEmbeds } from "./github-embed";

type MarkdownContentProps = {
  content: string;
};

/**
 * 記事本文（Markdown）を表示するコンポーネント。
 *
 * 表示前に`embed:`コードフェンスを実際のGitHubコードへ展開し（{@link expandCodeEmbeds}）、
 * GFM記法・見出しのアンカーリンク・シンタックスハイライトを適用してレンダリングする。
 */
export async function MarkdownContent({ content }: MarkdownContentProps) {
  const expanded = await expandCodeEmbeds(content, process.env.GITHUB_TOKEN);

  return (
    <article className="markdown-body">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[
          rehypeSlug,
          [rehypeAutolinkHeadings, { behavior: "wrap" }],
          rehypeHighlight,
        ]}
        components={{
          a: ({ children, href }) => (
            <a
              className="font-medium text-sky-700 underline decoration-sky-200 hover:text-sky-900"
              href={href}
              target={href?.startsWith("http") ? "_blank" : undefined}
              rel={href?.startsWith("http") ? "noreferrer" : undefined}
            >
              {children}
            </a>
          ),
          code: ({ children, className }) => (
            <code className={className}>{children}</code>
          ),
        }}
      >
        {expanded}
      </ReactMarkdown>
    </article>
  );
}
