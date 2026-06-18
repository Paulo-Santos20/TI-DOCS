import { useState } from 'react'

export interface FilterState {
  sector: string
  person: string
  period: string
  status: string
}

interface ReportFiltersProps {
  sectors: string[]
  people: string[]
  isAdmin: boolean
  onFilter: (filters: FilterState) => void
}

const PERIOD_OPTIONS = [
  { value: '7d', label: 'Últimos 7 dias' },
  { value: '30d', label: 'Últimos 30 dias' },
  { value: '90d', label: 'Últimos 90 dias' },
  { value: 'all', label: 'Todo período' },
]

const STATUS_OPTIONS = [
  { value: 'all', label: 'Todos' },
  { value: 'completed', label: 'Concluídos' },
  { value: 'pending', label: 'Pendentes' },
]

export default function ReportFilters({ sectors, people, isAdmin, onFilter }: ReportFiltersProps) {
  const [filters, setFilters] = useState<FilterState>({
    sector: 'all',
    person: 'all',
    period: '30d',
    status: 'all',
  })

  const apply = () => onFilter(filters)

  const clear = () => {
    const cleared: FilterState = { sector: 'all', person: 'all', period: '30d', status: 'all' }
    setFilters(cleared)
    onFilter(cleared)
  }

  return (
    <div className="flex flex-wrap items-end gap-3 p-4 bg-white rounded-2xl border border-slate-200 shadow-sm mb-6">
      {isAdmin && (
        <>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Setor</label>
            <select
              value={filters.sector}
              onChange={e => setFilters(f => ({ ...f, sector: e.target.value }))}
              className="px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white focus:border-clinical-500 focus:ring-2 focus:ring-clinical-200 outline-none"
            >
              <option value="all">Todos os setores</option>
              {sectors.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Pessoa</label>
            <select
              value={filters.person}
              onChange={e => setFilters(f => ({ ...f, person: e.target.value }))}
              className="px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white focus:border-clinical-500 focus:ring-2 focus:ring-clinical-200 outline-none"
            >
              <option value="all">Todas as pessoas</option>
              {people.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        </>
      )}

      <div>
        <label className="block text-xs font-medium text-slate-500 mb-1">Período</label>
        <select
          value={filters.period}
          onChange={e => setFilters(f => ({ ...f, period: e.target.value }))}
          className="px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white focus:border-clinical-500 focus:ring-2 focus:ring-clinical-200 outline-none"
        >
          {PERIOD_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-500 mb-1">Status</label>
        <select
          value={filters.status}
          onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}
          className="px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white focus:border-clinical-500 focus:ring-2 focus:ring-clinical-200 outline-none"
        >
          {STATUS_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
      </div>

      <button onClick={apply} className="btn-primary text-sm !py-2">
        Aplicar Filtros
      </button>
      <button onClick={clear} className="btn-secondary text-sm !py-2">
        Limpar
      </button>
    </div>
  )
}
