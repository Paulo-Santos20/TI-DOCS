import { useNavigate, useLocation } from 'react-router-dom'
import { BarChart3, Users, Building2, FolderClosed, ClipboardList, ClipboardPenLine, Settings } from 'lucide-react'

const tabs = [
  { path: '/admin', label: 'Visão Geral', icon: BarChart3 },
  { path: '/admin/usuarios', label: 'Usuários', icon: Users },
  { path: '/admin/setores', label: 'Setores', icon: Building2 },
  { path: '/admin/categorias', label: 'Categorias', icon: FolderClosed },
  { path: '/admin/atribuicoes', label: 'Atribuições', icon: ClipboardList },
  { path: '/admin/auditoria', label: 'Auditoria', icon: ClipboardPenLine },
  { path: '/admin/configuracoes', label: 'Configurações', icon: Settings },
]

export default function AdminTabs() {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <div className="overflow-x-auto -mx-4 lg:mx-0 px-4 lg:px-0 mb-6">
      <div className="flex gap-1 p-1 rounded-xl w-fit glass-clear [mask-image:linear-gradient(to_right,black_90%,transparent_100%)]">
        {tabs.map(tab => {
          const active = location.pathname === tab.path
          const Icon = tab.icon
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className="flex items-center gap-2 px-3 lg:px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 whitespace-nowrap"
              style={{
                color: active ? '#fff' : 'var(--text-secondary)',
                background: active ? 'linear-gradient(135deg, var(--clinical-600), var(--clinical-500))' : 'transparent',
                boxShadow: active ? '0 1px 3px rgba(0,0,0,0.15)' : 'none',
              }}
              onMouseEnter={e => {
                if (!active) e.currentTarget.style.background = 'color-mix(in srgb, var(--color-white) 40%, transparent)'
              }}
              onMouseLeave={e => {
                if (!active) e.currentTarget.style.background = 'transparent'
              }}
            >
              <Icon size={18} />
              <span className="hidden lg:inline">{tab.label}</span>
              <span className="lg:hidden text-[11px]">{tab.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
