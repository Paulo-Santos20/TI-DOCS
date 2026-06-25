interface Props {
  className?: string
  lines?: number
}

export default function Skeleton({ className = '', lines = 1 }: Props) {
  if (lines > 1) {
    return (
      <div className="space-y-3">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={`h-4 rounded-lg animate-shimmer ${i === lines - 1 ? 'w-3/4' : 'w-full'} ${className}`}
          />
        ))}
      </div>
    )
  }

  return <div className={`rounded-lg animate-shimmer ${className}`} />
}

export function CardSkeleton() {
  return (
    <div className="card animate-shimmer">
      <div className="h-4 rounded w-1/3 mb-3" style={{ background: 'var(--glass-clear)' }} />
      <div className="h-8 rounded w-1/4 mb-2" style={{ background: 'var(--glass-clear)' }} />
      <div className="h-3 rounded w-1/2" style={{ background: 'var(--glass-clear)' }} />
    </div>
  )
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="card p-0 overflow-hidden animate-shimmer">
      <div className="px-6 py-4 border-b" style={{ borderColor: 'var(--glass-border-strong)' }}>
        <div className="flex gap-8">
          <div className="h-4 rounded w-1/4" style={{ background: 'var(--glass-clear)' }} />
          <div className="h-4 rounded w-1/6" style={{ background: 'var(--glass-clear)' }} />
          <div className="h-4 rounded w-12" style={{ background: 'var(--glass-clear)' }} />
          <div className="h-4 rounded w-20" style={{ background: 'var(--glass-clear)' }} />
          <div className="h-4 rounded w-24" style={{ background: 'var(--glass-clear)' }} />
        </div>
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="px-6 py-4 border-b last:border-0"
          style={{ borderColor: 'var(--glass-border-strong)' }}>
          <div className="flex gap-8">
            <div className="h-4 rounded w-1/3" style={{ background: 'var(--glass-clear)' }} />
            <div className="h-4 rounded w-1/6" style={{ background: 'var(--glass-clear)' }} />
            <div className="h-4 rounded w-12" style={{ background: 'var(--glass-clear)' }} />
            <div className="h-6 rounded-full w-20" style={{ background: 'var(--glass-clear)' }} />
            <div className="h-4 rounded w-24" style={{ background: 'var(--glass-clear)' }} />
          </div>
        </div>
      ))}
    </div>
  )
}
