import { AlertTriangle } from 'lucide-react'
import { useEscape } from '../../hooks/useEscape'

interface ConfirmDialogProps {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'warning'
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmDialog({ open, title, message, confirmLabel, cancelLabel, variant = 'danger', onConfirm, onCancel }: ConfirmDialogProps) {
  useEscape(onCancel, open)
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.3)' }}
      onClick={onCancel}>
      <div className="glass-elevated rounded-2xl p-6 max-w-sm w-full" style={{ border: '1px solid var(--glass-border-strong)' }}
        onClick={e => e.stopPropagation()}>
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{
              background: variant === 'danger'
                ? 'color-mix(in srgb, var(--red-500) 15%, transparent)'
                : 'color-mix(in srgb, var(--amber-500) 15%, transparent)'
            }}>
            <AlertTriangle size={20}
              style={{ color: variant === 'danger' ? 'var(--red-500)' : 'var(--amber-500)' }} />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>{title}</h3>
            <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>{message}</p>
            <div className="flex gap-3 justify-end">
              <button onClick={onCancel} className="btn-secondary text-sm">{cancelLabel || 'Cancelar'}</button>
              <button onClick={onConfirm}
                className="px-4 py-2.5 rounded-xl font-medium text-sm text-white transition-all duration-200"
                style={{
                  background: variant === 'danger'
                    ? 'linear-gradient(135deg, var(--red-600), var(--red-500))'
                    : 'linear-gradient(135deg, var(--amber-600), var(--amber-500))'
                }}>
                {confirmLabel || 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
