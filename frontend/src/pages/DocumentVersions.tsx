import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../lib/api'
import DiffModal from '../components/versions/DiffModal'

interface Version {
  id: number; version: number; contentJson: any
  authorId: number; changeDescription: string | null
  createdAt: string
}

function getText(v: Version): string {
  if (v.contentJson?.text) return v.contentJson.text
  if (typeof v.contentJson === 'string') return v.contentJson
  return JSON.stringify(v.contentJson)
}

export default function DocumentVersions() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [versions, setVersions] = useState<Version[]>([])
  const [selectedA, setSelectedA] = useState<number | null>(null)
  const [selectedB, setSelectedB] = useState<number | null>(null)
  const [showDiff, setShowDiff] = useState(false)

  useEffect(() => {
    if (id) api.get(`/documents/${id}/versions`).then(({ data }) => {
      setVersions(data)
      if (data.length >= 2) {
        setSelectedA(data[1].id)
        setSelectedB(data[0].id)
      }
    }).catch(() => navigate('/documentos'))
  }, [id])

  const getPreview = (v: Version) => getText(v).slice(0, 200)

  const selA = versions.find(v => v.id === selectedA)
  const selB = versions.find(v => v.id === selectedB)

  return (
    <div className="max-w-4xl mx-auto">
      <button onClick={() => navigate(`/documentos/${id}`)}
        className="text-sm text-slate-400 hover:text-slate-600 mb-4 flex items-center gap-1 transition-colors">
        ← Voltar
      </button>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Histórico de Versões</h1>
        {versions.length >= 2 && (
          <button onClick={() => setShowDiff(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors">
            Comparar Selecionadas
          </button>
        )}
      </div>

      <div className="space-y-3">
        {versions.map(v => (
          <div key={v.id} className={`card border-2 transition-colors ${selectedA === v.id || selectedB === v.id ? 'border-blue-400' : 'border-transparent'}`}>
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold text-slate-700">Versão {v.version}</span>
                  <span className="text-xs text-slate-400">
                    {new Date(v.createdAt).toLocaleDateString('pt-BR')} às {new Date(v.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                {v.changeDescription && (
                  <p className="text-xs text-slate-500 mb-2 italic">{v.changeDescription}</p>
                )}
                <div className="text-xs text-slate-400 bg-slate-50 rounded-lg p-3 max-h-20 overflow-hidden">
                  {getPreview(v)}...
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <label className={`flex items-center gap-1 px-2 py-1 rounded text-xs cursor-pointer ${selectedA === v.id ? 'bg-red-100 text-red-700' : 'hover:bg-slate-100'}`}>
                  <input type="radio" name="versionA" checked={selectedA === v.id}
                    onChange={() => { setSelectedA(v.id); if (selectedB === v.id) setSelectedB(null) }} />
                  A
                </label>
                <label className={`flex items-center gap-1 px-2 py-1 rounded text-xs cursor-pointer ${selectedB === v.id ? 'bg-green-100 text-green-700' : 'hover:bg-slate-100'}`}>
                  <input type="radio" name="versionB" checked={selectedB === v.id}
                    onChange={() => { setSelectedB(v.id); if (selectedA === v.id) setSelectedA(null) }} />
                  B
                </label>
              </div>
            </div>
          </div>
        ))}
        {versions.length === 0 && (
          <p className="text-sm text-slate-400 text-center py-12">Nenhuma versão encontrada</p>
        )}
      </div>

      {showDiff && selA && selB && (
        <DiffModal
          oldText={getText(selA)}
          newText={getText(selB)}
          oldLabel={`Versão ${selA.version} (A)`}
          newLabel={`Versão ${selB.version} (B)`}
          onClose={() => setShowDiff(false)}
        />
      )}
    </div>
  )
}
