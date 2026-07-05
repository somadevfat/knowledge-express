export default function KnowledgeDetailLoading() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="sticky top-0 z-20 h-14 border-b border-slate-200 bg-white" />
      <div className="grid min-h-[calc(100vh-3.5rem)] grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)_240px]">
        <aside className="border-b border-slate-200 bg-white p-3 lg:border-b-0 lg:border-r">
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="h-6 animate-pulse rounded bg-slate-100"
              />
            ))}
          </div>
        </aside>
        <main className="min-w-0 bg-white px-5 py-6 md:px-8 lg:px-10">
          <div className="mx-auto max-w-4xl">
            <div className="h-8 w-2/3 animate-pulse rounded bg-slate-200" />
            <div className="mt-4 h-4 w-1/2 animate-pulse rounded bg-slate-100" />
            <div className="mt-8 space-y-3">
              {Array.from({ length: 8 }).map((_, index) => (
                <div
                  key={index}
                  className="h-4 animate-pulse rounded bg-slate-100"
                />
              ))}
            </div>
          </div>
        </main>
        <aside className="hidden border-l border-slate-200 bg-slate-50 p-4 lg:block" />
      </div>
    </div>
  );
}
