import { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface Props { children: ReactNode }
interface State { hasError: boolean; error?: Error }

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen px-4"
          style={{ background: 'var(--bg)' }} role="alert">
          <div className="glass-elevated rounded-3xl p-10 max-w-md text-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: 'color-mix(in srgb, var(--red-500) 15%, transparent)' }}>
              <AlertTriangle size={32} style={{ color: 'var(--red-500)' }} />
            </div>
            <h1 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Algo deu errado</h1>
            <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
              Um erro inesperado ocorreu.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="btn-primary flex items-center gap-2 mx-auto"
            >
              <RefreshCw size={16} />
              Recarregar página
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
