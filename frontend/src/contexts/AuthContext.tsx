import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export interface User {
  id: number; name: string; email: string; role: 'admin' | 'user'; sectorId: number; avatarUrl?: string
}

interface AuthContextType {
  user: User | null; loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  updateUser: (data: Partial<User>) => void
}

const MOCK_USERS: Record<string, User> = {
  'admin@tidocs.com': { id: 1, name: 'Administrador', email: 'admin@tidocs.com', role: 'admin', sectorId: 1 },
  'user@tidocs.com': { id: 2, name: 'Usuário Padrão', email: 'user@tidocs.com', role: 'user', sectorId: 2 },
}

const AuthContext = createContext<AuthContextType>(null!)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('mockUser')
    return stored ? JSON.parse(stored) : null
  })
  const [loading] = useState(false)

  useEffect(() => {
    if (user) localStorage.setItem('mockUser', JSON.stringify(user))
    else localStorage.removeItem('mockUser')
  }, [user])

  const login = async (email: string, _password: string) => {
    const mockUser = MOCK_USERS[email]
    if (!mockUser) throw new Error('Credenciais inválidas')
    const stored = localStorage.getItem(`avatar_${mockUser.id}`)
    setUser(stored ? { ...mockUser, avatarUrl: stored } : mockUser)
  }

  const logout = () => setUser(null)

  const updateUser = (data: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...data } : null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
