import { ReactNode, useRef, useState, useEffect, useCallback } from 'react'
import Sidebar from './Sidebar'
import SearchBar from '../ui/SearchBar'
import NotificationBell from '../ui/NotificationBell'
import ThemeToggle from '../ui/ThemeToggle'
import { useAuth } from '../../contexts/AuthContext'
import { useNavigate, useLocation } from 'react-router-dom'
import { Menu } from 'lucide-react'
import AIFab from '../ai/AIFab'

export default function MainLayout({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const mainRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const mousePosRef = useRef({ x: -999, y: -999 })
  const [scrolled, setScrolled] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const location = useLocation()

  useEffect(() => {
    const el = mainRef.current
    if (!el) return
    const onScroll = () => setScrolled(el.scrollTop > 8)
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }, [location.pathname])

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    mousePosRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top }
    const spec = headerRef.current?.querySelector('.specular-highlight') as HTMLDivElement
    if (spec) {
      spec.style.background = `radial-gradient(300px at ${mousePosRef.current.x}px ${mousePosRef.current.y}px, var(--specular-color), transparent)`
    }
  }, [])

  return (
    <div className="flex min-h-screen">
      <Sidebar mobileOpen={sidebarOpen} onMobileClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <header ref={headerRef}
          className={`sticky top-0 z-40 px-4 lg:px-8 py-3 flex items-center justify-between gap-3 transition-all duration-300 ${
            scrolled ? 'glass-strong shadow-sm' : 'glass'
          }`}
          onPointerMove={handlePointerMove}
        >
          <div
            className="specular-highlight pointer-events-none absolute inset-0 opacity-40"
          />
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-xl glass-clear shrink-0"
            style={{ color: 'var(--text-secondary)' }}
            aria-label="Abrir menu"
          >
            <Menu size={20} />
          </button>
          <div className="flex-1 max-w-md">
            <SearchBar />
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <ThemeToggle />
            <NotificationBell />
            <button
              onClick={() => navigate('/perfil')}
              className="w-8 h-8 rounded-full text-sm font-bold flex items-center justify-center shrink-0 glass-strong transition-all duration-200 hover:scale-105"
              aria-label="Perfil"
            >
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt="" className="w-full h-full object-cover rounded-full" />
              ) : (
                <span style={{ color: 'var(--clinical-600)' }}>
                  {user?.name?.charAt(0) || '?'}
                </span>
              )}
            </button>
          </div>
        </header>
        <main ref={mainRef} className="flex-1 p-4 lg:p-8 overflow-auto relative">
          {children}
        </main>
        <AIFab />
      </div>
    </div>
  )
}
