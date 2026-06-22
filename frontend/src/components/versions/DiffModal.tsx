import { useMemo } from 'react'
import { diffWords, diffLines } from 'diff'

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
  const wordDiff = useMemo(() => diffWords(oldText, newText), [oldText, newText])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[80vh] flex flex-col mx-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-800">Comparar Versões</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl leading-none">&times;</button>
        </div>

        <div className="flex gap-2 px-4 pt-3 pb-2">
          <span className="text-xs font-medium px-2 py-1 rounded bg-red-100 text-red-700">{oldLabel}</span>
          <span className="text-xs font-medium px-2 py-1 rounded bg-green-100 text-green-700">{newLabel}</span>
        </div>

        <div className="flex-1 overflow-auto p-4 font-mono text-sm leading-relaxed">
          {wordDiff.map((part: DiffPart, i) => {
            const classes = [
              part.added ? 'bg-green-100 text-green-800' : '',
              part.removed ? 'bg-red-100 text-red-800 line-through' : '',
              'rounded px-0.5',
            ].join(' ')
            return (
              <span key={i} className={classes}>
                {part.value}
              </span>
            )
          })}
        </div>

        <div className="p-4 border-t border-slate-200 flex justify-end">
          <button onClick={onClose}
            className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 text-sm font-medium transition-colors">
            Fechar
          </button>
        </div>
      </div>
    </div>
  )
}
