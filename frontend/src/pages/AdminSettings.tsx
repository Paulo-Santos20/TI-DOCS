import { useState, useEffect } from 'react'
import AdminTabs from '../components/admin/AdminTabs'
import api from '../lib/api'

export default function AdminSettings() {
  const [config, setConfig] = useState<Record<string, string>>({})
  const [key, setKey] = useState('')
  const [value, setValue] = useState('')
  const [saved, setSaved] = useState(false)

  const load = () => {
    api.get('/settings').then(({ data }) => {
      const map: Record<string, string> = {}
      for (const s of data) map[s.key] = s.value || ''
      setConfig(map)
    }).catch(() => {})
  }

  useEffect(load, [])

  const handleSave = async () => {
    try {
      await api.put('/settings', { config })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch {}
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
        <h1 className="text-2xl font-bold text-slate-800">Administração</h1>
        <p className="text-slate-500 mt-1">Gerencie usuários, setores e documentos</p>
      </div>
      <AdminTabs />

      <h2 className="text-lg font-semibold text-slate-700 mb-4">Configurações do Sistema</h2>

      <div className="max-w-xl space-y-4">
        {Object.entries(config).map(([k, v]) => (
          <div key={k} className="card flex items-center justify-between gap-4">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-slate-700">{k}</p>
              <p className="text-sm text-slate-400 truncate">{v}</p>
            </div>
            <button onClick={() => handleRemove(k)} className="text-xs text-red-500 hover:underline shrink-0">
              Remover
            </button>
          </div>
        ))}

        <div className="card flex items-end gap-3">
          <div className="flex-1">
            <label className="block text-xs font-medium text-slate-500 mb-1">Chave</label>
            <input value={key} onChange={e => setKey(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none text-sm" />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-medium text-slate-500 mb-1">Valor</label>
            <input value={value} onChange={e => setValue(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none text-sm" />
          </div>
          <button onClick={handleAdd} className="btn-primary text-sm shrink-0">Adicionar</button>
        </div>

        <div className="flex items-center gap-4">
          <button onClick={handleSave} className="btn-primary">Salvar Configurações</button>
          {saved && <span className="text-sm text-health-600">Configurações salvas!</span>}
        </div>
      </div>
    </div>
  )
}
