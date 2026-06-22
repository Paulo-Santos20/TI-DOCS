import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

const navItems = [
  { path: '/', label: 'Dashboard', icon: '📊', roles: ['admin', 'user'] },
  { path: '/documentos', label: 'Documentos', icon: '📄', roles: ['admin', 'user'] },
  { path: '/modelos', label: 'Modelos', icon: '📋', roles: ['admin', 'user'] },
  { path: '/relatorios', label: 'Relatórios', icon: '📈', roles: ['admin', 'user'] },
  { path: '/notificacoes', label: 'Notificações', icon: '🔔', roles: ['admin', 'user'] },
  { path: '/admin', label: 'Admin', icon: '⚙️', roles: ['admin'] },
]

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()

  const filteredItems = navItems.filter(item => item.roles.includes(user?.role || 'user'))

  return (
    <aside style={{ backgroundColor: 'var(--bg-sidebar)', borderColor: 'var(--border)' }}
      className={`${collapsed ? 'w-20' : 'w-60'} border-r flex flex-col transition-all duration-300 h-screen sticky top-0`}>
      <div className="p-4 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className={`flex items-center justify-center w-full ${collapsed ? 'justify-center' : 'gap-3'}`}>
          <img src="/logo.webp" alt="TI DOCS" className="w-28 h-8" />
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {filteredItems.map(item => {
          const active = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path))
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`sidebar-item w-full ${active ? 'sidebar-item-active' : 'sidebar-item-inactive'}`}
            >
              <span className="text-lg">{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </button>
          )
        })}
      </nav>

      <div className="p-3 border-t" style={{ borderColor: 'var(--border)' }}>
        {!collapsed && user && (
          <button onClick={() => navigate('/perfil')}
            className="w-full text-left px-3 py-2 text-sm rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-3">
            <div className="w-8 h-8 rounded-full overflow-hidden shrink-0"
              style={{ backgroundColor: user.avatarUrl ? 'transparent' : 'var(--clinical-600)' }}>
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold">
                  {user.name.charAt(0)}
                </div>
              )}
            </div>
            <div className="min-w-0">
              <p className="font-medium truncate" style={{ color: 'var(--text-primary)' }}>{user.name}</p>
              <p style={{ color: 'var(--text-secondary)' }} className="text-xs">{user.role === 'admin' ? 'Administrador' : 'Usuário'}</p>
            </div>
          </button>
        )}
        <button onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-xl text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all duration-200 border border-transparent hover:border-red-200 dark:hover:border-red-500/20 mt-1">
          <span>🚪</span>
          {!collapsed && <span>Sair</span>}
        </button>
      </div>

      <button onClick={() => setCollapsed(!collapsed)}
        className="p-3 text-xs border-t transition-colors"
        style={{ color: 'var(--text-muted)', borderColor: 'var(--border)' }}>
        {collapsed ? '→' : '←'}
      </button>
    </aside>
  )
}
