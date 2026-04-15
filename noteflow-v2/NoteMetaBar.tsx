'use client'
// components/note-ui/NoteMetaBar.tsx

import { useState } from 'react'
import { Pin, PinOff, Tag, X, Plus, Palette } from 'lucide-react'
import { Note } from '@/types'
import { cn } from '@/lib/utils'

const COLORS = [
  { key: null, hex: 'transparent' },
  { key: 'purple', hex: '#7F77DD' },
  { key: 'teal', hex: '#1D9E75' },
  { key: 'amber', hex: '#EF9F27' },
  { key: 'blue', hex: '#378ADD' },
  { key: 'red', hex: '#E24B4A' },
  { key: 'green', hex: '#639922' },
]

interface Props { note: Note; onUpdate: (changes: Partial<Note>) => void }

export default function NoteMetaBar({ note, onUpdate }: Props) {
  const [showColors, setShowColors] = useState(false)
  const [showTagInput, setShowTagInput] = useState(false)
  const [tagInput, setTagInput] = useState('')

  const addTag = () => {
    const clean = tagInput.trim().toLowerCase().replace(/[^a-z0-9-]/g, '')
    if (clean && !note.tags.includes(clean)) onUpdate({ tags: [...note.tags, clean] })
    setTagInput(''); setShowTagInput(false)
  }

  return (
    <div className="flex flex-wrap items-center gap-2 px-4 lg:px-6 py-2 border-b border-[var(--border)] bg-[var(--background)] min-h-[44px]">
      {/* Pin */}
      <button onClick={() => onUpdate({ isPinned: !note.isPinned })}
        className={cn('flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium transition-all',
          note.isPinned ? 'bg-[var(--p-amber)]/15 text-[var(--p-amber)]' : 'text-[var(--muted-text)] hover:bg-[var(--muted)]'
        )}
      >
        {note.isPinned ? <Pin size={12} /> : <PinOff size={12} />}
        <span className="hidden sm:inline">{note.isPinned ? 'Pinned' : 'Pin'}</span>
      </button>

      {/* Color */}
      <div className="relative">
        <button onClick={() => setShowColors((v) => !v)}
          className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs text-[var(--muted-text)] hover:bg-[var(--muted)] transition-all"
        >
          <span className="w-3 h-3 rounded-full border border-[var(--border)]"
            style={{ backgroundColor: COLORS.find((c) => c.key === note.color)?.hex || '#888780' }} />
          <Palette size={11} />
        </button>
        {showColors && (
          <div className="absolute top-full mt-1 left-0 bg-[var(--card-bg)] border border-[var(--border)] rounded-xl shadow-xl p-2.5 flex gap-2 z-30">
            {COLORS.map((c) => (
              <button key={String(c.key)} onClick={() => { onUpdate({ color: c.key }); setShowColors(false) }}
                className={cn('w-5 h-5 rounded-full border-2 hover:scale-110 transition-transform', note.color === c.key ? 'border-[var(--foreground)]' : 'border-transparent', !c.key && 'bg-[var(--muted)] border-[var(--border)]')}
                style={{ backgroundColor: c.key ? c.hex : undefined }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Tags */}
      {note.tags.map((tag) => (
        <span key={tag} className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[var(--p-purple)]/10 text-[var(--p-purple)] text-xs font-medium">
          <Tag size={10} />{tag}
          <button onClick={() => onUpdate({ tags: note.tags.filter((t) => t !== tag) })} className="hover:text-red-500 transition-colors"><X size={10} /></button>
        </span>
      ))}

      {/* Add tag */}
      {showTagInput ? (
        <div className="flex items-center gap-1">
          <input autoFocus value={tagInput} onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') addTag(); if (e.key === 'Escape') setShowTagInput(false) }}
            placeholder="tag name" className="text-xs px-2 py-0.5 bg-[var(--muted)] rounded-lg outline-none border border-[var(--p-purple)] w-20" />
          <button onClick={addTag} className="text-xs text-[var(--p-purple)] font-medium">Add</button>
          <button onClick={() => setShowTagInput(false)} className="text-xs text-[var(--muted-text)]">✕</button>
        </div>
      ) : (
        <button onClick={() => setShowTagInput(true)} className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs text-[var(--muted-text)] hover:bg-[var(--muted)] transition-all">
          <Plus size={11} />Add tag
        </button>
      )}
    </div>
  )
}
