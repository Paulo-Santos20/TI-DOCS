import { useState } from 'react'
import { X } from 'lucide-react'
import { useEscape } from '../../hooks/useEscape'

interface SectorFormModalProps {
  onClose: () => void
  onSave: (name: string) => void
}

export default function SectorFormModal({ onClose, onSave }: SectorFormModalProps) {
  useEscape(onClose)
  const [name, setName] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setSubmitting(true)
    try {
      await onSave(name.trim())
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0, 0, 0, 0.3)', backdropFilter: 'blur(8px)' }}>
      <div className="glass-elevated rounded-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Novo Setor</h3>
          <button onClick={onClose} className="transition-colors"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-secondary)' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Nome do Setor</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)}
              placeholder="Ex: Farmácia"
              className="glass-input w-full px-3 py-2" required />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
            <button type="submit" disabled={submitting} className="btn-primary flex-1">{submitting ? 'Criando...' : 'Criar'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
