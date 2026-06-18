import { useState } from 'react'
import AdminTabs from '../components/admin/AdminTabs'

export default function AdminSettings() {
  const [config, setConfig] = useState({
    institutionName: 'Hospital Municipal',
    logoUrl: '',
    primaryColor: '#0C4A6E',
    language: 'pt-BR',
  })
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Administração</h1>
        <p className="text-slate-500 mt-1">Gerencie usuários, setores e documentos</p>
      </div>

      <AdminTabs />

      <h2 className="text-lg font-semibold text-slate-700 mb-4">Configurações do Sistema</h2>

      <div className="max-w-xl">
        <div className="card space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nome da Instituição</label>
            <input type="text" value={config.institutionName} onChange={e => setConfig(f => ({ ...f, institutionName: e.target.value }))}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-clinical-500 focus:ring-2 focus:ring-clinical-200 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">URL do Logo</label>
            <input type="text" value={config.logoUrl} onChange={e => setConfig(f => ({ ...f, logoUrl: e.target.value }))}
              placeholder="https://exemplo.com/logo.png"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-clinical-500 focus:ring-2 focus:ring-clinical-200 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Cor Primária</label>
            <div className="flex items-center gap-3">
              <input type="color" value={config.primaryColor} onChange={e => setConfig(f => ({ ...f, primaryColor: e.target.value }))}
                className="w-10 h-10 rounded-lg border border-slate-200 cursor-pointer" />
              <span className="text-sm text-slate-500">{config.primaryColor}</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Idioma</label>
            <select value={config.language} onChange={e => setConfig(f => ({ ...f, language: e.target.value }))}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none bg-white">
              <option value="pt-BR">Português (Brasil)</option>
              <option value="en">English</option>
              <option value="es">Español</option>
            </select>
          </div>

          <div className="flex items-center gap-4 pt-2">
            <button onClick={handleSave} className="btn-primary">Salvar Configurações</button>
            {saved && <span className="text-sm text-health-600">Configurações salvas!</span>}
          </div>
        </div>
      </div>
    </div>
  )
}
