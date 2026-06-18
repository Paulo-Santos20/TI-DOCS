interface Props {
  className?: string
  lines?: number
}

export default function Skeleton({ className = '', lines = 1 }: Props) {
  if (lines > 1) {
    return (
      <div className="space-y-3">
        {Array.from({ length: lines }).map((_, i) => (
          <div key={i} className={`h-4 bg-slate-200 rounded-lg animate-pulse ${i === lines - 1 ? 'w-3/4' : 'w-full'}`} />
        ))}
      </div>
    )
  }

  return <div className={`bg-slate-200 rounded-lg animate-pulse ${className}`} />
}

export function CardSkeleton() {
  return (
    <div className="card animate-pulse">
      <div className="h-4 bg-slate-200 rounded w-1/3 mb-3" />
      <div className="h-8 bg-slate-200 rounded w-1/4 mb-2" />
      <div className="h-3 bg-slate-200 rounded w-1/2" />
    </div>
  )
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="card p-0 overflow-hidden animate-pulse">
      <div className="px-6 py-4 border-b border-slate-200">
        <div className="flex gap-8">
          <div className="h-4 bg-slate-200 rounded w-1/4" />
          <div className="h-4 bg-slate-200 rounded w-1/6" />
          <div className="h-4 bg-slate-200 rounded w-1/8" />
          <div className="h-4 bg-slate-200 rounded w-1/8" />
          <div className="h-4 bg-slate-200 rounded w-1/6" />
        </div>
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="px-6 py-4 border-b border-slate-200">
          <div className="flex gap-8">
            <div className="h-4 bg-slate-200 rounded w-1/3" />
            <div className="h-4 bg-slate-200 rounded w-1/6" />
            <div className="h-4 bg-slate-200 rounded w-12" />
            <div className="h-6 bg-slate-200 rounded-full w-20" />
            <div className="h-4 bg-slate-200 rounded w-24" />
          </div>
        </div>
      ))}
    </div>
  )
}
