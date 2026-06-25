import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'

export default function SearchBar() {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) navigate(`/busca?q=${encodeURIComponent(query.trim())}`)
  }

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-md">
      <Search
        size={16}
        className="absolute left-3 top-1/2 -translate-y-1/2"
        style={{ color: 'var(--text-muted)' }}
        aria-hidden="true"
      />
      <input
        type="text"
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Buscar documentos..."
        className="glass-input w-full pl-10 pr-4 py-2 text-sm"
      />
    </form>
  )
}
