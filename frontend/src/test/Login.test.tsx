import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import Login from '../pages/Login'
import { AuthProvider } from '../contexts/AuthContext'
import { ToastProvider } from '../contexts/ToastContext'
import ToastContainer from '../components/ui/ToastContainer'

vi.mock('../lib/api', () => ({
  default: {
    post: vi.fn(),
    interceptors: {
      request: { handlers: [] },
      response: { handlers: [] },
    },
  } as any,
}))

function renderLogin() {
  return render(
    <ToastProvider>
      <AuthProvider>
        <Login />
        <ToastContainer />
      </AuthProvider>
    </ToastProvider>,
  )
}

describe('Login page', () => {
  it('should render title and form fields', () => {
    renderLogin()
    expect(screen.getByText('TI DOCS')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('seu@email.com')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument()
    expect(screen.getByText('Entrar')).toBeInTheDocument()
  })

  it('should show error on failed login', async () => {
    renderLogin()
    fireEvent.change(screen.getByPlaceholderText('seu@email.com'), { target: { value: 'bad@test.com' } })
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'wrong' } })
    fireEvent.click(screen.getByText('Entrar'))

    await waitFor(() => {
      expect(screen.getByText('Credenciais inválidas')).toBeInTheDocument()
    })
  })
})
