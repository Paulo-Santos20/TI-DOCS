import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import api from '../lib/api'
import CreateDocumentModal from '../components/documents/CreateDocumentModal'

interface Template { id: number; title: string; contentJson: any; sectorId: number; createdAt: string }

const MOCK_TEMPLATES: Template[] = [
  { id: 1, title: 'POP Padrão', contentJson: { text: '[Insira o procedimento aqui]' }, sectorId: 1, createdAt: new Date().toISOString() },
  { id: 2, title: 'Relatório de Incidente', contentJson: { text: '## Relatório\n\n**Data:** \n**Envolvidos:** \n\n### Descrição\n\n' }, sectorId: 1, createdAt: new Date().toISOString() },
]

export default function Templates() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'
  const navigate = useNavigate()
  const [templates, setTemplates] = useState<Template[]>(MOCK_TEMPLATES)
  const [showCreate, setShowCreate] = useState(false)

  const createFromTemplate = (t: Template) => {
    navigate('/documentos', { state: { fromTemplate: t } })
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Modelos de Documento</h1>
        {isAdmin && <button onClick={() => setShowCreate(true)} className="btn-primary text-sm">+ Novo Modelo</button>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map(t => (
          <div key={t.id} className="card hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => createFromTemplate(t)}>
            <div className="flex items-start gap-3 mb-3">
              <span className="text-2xl">📄</span>
              <div>
                <h3 className="font-semibold text-slate-700">{t.title}</h3>
                <p className="text-xs text-slate-400 mt-0.5">Criado em {new Date(t.createdAt).toLocaleDateString('pt-BR')}</p>
              </div>
            </div>
            <p className="text-xs text-slate-400 line-clamp-2">
              {t.contentJson?.text ? t.contentJson.text.slice(0, 100) : 'Sem conteúdo'}
            </p>
            <div className="mt-3 flex gap-2">
              <button onClick={(e) => { e.stopPropagation(); createFromTemplate(t) }}
                className="text-xs px-3 py-1.5 bg-clinical-50 text-clinical-600 rounded-lg hover:bg-clinical-100 transition-colors">
              Usar Modelo
            </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
