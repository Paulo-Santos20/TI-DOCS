import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { AuthProvider, useAuth } from '../contexts/AuthContext'

vi.mock('../lib/api', () => ({
  default: {
    post: vi.fn(),
    interceptors: {
      request: { handlers: [] },
      response: { handlers: [] },
    },
  } as any,
}))

function TestComponent() {
  const { user, loading, login, logout } = useAuth()
  return (
    <div>
      <span data-testid="loading">{String(loading)}</span>
      <span data-testid="user">{user ? user.name : 'no-user'}</span>
      <span data-testid="role">{user ? user.role : 'none'}</span>
      <button data-testid="login-btn" onClick={() => login('a@b.com', 'pwd')}>Login</button>
      <button data-testid="logout-btn" onClick={logout}>Logout</button>
    </div>
  )
}

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('should start with null user', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    )
    expect(screen.getByTestId('user').textContent).toBe('no-user')
    expect(screen.getByTestId('loading').textContent).toBe('false')
  })

  it('should restore user from localStorage', () => {
    const mockUser = { id: 1, name: 'Admin', email: 'admin@test.com', role: 'admin', sectorId: 1 }
    localStorage.setItem('mockUser', JSON.stringify(mockUser))

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    )

    expect(screen.getByTestId('user').textContent).toBe('Admin')
    expect(screen.getByTestId('role').textContent).toBe('admin')
  })

  it('should login and set user', async () => {
    const api = (await import('../lib/api')).default
    const mockUser = { id: 2, name: 'User', email: 'user@test.com', role: 'user', sectorId: 2 }

    ;(api.post as any).mockResolvedValue({
      data: { token: 'test-token', user: mockUser },
    })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    )

    screen.getByTestId('login-btn').click()

    await waitFor(() => {
      expect(screen.getByTestId('user').textContent).toBe('User')
    })

    expect(localStorage.getItem('token')).toBe('test-token')
    expect(localStorage.getItem('mockUser')).toBeTruthy()
  })

  it('should logout and clear user', async () => {
    const mockUser = { id: 1, name: 'Admin', email: 'admin@test.com', role: 'admin', sectorId: 1 }
    localStorage.setItem('mockUser', JSON.stringify(mockUser))
    localStorage.setItem('token', 'some-token')

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    )

    expect(screen.getByTestId('user').textContent).toBe('Admin')

    screen.getByTestId('logout-btn').click()

    await waitFor(() => {
      expect(screen.getByTestId('user').textContent).toBe('no-user')
    })
    expect(localStorage.getItem('token')).toBeNull()
    expect(localStorage.getItem('mockUser')).toBeNull()
  })
})
