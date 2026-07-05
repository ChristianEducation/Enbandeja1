function SkeletonBlock({ className = "" }: { className?: string }) {
  return <div className={`rounded-xl bg-border-subtle ${className}`} />
}

export default function DashboardLoading() {
  return (
    <main className="min-h-screen bg-background p-6">
      <div className="animate-pulse space-y-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <SkeletonBlock className="h-8 w-56" />
            <SkeletonBlock className="h-4 w-80 max-w-full" />
          </div>
          <SkeletonBlock className="h-10 w-44" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <SkeletonBlock key={index} className="h-32" />
          ))}
        </div>
        <div className="grid gap-4 xl:grid-cols-2">
          <SkeletonBlock className="h-80" />
          <SkeletonBlock className="h-80" />
        </div>
      </div>
    </main>
  )
}
