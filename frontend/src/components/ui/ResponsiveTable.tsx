import { ReactNode } from 'react'

interface ResponsiveTableColumn {
  key: string
  label: string
  render: (item: any) => ReactNode
  hideOnMobile?: boolean
}

interface ResponsiveTableProps {
  columns: ResponsiveTableColumn[]
  data: any[]
  rowKey: (item: any) => string | number
  mobileCardTitle?: (item: any) => ReactNode
  emptyMessage?: string
  emptyColSpan?: number
}

export default function ResponsiveTable({ columns, data, rowKey, mobileCardTitle, emptyMessage, emptyColSpan }: ResponsiveTableProps) {
  if (data.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{emptyMessage || 'Nenhum registro encontrado'}</p>
      </div>
    )
  }

  return (
    <>
      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--glass-border-strong)' }}>
              {columns.map(col => (
                <th key={col.key}
                  className="text-left px-6 py-4 text-sm font-medium"
                  style={{ color: 'var(--text-secondary)' }}>
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map(item => (
              <tr key={rowKey(item)}
                style={{ borderBottom: '1px solid var(--glass-border-strong)' }}
                className="transition-colors"
                onMouseEnter={e => { e.currentTarget.style.background = 'color-mix(in srgb, var(--color-white) 30%, transparent)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}>
                {columns.map(col => (
                  <td key={col.key} className={`px-6 py-4 text-sm ${col.hideOnMobile ? 'hidden' : ''}`}
                    style={{ color: 'var(--text-secondary)' }}>
                    {col.render(item)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {data.map(item => (
          <div key={rowKey(item)} className="card p-4 space-y-2">
            {mobileCardTitle && (
              <div className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                {mobileCardTitle(item)}
              </div>
            )}
            {columns.filter(col => !col.hideOnMobile).map(col => (
              <div key={col.key} className="flex items-center justify-between text-sm">
                <span style={{ color: 'var(--text-muted)' }}>{col.label}</span>
                <span style={{ color: 'var(--text-secondary)' }}>{col.render(item)}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </>
  )
}
