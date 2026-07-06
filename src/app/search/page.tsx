import type { Metadata } from "next";
import Link from "next/link";
import { Search } from "lucide-react";
import {
  getAllTags,
  getSiteConfig,
  searchKnowledge,
} from "@/features/knowledge/api/knowledge-api";
import { KnowledgeList } from "@/features/knowledge/components/knowledge-list";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "検索",
  description: "ナレッジ記事をキーワードやタグで検索します。",
};

type SearchPageProps = {
  searchParams: Promise<{
    q?: string;
    tag?: string;
  }>;
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const q = params.q?.trim();
  const tag = params.tag?.trim();
  const [articles, siteConfig, tags] = await Promise.all([
    searchKnowledge({ q, tag }),
    getSiteConfig(),
    getAllTags(),
  ]);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white px-5 py-4">
        <div className="mx-auto max-w-5xl">
          <Link href="/knowledge" className="text-sm font-medium text-sky-700">
            {siteConfig.logoText}
          </Link>
          <h1 className="mt-3 text-2xl font-semibold text-slate-950">検索</h1>
          <form action="/search" className="mt-4 flex flex-col gap-2 md:flex-row">
            <label className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                name="q"
                defaultValue={q}
                className="h-10 w-full rounded border border-slate-300 bg-white pl-9 pr-3 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                placeholder="キーワード"
              />
            </label>
            <select
              name="tag"
              defaultValue={tag ?? ""}
              className="h-10 rounded border border-slate-300 bg-white px-3 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 md:w-56"
            >
              <option value="">すべてのタグ</option>
              {tags.map((tagOption) => (
                <option key={tagOption} value={tagOption}>
                  {tagOption}
                </option>
              ))}
            </select>
            <button className="h-10 rounded bg-slate-950 px-4 text-sm font-medium text-white hover:bg-slate-800">
              検索
            </button>
          </form>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5 py-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-700">検索結果</h2>
          <span className="text-sm text-slate-500">{articles.length}件</span>
        </div>
        <KnowledgeList articles={articles} />
      </main>
    </div>
  );
}
