/**
 * `/search`のローディングUI（スケルトン表示）。
 */
export default function SearchLoading() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white px-5 py-4">
        <div className="mx-auto max-w-5xl">
          <div className="h-4 w-32 animate-pulse rounded bg-slate-100" />
          <div className="mt-3 h-8 w-24 animate-pulse rounded bg-slate-200" />
          <div className="mt-4 h-10 animate-pulse rounded bg-slate-100" />
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5 py-5">
        <div className="grid gap-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-28 animate-pulse rounded border border-slate-200 bg-white"
            />
          ))}
        </div>
      </main>
    </div>
  );
}
