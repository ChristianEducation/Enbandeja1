function SkeletonBlock({ className = "" }: { className?: string }) {
  return <div className={`rounded-xl bg-border-subtle ${className}`} />
}

export default function MenuLoading() {
  return (
    <main className="min-h-screen bg-background p-6">
      <div className="animate-pulse space-y-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <SkeletonBlock className="h-8 w-48" />
            <SkeletonBlock className="h-4 w-72 max-w-full" />
          </div>
          <SkeletonBlock className="h-11 w-40" />
        </div>
        <section className="rounded-xl border border-border bg-surface-glass p-5 shadow-glass">
          <div className="mb-5 grid grid-cols-7 gap-2">
            {Array.from({ length: 7 }).map((_, index) => (
              <SkeletonBlock key={index} className="h-10" />
            ))}
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <SkeletonBlock key={index} className="h-28" />
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
