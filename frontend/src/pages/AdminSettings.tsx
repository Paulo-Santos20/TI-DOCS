import { useState, useEffect } from 'react'
import AdminTabs from '../components/admin/AdminTabs'
import { CardSkeleton } from '../components/ui/Skeleton'
import api from '../lib/api'
import { useToast } from '../contexts/ToastContext'

export default function AdminSettings() {
  const { addToast } = useToast()
  const [config, setConfig] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [key, setKey] = useState('')
  const [value, setValue] = useState('')
  const [saved, setSaved] = useState(false)

  const load = () => {
    setLoading(true)
    api.get('/settings').then(({ data }) => {
      const map: Record<string, string> = {}
      for (const s of data) map[s.key] = s.value || ''
      setConfig(map)
    }).catch(() => addToast('Erro ao carregar configurações', 'error')).finally(() => setLoading(false))
  }

  useEffect(load, [])

  const handleSave = async () => {
    try {
      await api.put('/settings', { config })
      addToast('Configurações salvas', 'success')
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch {
      addToast('Erro ao salvar configurações', 'error')
    }
  }

  const handleAdd = () => {
    if (!key.trim()) return
    setConfig(prev => ({ ...prev, [key]: value }))
    setKey('')
    setValue('')
  }

  const handleRemove = (k: string) => {
    const next = { ...config }
    delete next[k]
    setConfig(next)
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Administração</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Gerencie usuários, setores e documentos</p>
      </div>
      <AdminTabs />

      <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Configurações do Sistema</h2>

      <div className="max-w-xl space-y-4">
        {loading ? (
          <div className="grid gap-4">
            {[1,2,3].map(i => <CardSkeleton key={i} />)}
          </div>
        ) : (
          Object.entries(config).map(([k, v]) => (
            <div key={k} className="card flex items-center justify-between gap-4">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{k}</p>
                <p className="text-sm truncate" style={{ color: 'var(--text-muted)' }}>{v}</p>
              </div>
              <button onClick={() => handleRemove(k)} className="text-xs shrink-0 transition-colors"
                style={{ color: 'var(--red-500)' }}
                onMouseEnter={e => { e.currentTarget.style.textDecoration = 'underline' }}
                onMouseLeave={e => { e.currentTarget.style.textDecoration = 'none' }}>
                Remover
              </button>
            </div>
          ))
        )}

        <div className="card flex items-end gap-3">
          <div className="flex-1">
            <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Chave</label>
            <input value={key} onChange={e => setKey(e.target.value)}
              className="glass-input w-full px-3 py-2 text-sm" />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Valor</label>
            <input value={value} onChange={e => setValue(e.target.value)}
              className="glass-input w-full px-3 py-2 text-sm" />
          </div>
          <button onClick={handleAdd} className="btn-primary text-sm shrink-0">Adicionar</button>
        </div>

        <div className="flex items-center gap-4">
          <button onClick={handleSave} className="btn-primary">Salvar Configurações</button>
          {saved && <span className="text-sm" style={{ color: 'var(--health-600)' }}>Configurações salvas!</span>}
        </div>
      </div>
    </div>
  )
}
