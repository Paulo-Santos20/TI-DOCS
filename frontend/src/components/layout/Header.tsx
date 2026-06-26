import { useState } from 'react'
import { useNavigate, NavLink } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import ConfirmDialog from '../ui/ConfirmDialog'
import NotificationBell from '../ui/NotificationBell'
import ThemeToggle from '../ui/ThemeToggle'
import { LayoutDashboard, FileText, User, Settings, LogOut, Menu, X, ChevronDown } from 'lucide-react'

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/documentos', label: 'Documentos', icon: FileText },
  { path: '/perfil', label: 'Perfil', icon: User },
]

export default function Header() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [confirmLogout, setConfirmLogout] = useState(false)

  const items = user?.role === 'admin'
    ? [...navItems, { path: '/admin', label: 'Admin', icon: Settings }]
    : navItems

  return (
    <>
      <header className="sticky top-0 z-40 glass border-b" style={{ borderColor: 'var(--glass-border-strong)' }}>
        <div className="max-w-7xl mx-auto px-4 lg:px-8 h-16 flex items-center gap-4">
          <div className="flex items-center gap-3 shrink-0">
            <button onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 rounded-xl transition-colors"
              style={{ color: 'var(--text-secondary)' }}
              aria-label="Abrir menu">
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <NavLink to="/" className="flex items-center gap-2 shrink-0">
              <img src="/logo.webp" alt="TI DOCS" className="h-8" />
            </NavLink>
          </div>
          <nav className="hidden lg:flex items-center gap-1 flex-1 justify-center">
            {items.map(item => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-xl transition-all duration-200 ${
                      isActive
                        ? 'bg-clinical-50 text-clinical-700'
                        : 'hover:bg-white/40'
                    }`
                  }
                  style={({ isActive }) => ({
                    color: isActive ? undefined : 'var(--text-secondary)',
                  })}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </NavLink>
              )
            })}
          </nav>

          <div className="flex items-center gap-3 shrink-0">
            <ThemeToggle />
            <NotificationBell />
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all duration-200 hover:bg-white/40"
                style={{ color: 'var(--text-secondary)' }}
                aria-label="Perfil"
              >
                <div className="w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center shrink-0 glass-strong"
                  style={{ color: 'var(--clinical-600)' }}>
                  {user?.avatarUrl ? (
                    <img src={user.avatarUrl} alt="" className="w-full h-full object-cover rounded-full" />
                  ) : (
                    user?.name?.charAt(0) || '?'
                  )}
                </div>
                <span className="hidden lg:block text-sm font-medium">{user?.name}</span>
                <ChevronDown size={14} className="hidden lg:block" />
              </button>
              {profileOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 z-20 w-56 glass-elevated rounded-xl p-2 shadow-lg"
                    style={{ border: '1px solid var(--glass-border-strong)' }}>
                    <div className="px-3 py-2 border-b mb-1" style={{ borderColor: 'var(--glass-border-strong)' }}>
                      <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{user?.name}</p>
                      <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{user?.email}</p>
                    </div>
                    <button onClick={() => { navigate('/perfil'); setProfileOpen(false) }}
                      className="w-full text-left px-3 py-2 text-sm rounded-lg transition-colors hover:bg-white/40"
                      style={{ color: 'var(--text-secondary)' }}>
                      <User size={16} className="inline mr-2" />Meu Perfil
                    </button>
                    <button onClick={() => { setProfileOpen(false); setConfirmLogout(true) }}
                      className="w-full text-left px-3 py-2 text-sm rounded-lg transition-colors hover:bg-white/40 text-red-500">
                      <LogOut size={16} className="inline mr-2" />Sair
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {mobileOpen && (
          <div className="lg:hidden border-t" style={{ borderColor: 'var(--glass-border-strong)' }}>
            <nav className="px-4 py-3 space-y-1">
              {items.map(item => {
                const Icon = item.icon
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-all ${
                        isActive ? 'bg-clinical-50 text-clinical-700' : ''
                      }`
                    }
                    style={({ isActive }) => ({
                      color: isActive ? undefined : 'var(--text-secondary)',
                    })}
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </NavLink>
                )
              })}
            </nav>
          </div>
        )}
      </header>

      <ConfirmDialog
        open={confirmLogout}
        title="Sair"
        message="Deseja realmente sair?"
        confirmLabel="Sair"
        variant="warning"
        onConfirm={() => { setConfirmLogout(false); logout() }}
        onCancel={() => setConfirmLogout(false)}
      />
    </>
  )
}
