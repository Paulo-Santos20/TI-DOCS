import { useState } from 'react'
import api from '../../lib/api'
import { useToast } from '../../contexts/ToastContext'
import { X } from 'lucide-react'
import { useEscape } from '../../hooks/useEscape'

interface Sector { id: number; name: string }

interface Props {
  sectors: Sector[]
  onClose: () => void
  onCreated: () => void
}

export default function CreateTrilhaModal({ sectors, onClose, onCreated }: Props) {
  useEscape(onClose)
  const { addToast } = useToast()
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    name: '',
    sectorId: 0,
    description: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || form.name.length < 2) return
    setSubmitting(true)
    try {
      await api.post('/categories', {
        name: form.name,
        description: form.description || undefined,
        sectorId: form.sectorId > 0 ? form.sectorId : undefined,
      })
      addToast('Trilha criada com sucesso', 'success')
      onCreated()
      onClose()
    } catch (err: any) {
      addToast(err?.response?.data?.error || 'Erro ao criar trilha', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0, 0, 0, 0.3)', backdropFilter: 'blur(8px)' }}>
      <div className="glass-elevated rounded-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Nova Trilha</h3>
          <button onClick={onClose} className="transition-colors"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-secondary)' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Nome da Trilha</label>
            <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="glass-input w-full px-3 py-2"
              placeholder="Ex: Segurança do Trabalho" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Setor</label>
            <select value={form.sectorId} onChange={e => setForm(f => ({ ...f, sectorId: parseInt(e.target.value) }))}
              className="glass-input w-full px-3 py-2">
              <option value={0}>Todos os setores</option>
              {sectors.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              Documentos criados nesta trilha herdarão este setor automaticamente
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Descrição</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              className="glass-input w-full px-3 py-2 text-sm" rows={3}
              placeholder="Descreva o propósito desta trilha..." />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
            <button type="submit" disabled={submitting}
              className="btn-primary flex-1">{submitting ? 'Criando...' : 'Criar Trilha'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
