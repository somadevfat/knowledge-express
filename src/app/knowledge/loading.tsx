/**
 * `/knowledge`のローディングUI（スケルトン表示）。
 */
export default function KnowledgeLoading() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white px-5 py-4">
        <div className="mx-auto max-w-7xl">
          <div className="h-6 w-40 animate-pulse rounded bg-slate-200" />
          <div className="mt-2 h-4 w-72 animate-pulse rounded bg-slate-100" />
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl gap-5 px-5 py-5 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="rounded border border-slate-200 bg-white p-3">
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="h-6 animate-pulse rounded bg-slate-100"
              />
            ))}
          </div>
        </aside>
        <section className="grid gap-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-28 animate-pulse rounded border border-slate-200 bg-white"
            />
          ))}
        </section>
      </main>
    </div>
  );
}
