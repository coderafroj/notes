'use client'
// components/note-ui/NoteMetaBar.tsx
// Add below the title input in app/note/[id]/page.tsx
// Props: note, onUpdate (saves note changes)

import { useState } from 'react'
import { Pin, PinOff, Tag, X, Plus, Palette } from 'lucide-react'
import { Note } from '@/types'
import { cn } from '@/lib/utils'

const COLORS = [
  { key: null,     label: 'None',   hex: 'transparent', border: 'border-[var(--border)]' },
  { key: 'purple', label: 'Purple', hex: '#7F77DD', border: 'border-purple-400' },
  { key: 'teal',   label: 'Teal',   hex: '#1D9E75', border: 'border-teal-400' },
  { key: 'amber',  label: 'Amber',  hex: '#EF9F27', border: 'border-amber-400' },
  { key: 'blue',   label: 'Blue',   hex: '#378ADD', border: 'border-blue-400' },
  { key: 'red',    label: 'Red',    hex: '#E24B4A', border: 'border-red-400' },
  { key: 'green',  label: 'Green',  hex: '#639922', border: 'border-green-400' },
]

interface NoteMetaBarProps {
  note: Note
  onUpdate: (changes: Partial<Note>) => void
}

export default function NoteMetaBar({ note, onUpdate }: NoteMetaBarProps) {
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [showTagInput, setShowTagInput] = useState(false)
  const [tagInput, setTagInput] = useState('')

  const addTag = () => {
    const clean = tagInput.trim().toLowerCase().replace(/[^a-z0-9-]/g, '')
    if (clean && !note.tags.includes(clean)) {
      onUpdate({ tags: [...note.tags, clean] })
    }
    setTagInput('')
    setShowTagInput(false)
  }

  const removeTag = (tag: string) => {
    onUpdate({ tags: note.tags.filter((t) => t !== tag) })
  }

  return (
    <div className="flex flex-wrap items-center gap-2 px-6 py-2 border-b border-[var(--border)] bg-[var(--background)]">

      {/* Pin toggle */}
      <button
        onClick={() => onUpdate({ isPinned: !note.isPinned })}
        title={note.isPinned ? 'Unpin' : 'Pin to top'}
        className={cn(
          'flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all',
          note.isPinned
            ? 'bg-[var(--p-amber)]/15 text-[var(--p-amber)]'
            : 'bg-[var(--muted)] text-[var(--muted-text)] hover:text-[var(--foreground)]'
        )}
      >
        {note.isPinned ? <Pin size={13} /> : <PinOff size={13} />}
        {note.isPinned ? 'Pinned' : 'Pin'}
      </button>

      {/* Color picker */}
      <div className="relative">
        <button
          onClick={() => setShowColorPicker((v) => !v)}
          title="Note color"
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-[var(--muted)] text-[var(--muted-text)] hover:text-[var(--foreground)] transition-all"
        >
          <span
            className="w-3 h-3 rounded-full border border-white/20"
            style={{ backgroundColor: COLORS.find((c) => c.key === note.color)?.hex || 'var(--muted-text)' }}
          />
          <Palette size={12} />
        </button>

        {showColorPicker && (
          <div className="absolute top-full mt-2 left-0 bg-[var(--card-bg)] border border-[var(--border)] rounded-xl shadow-xl p-3 flex gap-2 z-30">
            {COLORS.map((c) => (
              <button
                key={String(c.key)}
                onClick={() => { onUpdate({ color: c.key }); setShowColorPicker(false) }}
                title={c.label}
                className={cn(
                  'w-6 h-6 rounded-full border-2 transition-transform hover:scale-110',
                  note.color === c.key ? 'scale-110 border-white' : 'border-transparent',
                  c.key === null && 'border-[var(--border)] bg-[var(--muted)]'
                )}
                style={{ backgroundColor: c.key ? c.hex : undefined }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Tags */}
      {note.tags.map((tag) => (
        <span
          key={tag}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[var(--p-purple)]/10 text-[var(--p-purple)] text-xs font-medium"
        >
          <Tag size={11} />
          {tag}
          <button
            onClick={() => removeTag(tag)}
            className="ml-0.5 hover:text-red-500 transition-colors"
          >
            <X size={11} />
          </button>
        </span>
      ))}

      {/* Add tag */}
      {showTagInput ? (
        <div className="flex items-center gap-1">
          <input
            autoFocus
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') addTag()
              if (e.key === 'Escape') setShowTagInput(false)
            }}
            placeholder="tag name"
            className="text-xs px-2 py-1 bg-[var(--muted)] rounded-lg outline-none border border-[var(--p-purple)] w-24"
          />
          <button onClick={addTag} className="text-xs text-[var(--p-purple)] font-medium">Add</button>
          <button onClick={() => setShowTagInput(false)} className="text-xs text-[var(--muted-text)]">Cancel</button>
        </div>
      ) : (
        <button
          onClick={() => setShowTagInput(true)}
          className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-[var(--muted-text)] hover:bg-[var(--muted)] transition-all"
        >
          <Plus size={12} />
          Add tag
        </button>
      )}
    </div>
  )
}
