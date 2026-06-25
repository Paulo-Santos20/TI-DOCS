import { useState } from 'react'
import api from '../../lib/api'
import { useToast } from '../../contexts/ToastContext'

interface Tag { id: number; name: string; color: string }

interface Props {
  selected: Tag[]
  onChange: (tags: Tag[]) => void
}

export default function TagInput({ selected, onChange }: Props) {
  const { addToast } = useToast()
  const [allTags, setAllTags] = useState<Tag[]>([])
  const [showDropdown, setShowDropdown] = useState(false)

  useState(() => { api.get('/tags').then(({ data }) => setAllTags(data)).catch(() => addToast('Erro ao carregar tags', 'error')) })

  const available = allTags.filter(t => !selected.some(s => s.id === t.id))

  const addTag = (tag: Tag) => {
    onChange([...selected, tag])
    setShowDropdown(false)
  }

  const removeTag = (tagId: number) => {
    onChange(selected.filter(t => t.id !== tagId))
  }

  return (
    <div className="relative">
      <div className="flex flex-wrap gap-1.5 p-2 rounded-xl min-h-[42px] cursor-text"
      style={{ border: '1px solid var(--glass-border-strong)', background: 'var(--bg-card)' }}
        onClick={() => setShowDropdown(true)}>
        {selected.map(tag => (
          <span key={tag.id} className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full"
            style={{ backgroundColor: tag.color + '20', color: tag.color }}>
            {tag.name}
            <button onClick={(e) => { e.stopPropagation(); removeTag(tag.id) }} className="hover:opacity-70">&times;</button>
          </span>
        ))}
        {selected.length === 0 && <span className="text-sm px-1" style={{ color: 'var(--text-muted)' }}>Adicionar tags...</span>}
      </div>

      {showDropdown && available.length > 0 && (
        <div className="absolute top-full left-0 mt-1 w-full rounded-xl shadow-lg z-10 max-h-40 overflow-y-auto"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--glass-border-strong)' }}>
          {available.map(tag => (
            <button key={tag.id} onClick={() => addTag(tag)}
              className="w-full text-left px-3 py-2 text-sm transition-colors flex items-center gap-2"
              style={{ color: 'var(--text-secondary)' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--glass-clear)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: tag.color }} />
              {tag.name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
