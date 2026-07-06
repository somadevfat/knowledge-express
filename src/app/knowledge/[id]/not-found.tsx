import Link from "next/link";
import { FileQuestion } from "lucide-react";

/**
 * 記事詳細ページの404 UI（`notFound()`が呼ばれたときに表示される）。
 */
export default function KnowledgeDetailNotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-5">
      <div className="max-w-md rounded border border-slate-200 bg-white p-6 text-center">
        <FileQuestion className="mx-auto h-8 w-8 text-slate-400" />
        <h1 className="mt-3 text-lg font-semibold text-slate-950">
          記事が見つかりません
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          指定された記事は存在しないか、移動または削除された可能性があります。
        </p>
        <div className="mt-5 flex justify-center">
          <Link
            href="/knowledge"
            className="rounded bg-slate-950 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            一覧へ戻る
          </Link>
        </div>
      </div>
    </div>
  );
}
