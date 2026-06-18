import { useState, useRef, useEffect } from 'react'
import { downloadCSV, printReport } from '../../lib/export'

interface ExportButtonProps {
  csvData: () => { filename: string; headers: string[]; rows: string[][] }
  reportTitle: string
}

export default function ExportButton({ csvData, reportTitle }: ExportButtonProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

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
        <span>📥</span>
        <span>Exportar</span>
        <span className="text-xs opacity-60">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-30">
          <button onClick={handleCSV} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
            <span>📄</span>
            <span>Baixar CSV</span>
          </button>
          <button onClick={handlePrint} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
            <span>🖨️</span>
            <span>Imprimir</span>
          </button>
        </div>
      )}
    </div>
  )
}
