import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import api from '../lib/api'
import { useToast } from '../contexts/ToastContext'

interface Result { id: number; title: string; status: string; version: number; sectorName: string; updatedAt: string }

export default function SearchResults() {
  const { addToast } = useToast()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const q = searchParams.get('q') || ''
  const [results, setResults] = useState<Result[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!q) { setLoading(false); return }
    setLoading(true)
    api.get('/search', { params: { q } }).then(({ data }) => setResults(data)).catch(() => addToast('Erro na busca', 'error'))
      .finally(() => setLoading(false))
  }, [q])

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Busca</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
          {loading ? 'Buscando...' : `${results.length} resultado${results.length !== 1 ? 's' : ''} para "${q}"`}
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: 'var(--clinical-600)' }} /></div>
      ) : results.length === 0 ? (
        <div className="text-center py-12">
          {!q ? (
            <>
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'color-mix(in srgb, var(--text-muted) 10%, transparent)' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-muted)' }}>
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
                </svg>
              </div>
              <p className="text-lg mb-2" style={{ color: 'var(--text-muted)' }}>Digite um termo para buscar</p>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Use o campo de busca acima para encontrar documentos</p>
            </>
          ) : (
            <>
              <p className="text-lg mb-2" style={{ color: 'var(--text-muted)' }}>Nenhum resultado encontrado</p>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Tente outros termos ou ajuste os filtros</p>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {results.map(doc => (
            <div key={doc.id} className="card hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigate(`/documentos/${doc.id}`)}>
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>{doc.title}</h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{doc.sectorName}</span>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>v{doc.version}</span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      doc.status === 'published' ? 'bg-health-50 text-health-600' : ''
                    }`} style={{ color: doc.status === 'published' ? undefined : 'var(--text-muted)', background: doc.status === 'published' ? undefined : 'color-mix(in srgb, var(--text-muted) 10%, transparent)' }}>
                      {doc.status === 'published' ? 'Publicado' : 'Rascunho'}
                    </span>
                  </div>
                </div>
                <span className="text-xs shrink-0" style={{ color: 'var(--text-muted)' }}>
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
