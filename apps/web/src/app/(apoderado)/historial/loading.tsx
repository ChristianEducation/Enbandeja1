function SkeletonBlock({ className = "" }: { className?: string }) {
  return <div className={`rounded-xl bg-border-subtle ${className}`} />
}

export default function HistorialLoading() {
  return (
    <main className="min-h-screen bg-background px-5 py-6 pb-24">
      <div className="mx-auto max-w-2xl animate-pulse space-y-5">
        <div className="space-y-2">
          <SkeletonBlock className="h-7 w-40" />
          <SkeletonBlock className="h-4 w-56 max-w-full" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <SkeletonBlock className="h-24" />
          <SkeletonBlock className="h-24" />
        </div>
        <section className="space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="rounded-xl border border-border bg-surface-glass p-4 shadow-glass"
            >
              <SkeletonBlock className="mb-3 h-5 w-40" />
              <SkeletonBlock className="mb-2 h-4 w-full" />
              <SkeletonBlock className="h-4 w-2/3" />
            </div>
          ))}
        </section>
      </div>
    </main>
  )
}
