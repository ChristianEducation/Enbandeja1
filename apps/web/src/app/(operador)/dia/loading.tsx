function SkeletonBlock({ className = "" }: { className?: string }) {
  return <div className={`rounded-xl bg-border-subtle ${className}`} />
}

export default function DiaLoading() {
  return (
    <main className="min-h-screen bg-background p-6">
      <div className="animate-pulse space-y-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <SkeletonBlock className="h-8 w-44" />
            <SkeletonBlock className="h-4 w-64 max-w-full" />
          </div>
          <SkeletonBlock className="h-11 w-36" />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <SkeletonBlock className="h-28" />
          <SkeletonBlock className="h-28" />
          <SkeletonBlock className="h-28" />
        </div>
        <section className="rounded-xl border border-border bg-surface-glass p-5 shadow-glass">
          <SkeletonBlock className="mb-5 h-10 w-full" />
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <SkeletonBlock key={index} className="h-16" />
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
