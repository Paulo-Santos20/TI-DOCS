import { useState, useEffect } from 'react'
import { useNavigate, useLocation, NavLink } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import ConfirmDialog from '../ui/ConfirmDialog'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  FileText,
  FileBadge,
  BarChart3,
  Bell,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  User,
  X,
} from 'lucide-react'

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'user'] },
  { path: '/documentos', label: 'Documentos', icon: FileText, roles: ['admin', 'user'] },
  { path: '/modelos', label: 'Modelos', icon: FileBadge, roles: ['admin', 'user'] },
  { path: '/relatorios', label: 'Relatórios', icon: BarChart3, roles: ['admin', 'user'] },
  { path: '/notificacoes', label: 'Notificações', icon: Bell, roles: ['admin', 'user'] },
  { path: '/admin', label: 'Admin', icon: Settings, roles: ['admin'] },
]

interface SidebarProps {
  mobileOpen: boolean
  onMobileClose: () => void
}

export default function Sidebar({ mobileOpen, onMobileClose }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [confirmLogout, setConfirmLogout] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()

  useEffect(() => {
    onMobileClose()
  }, [location.pathname])

  const filteredItems = navItems.filter(item =>
    item.roles.includes(user?.role || 'user')
  )

  const sidebarContent = (
    <motion.aside
      animate={{ width: collapsed ? 72 : 240 }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      className="glass h-full flex flex-col overflow-hidden shrink-0 z-30"
      style={{ borderRight: '1px solid var(--glass-border-strong)' }}
    >
      <div className="p-4 h-16 flex items-center justify-center border-b shrink-0 relative"
        style={{ borderColor: 'var(--glass-border-strong)' }}>
        <AnimatePresence mode="wait">
          {collapsed ? (
            <motion.img
              key="compact"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15 }}
              src="/logo.webp"
              alt="TI DOCS"
              className="w-8 h-8"
            />
          ) : (
            <motion.img
              key="full"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15 }}
              src="/logo.webp"
              alt="TI DOCS"
              className="w-28 h-8"
            />
          )}
        </AnimatePresence>
        <button onClick={onMobileClose} className="absolute top-3 right-3 lg:hidden"
          style={{ color: 'var(--text-muted)' }}>
          <X size={18} />
        </button>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto overflow-x-hidden">
        {filteredItems.map(item => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `sidebar-item w-full ${isActive ? 'sidebar-item-active' : 'sidebar-item-inactive'}`}
              title={collapsed ? item.label : undefined}
            >
              <Icon size={20} className="shrink-0" />
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="truncate"
                >
                  {item.label}
                </motion.span>
              )}
            </NavLink>
          )
        })}
      </nav>

      <div className="p-3 border-t shrink-0"
        style={{ borderColor: 'var(--glass-border-strong)' }}>
        <AnimatePresence>
          {!collapsed && user && (
            <motion.button
              key="profile"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.15 }}
              onClick={() => navigate('/perfil')}
              className="w-full text-left px-3 py-2 text-sm rounded-xl sidebar-item-inactive flex items-center gap-3"
            >
              <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 glass-strong flex items-center justify-center">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <User size={14} style={{ color: 'var(--clinical-600)' }} />
                )}
              </div>
              <div className="min-w-0">
                <p className="font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                  {user.name}
                </p>
                <p className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>
                  {user.role === 'admin' ? 'Administrador' : 'Usuário'}
                </p>
                <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                  {user.email}
                </p>
              </div>
            </motion.button>
          )}
        </AnimatePresence>
        <button
          onClick={() => setConfirmLogout(true)}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 mt-1 text-red-500 hover:text-red-600"
          style={{ backgroundColor: 'transparent' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--red-50)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          <LogOut size={20} className="shrink-0" />
          {!collapsed && <span>Sair</span>}
        </button>
      </div>

      <button
        onClick={() => setCollapsed(!collapsed)}
        className="hidden lg:flex p-3 text-xs border-t items-center justify-center transition-colors shrink-0"
        style={{ color: 'var(--text-muted)', borderColor: 'var(--glass-border-strong)' }}
      >
        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>
    </motion.aside>
  )

  return (
    <>
      <ConfirmDialog
        open={confirmLogout}
        title="Sair"
        message="Deseja realmente sair?"
        confirmLabel="Sair"
        variant="warning"
        onConfirm={() => { setConfirmLogout(false); logout() }}
        onCancel={() => setConfirmLogout(false)}
      />

      <div className="hidden lg:flex h-screen sticky top-0 shrink-0">
        {sidebarContent}
      </div>
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onMobileClose} />
          <div className="absolute left-0 top-0 h-full">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  )
}
