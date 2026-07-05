import Link from "next/link";
import { ExternalLink, Search } from "lucide-react";
import type { Knowledge, KnowledgeTreeNode } from "@/features/knowledge/types/knowledge";
import { MarkdownContent } from "@/shared/markdown/markdown-content";
import { extractHeadings } from "@/shared/markdown/extract-headings";
import { WikiTree } from "./wiki-tree";

type WikiLayoutProps = {
  tree: KnowledgeTreeNode[];
  article: Knowledge;
};

export function WikiLayout({ tree, article }: WikiLayoutProps) {
  const headings = extractHeadings(article.body);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white">
        <div className="flex h-14 items-center gap-4 px-4">
          <Link href="/knowledge" className="font-semibold text-slate-950">
            Knowledge Wiki
          </Link>
          <form action="/search" className="ml-auto flex w-full max-w-md">
            <label className="relative w-full">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                name="q"
                className="h-9 w-full rounded border border-slate-300 bg-white pl-9 pr-3 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                placeholder="記事を検索"
              />
            </label>
          </form>
        </div>
      </header>

      <div className="grid min-h-[calc(100vh-3.5rem)] grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)_240px]">
        <aside className="border-b border-slate-200 bg-white p-3 lg:sticky lg:top-14 lg:h-[calc(100vh-3.5rem)] lg:overflow-y-auto lg:border-b-0 lg:border-r">
          <div className="mb-3 px-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Wiki
          </div>
          <WikiTree nodes={tree} activeId={article.id} />
        </aside>

        <main className="min-w-0 bg-white px-5 py-6 md:px-8 lg:px-10">
          <div className="mx-auto max-w-4xl">
            <div className="mb-6 border-b border-slate-200 pb-5">
              <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span>{article.category}</span>
                <span>/</span>
                <span>{article.path}</span>
              </div>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
                {article.title}
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
                {article.excerpt}
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                {article.tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/search?tag=${encodeURIComponent(tag)}`}
                    className="rounded border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-medium text-slate-700 hover:border-sky-200 hover:bg-sky-50 hover:text-sky-800"
                  >
                    {tag}
                  </Link>
                ))}
                <a
                  href={article.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="ml-auto inline-flex items-center gap-1 rounded border border-slate-300 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  GitHubで開く
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
            <MarkdownContent content={article.body} />
          </div>
        </main>

        <aside className="hidden border-l border-slate-200 bg-slate-50 p-4 lg:block">
          <div className="sticky top-18">
            <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
              目次
            </div>
            {headings.length === 0 ? (
              <p className="text-sm text-slate-500">見出しはありません。</p>
            ) : (
              <nav className="space-y-1">
                {headings.map((heading) => (
                  <a
                    key={heading.id}
                    href={`#${heading.id}`}
                    className={[
                      "block rounded py-1 text-sm text-slate-600 hover:text-sky-800",
                      heading.depth === 3 ? "pl-4" : "pl-0",
                    ].join(" ")}
                  >
                    {heading.text}
                  </a>
                ))}
              </nav>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
