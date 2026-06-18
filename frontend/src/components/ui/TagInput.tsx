import { useState } from 'react'
import api from '../../lib/api'

interface Tag { id: number; name: string; color: string }

interface Props {
  selected: Tag[]
  onChange: (tags: Tag[]) => void
}

export default function TagInput({ selected, onChange }: Props) {
  const [allTags, setAllTags] = useState<Tag[]>([])
  const [showDropdown, setShowDropdown] = useState(false)

  useState(() => { api.get('/tags').then(({ data }) => setAllTags(data)).catch(() => {}) })

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
      <div className="flex flex-wrap gap-1.5 p-2 border border-slate-200 rounded-xl min-h-[42px] cursor-text"
        onClick={() => setShowDropdown(true)}>
        {selected.map(tag => (
          <span key={tag.id} className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full"
            style={{ backgroundColor: tag.color + '20', color: tag.color }}>
            {tag.name}
            <button onClick={(e) => { e.stopPropagation(); removeTag(tag.id) }} className="hover:opacity-70">&times;</button>
          </span>
        ))}
        {selected.length === 0 && <span className="text-sm text-slate-400 px-1">Adicionar tags...</span>}
      </div>

      {showDropdown && available.length > 0 && (
        <div className="absolute top-full left-0 mt-1 w-full bg-white rounded-xl shadow-lg border border-slate-200 z-10 max-h-40 overflow-y-auto">
          {available.map(tag => (
            <button key={tag.id} onClick={() => addTag(tag)}
              className="w-full text-left px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: tag.color }} />
              {tag.name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
