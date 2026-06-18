import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../lib/api'

interface Version {
  id: number; version: number; contentJson: any
  authorId: number; changeDescription: string | null
  createdAt: string
}

export default function DocumentVersions() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [versions, setVersions] = useState<Version[]>([])
  const [selectedA, setSelectedA] = useState<number | null>(null)
  const [selectedB, setSelectedB] = useState<number | null>(null)

  useEffect(() => {
    if (id) api.get(`/documents/${id}/versions`).then(({ data }) => {
      setVersions(data)
      if (data.length >= 2) {
        setSelectedA(data[1].id)
        setSelectedB(data[0].id)
      }
    }).catch(() => navigate('/documentos'))
  }, [id])

  const getContentPreview = (v: Version) => {
    if (v.contentJson?.text) return v.contentJson.text.slice(0, 200)
    return JSON.stringify(v.contentJson).slice(0, 200)
  }

  return (
    <div className="max-w-4xl mx-auto">
      <button onClick={() => navigate(`/documentos/${id}`)}
        className="text-sm text-slate-400 hover:text-slate-600 mb-4 flex items-center gap-1 transition-colors">
        ← Voltar
      </button>

      <h1 className="text-2xl font-bold text-slate-800 mb-6">Histórico de Versões</h1>

      <div className="space-y-3">
        {versions.map(v => (
          <div key={v.id} className="card">
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
                  {getContentPreview(v)}...
                </div>
              </div>
            </div>
          </div>
        ))}
        {versions.length === 0 && (
          <p className="text-sm text-slate-400 text-center py-12">Nenhuma versão encontrada</p>
        )}
      </div>
    </div>
  )
}
