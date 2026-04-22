export function SkeletonBlock({ className = '' }) {
  return <div className={`skeleton ${className}`} />
}

export function SkeletonText({ lines = 3 }) {
  return (
    <div className="flex flex-col gap-2.5">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="skeleton h-4"
          style={{ width: i === lines - 1 ? '60%' : '100%' }}
        />
      ))}
    </div>
  )
}

export function SkeletonCard() {
  return (
    <div className="border border-gray-200 rounded-xl p-6">
      <SkeletonBlock className="h-5 w-32 mb-4" />
      <SkeletonText lines={4} />
    </div>
  )
}

export function AnalysisSkeleton() {
  return (
    <div className="space-y-6 animate-in">
      <div className="flex items-center gap-4">
        <SkeletonBlock className="w-[140px] h-[140px] rounded-full" />
        <div className="flex-1 space-y-3">
          <SkeletonBlock className="h-5 w-40" />
          <SkeletonText lines={2} />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </div>
  )
}
