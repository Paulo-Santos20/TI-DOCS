import { useNavigate, useLocation } from 'react-router-dom'

const tabs = [
  { path: '/admin', label: 'Visão Geral', icon: '📊' },
  { path: '/admin/usuarios', label: 'Usuários', icon: '👥' },
  { path: '/admin/setores', label: 'Setores', icon: '🏢' },
  { path: '/admin/categorias', label: 'Categorias', icon: '📁' },
  { path: '/admin/atribuicoes', label: 'Atribuições', icon: '📋' },
  { path: '/admin/auditoria', label: 'Auditoria', icon: '📝' },
  { path: '/admin/configuracoes', label: 'Configurações', icon: '⚙️' },
]

export default function AdminTabs() {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <div className="flex gap-1 mb-6 p-1 bg-slate-100 rounded-xl w-fit">
      {tabs.map(tab => (
        <button
          key={tab.path}
          onClick={() => navigate(tab.path)}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
            location.pathname === tab.path
              ? 'bg-clinical-600 text-white shadow-md'
              : 'text-slate-600 hover:text-slate-800 hover:bg-slate-200/50 dark:hover:bg-white/5'
          }`}
        >
          <span>{tab.icon}</span>
          <span>{tab.label}</span>
        </button>
      ))}
    </div>
  )
}
