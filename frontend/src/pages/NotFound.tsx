import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      <div className="glass-strong rounded-2xl p-12 text-center max-w-md">
        <h1 className="text-6xl font-bold mb-4" style={{ color: 'var(--clinical-500)' }}>404</h1>
        <p className="text-xl mb-8" style={{ color: 'var(--text-secondary)' }}>Página não encontrada</p>
        <Link to="/" className="btn-primary inline-block">
          Voltar ao início
        </Link>
      </div>
    </div>
  )
}
