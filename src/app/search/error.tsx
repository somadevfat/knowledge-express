"use client";

import Link from "next/link";
import { AlertTriangle } from "lucide-react";

/**
 * `/search`のエラーバウンダリ。GitHubからの記事取得失敗時に表示する。
 */
export default function SearchError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-5">
      <div className="max-w-md rounded border border-slate-200 bg-white p-6 text-center">
        <AlertTriangle className="mx-auto h-8 w-8 text-amber-500" />
        <h1 className="mt-3 text-lg font-semibold text-slate-950">
          検索できませんでした
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          GitHubからの記事取得に失敗しました。時間をおいて再度お試しください。
        </p>
        <p className="mt-1 text-xs text-slate-400">{error.message}</p>
        <div className="mt-5 flex justify-center gap-2">
          <button
            onClick={() => unstable_retry()}
            className="rounded bg-slate-950 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            再読み込み
          </button>
          <Link
            href="/knowledge"
            className="rounded border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            一覧へ戻る
          </Link>
        </div>
      </div>
    </div>
  );
}
