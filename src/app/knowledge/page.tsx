import type { Metadata } from "next";
import {
  getKnowledgeList,
  getKnowledgeTree,
  getSiteConfig,
} from "@/features/knowledge/api/knowledge-api";
import { KnowledgeList } from "@/features/knowledge/components/knowledge-list";
import { WikiTree } from "@/features/wiki/components/wiki-tree";
import { Search } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "記事一覧",
  description: "GitHubで管理しているナレッジ記事の一覧です。",
};

export default async function KnowledgePage() {
  const [articles, tree, siteConfig] = await Promise.all([
    getKnowledgeList(),
    getKnowledgeTree(),
    getSiteConfig(),
  ]);
  const tags = [...new Set(articles.flatMap((article) => article.tags))].sort();

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white px-5 py-4">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 md:flex-row md:items-center">
          <div>
            <h1 className="text-xl font-semibold text-slate-950">
              {siteConfig.logoText}
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              {siteConfig.subtitle}
            </p>
          </div>
          <form action="/search" className="flex items-center gap-2 md:ml-auto md:w-[30rem]">
            <label className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                name="q"
                className="h-10 w-full rounded border border-slate-300 bg-white pl-9 pr-3 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                placeholder="記事を検索"
              />
            </label>
            <select
              name="tag"
              defaultValue=""
              className="h-10 shrink-0 rounded border border-slate-300 bg-white px-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
            >
              <option value="">すべてのタグ</option>
              {tags.map((tag) => (
                <option key={tag} value={tag}>
                  {tag}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="h-10 shrink-0 rounded bg-slate-950 px-3 text-sm font-medium text-white hover:bg-slate-800"
            >
              検索
            </button>
          </form>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl gap-5 px-5 py-5 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="rounded border border-slate-200 bg-white p-3">
          <div className="mb-3 px-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Wiki
          </div>
          <WikiTree nodes={tree} />
        </aside>
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-700">
              すべての記事
            </h2>
            <span className="text-sm text-slate-500">{articles.length}件</span>
          </div>
          <KnowledgeList articles={articles} />
        </section>
      </main>
    </div>
  );
}
