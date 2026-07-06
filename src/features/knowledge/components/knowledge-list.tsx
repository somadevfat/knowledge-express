import Link from "next/link";
import { ArrowRight, Tag } from "lucide-react";
import type { Knowledge } from "../types/knowledge";

type KnowledgeListProps = {
  articles: Knowledge[];
};

export function KnowledgeList({ articles }: KnowledgeListProps) {
  if (articles.length === 0) {
    return (
      <div className="rounded border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
        記事がありません。
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {articles.map((article) => (
        <Link
          key={article.id}
          href={`/knowledge/${article.id}`}
          className="group rounded border border-slate-200 bg-white p-4 hover:border-sky-200 hover:bg-sky-50/50"
        >
          <div className="flex items-start gap-3">
            <div className="min-w-0 flex-1">
              <div className="mb-1 text-xs font-medium text-slate-500">
                {article.category}
              </div>
              <h2 className="text-base font-semibold text-slate-950">
                {article.title}
              </h2>
              <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">
                {article.excerpt}
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {article.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-1 text-xs text-slate-600"
                  >
                    <Tag className="h-3 w-3" />
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-slate-400 group-hover:text-sky-700" />
          </div>
        </Link>
      ))}
    </div>
  );
}
