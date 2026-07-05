function SkeletonBlock({ className = "" }: { className?: string }) {
  return <div className={`rounded-xl bg-border-subtle ${className}`} />
}

export default function HomeLoading() {
  return (
    <main className="min-h-screen bg-background px-5 py-6 pb-24">
      <div className="mx-auto max-w-2xl animate-pulse space-y-5">
        <div className="space-y-2">
          <SkeletonBlock className="h-7 w-44" />
          <SkeletonBlock className="h-4 w-64 max-w-full" />
        </div>
        <section className="rounded-xl border border-border bg-surface-glass p-5 shadow-glass">
          <SkeletonBlock className="mb-4 h-5 w-36" />
          <div className="grid grid-cols-5 gap-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <SkeletonBlock key={index} className="h-16" />
            ))}
          </div>
        </section>
        <section className="rounded-xl border border-border bg-surface-glass p-5 shadow-glass">
          <SkeletonBlock className="mb-4 h-6 w-48" />
          <div className="space-y-3">
            <SkeletonBlock className="h-20" />
            <SkeletonBlock className="h-20" />
            <SkeletonBlock className="h-20" />
          </div>
        </section>
      </div>
    </main>
  )
}
