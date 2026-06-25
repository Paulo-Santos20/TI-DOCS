import { useState, useRef, useEffect } from 'react'
import { downloadCSV, printReport } from '../../lib/export'
import { Download, FileSpreadsheet, Printer, ChevronUp, ChevronDown } from 'lucide-react'
import { useEscape } from '../../hooks/useEscape'

interface ExportButtonProps {
  csvData: () => { filename: string; headers: string[]; rows: string[][] }
  reportTitle: string
}

export default function ExportButton({ csvData, reportTitle }: ExportButtonProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEscape(() => setOpen(false), open)

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleCSV = () => {
    const { filename, headers, rows } = csvData()
    downloadCSV(filename, headers, rows)
    setOpen(false)
  }

  const handlePrint = () => {
    printReport(reportTitle)
    setOpen(false)
  }

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(!open)} className="btn-primary text-sm flex items-center gap-2">
        <Download size={16} />
        <span>Exportar</span>
        <span className="opacity-60">{open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-48 glass-elevated rounded-xl z-30 py-1">
          <button onClick={handleCSV}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors"
            style={{ color: 'var(--text-primary)' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--slate-100)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}>
            <FileSpreadsheet size={16} style={{ color: 'var(--health-500)' }} />
            <span>Baixar CSV</span>
          </button>
          <button onClick={handlePrint}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors"
            style={{ color: 'var(--text-primary)' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--slate-100)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}>
            <Printer size={16} style={{ color: 'var(--text-secondary)' }} />
            <span>Imprimir</span>
          </button>
        </div>
      )}
    </div>
  )
}
