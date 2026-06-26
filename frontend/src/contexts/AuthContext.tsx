import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import api from '../lib/api'
import { disconnectSocket } from '../lib/socket'

export interface User {
  id: number; name: string; email: string; role: 'admin' | 'user'; sectorId: number; positionId?: number | null; positionName?: string | null; avatarUrl?: string
}

interface AuthContextType {
  user: User | null; loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  updateUser: (data: Partial<User>) => void
}

const AuthContext = createContext<AuthContextType>(null!)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('tidocs_user')
    return stored ? JSON.parse(stored) : null
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) localStorage.setItem('tidocs_user', JSON.stringify(user))
    else localStorage.removeItem('tidocs_user')
  }, [user])

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token || !user) return
    api.get('/auth/me').then(({ data }) => {
      setUser(data)
    }).catch(() => {
      localStorage.removeItem('token')
      localStorage.removeItem('tidocs_user')
      setUser(null)
    })
  }, [])

  const login = async (email: string, password: string) => {
    setLoading(true)
    try {
      const { data } = await api.post('/auth/login', { email, password })
      localStorage.setItem('token', data.token)
      setUser(data.user)
    } catch (err: any) {
      localStorage.removeItem('token')
      throw new Error(err?.response?.data?.message || 'Credenciais inválidas')
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    disconnectSocket()
    localStorage.removeItem('token')
    localStorage.removeItem('tidocs_user')
    setUser(null)
  }

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
