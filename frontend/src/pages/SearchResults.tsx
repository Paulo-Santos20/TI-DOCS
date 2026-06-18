import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import api from '../lib/api'

interface Result { id: number; title: string; status: string; version: number; sectorName: string; updatedAt: string }

export default function SearchResults() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const q = searchParams.get('q') || ''
  const [results, setResults] = useState<Result[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!q) { setLoading(false); return }
    setLoading(true)
    api.get('/search', { params: { q } }).then(({ data }) => setResults(data)).catch(() => {})
      .finally(() => setLoading(false))
  }, [q])

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Busca</h1>
        <p className="text-slate-500 mt-1">
          {loading ? 'Buscando...' : `${results.length} resultado${results.length !== 1 ? 's' : ''} para "${q}"`}
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-clinical-600" /></div>
      ) : results.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-slate-400 text-lg mb-2">Nenhum resultado encontrado</p>
          <p className="text-slate-400 text-sm">Tente outros termos ou ajuste os filtros</p>
        </div>
      ) : (
        <div className="space-y-3">
          {results.map(doc => (
            <div key={doc.id} className="card hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigate(`/documentos/${doc.id}`)}>
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h3 className="font-semibold text-slate-700">{doc.title}</h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-slate-400">{doc.sectorName}</span>
                    <span className="text-xs text-slate-300">v{doc.version}</span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      doc.status === 'published' ? 'bg-health-50 text-health-600' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {doc.status === 'published' ? 'Publicado' : 'Rascunho'}
                    </span>
                  </div>
                </div>
                <span className="text-xs text-slate-400 shrink-0">
                  {new Date(doc.updatedAt).toLocaleDateString('pt-BR')}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
