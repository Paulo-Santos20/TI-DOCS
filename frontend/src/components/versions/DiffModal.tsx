import { useMemo } from 'react'
import { diffWords, diffLines } from 'diff'
import { useEscape } from '../../hooks/useEscape'

interface DiffModalProps {
  oldText: string
  newText: string
  oldLabel: string
  newLabel: string
  onClose: () => void
}

interface DiffPart {
  value: string
  added?: boolean
  removed?: boolean
}

export default function DiffModal({ oldText, newText, oldLabel, newLabel, onClose }: DiffModalProps) {
  useEscape(onClose)
  const wordDiff = useMemo(() => diffWords(oldText, newText), [oldText, newText])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="rounded-2xl shadow-2xl w-full max-w-4xl max-h-[80vh] flex flex-col mx-4"
        style={{ background: 'var(--bg-card)' }}
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--glass-border-strong)' }}>
          <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Comparar Versões</h2>
          <button onClick={onClose}
            className="text-xl leading-none"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--text-secondary)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>&times;</button>
        </div>

        <div className="flex gap-2 px-4 pt-3 pb-2">
          <span className="text-xs font-medium px-2 py-1 rounded"
            style={{ background: 'var(--red-50)', color: 'var(--red-700)' }}>{oldLabel}</span>
          <span className="text-xs font-medium px-2 py-1 rounded"
            style={{ background: 'var(--health-50)', color: 'var(--health-600)' }}>{newLabel}</span>
        </div>

        <div className="flex-1 overflow-auto p-4 font-mono text-sm leading-relaxed">
          {wordDiff.map((part: DiffPart, i) => {
            const bgStyle = part.added
              ? { background: 'var(--health-50)', color: 'var(--health-600)' }
              : part.removed
              ? { background: 'var(--red-50)', color: 'var(--red-700)', textDecoration: 'line-through' }
              : {}
            return (
              <span key={i} className="rounded px-0.5" style={bgStyle}>
                {part.value}
              </span>
            )
          })}
        </div>

        <div className="p-4 border-t flex justify-end" style={{ borderColor: 'var(--glass-border-strong)' }}>
          <button onClick={onClose} className="btn-secondary text-sm">
            Fechar
          </button>
        </div>
      </div>
    </div>
  )
}
