import { ReactNode } from 'react'
import Sidebar from './Sidebar'
import SearchBar from '../ui/SearchBar'
import NotificationBell from '../ui/NotificationBell'
import ThemeToggle from '../ui/ThemeToggle'
import { useAuth } from '../../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function MainLayout({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: 'var(--bg-page)' }}>
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <header style={{ backgroundColor: 'var(--bg-header)', borderColor: 'var(--border)' }}
          className="border-b px-6 lg:px-8 py-3 flex items-center justify-between gap-4 sticky top-0 z-40">
          <div className="flex-1 max-w-md">
            <SearchBar />
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <NotificationBell />
            <button onClick={() => navigate('/perfil')}
              className="w-8 h-8 rounded-full text-sm font-bold flex items-center justify-center transition-all duration-200 overflow-hidden shrink-0 ring-1 ring-transparent hover:ring-slate-300 dark:hover:ring-slate-500 hover:shadow-md"
              style={{ backgroundColor: user?.avatarUrl ? 'transparent' : 'var(--clinical-600)', color: '#fff' }}>
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                user?.name?.charAt(0) || '?'
              )}
            </button>
          </div>
        </header>
        <main className="flex-1 p-6 lg:p-8 overflow-auto relative">
          {children}
        </main>
      </div>
    </div>
  )
}
