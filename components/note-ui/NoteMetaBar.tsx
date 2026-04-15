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
    <div className="flex flex-wrap items-center gap-3 px-5 lg:px-8 py-3 border-b border-[var(--border)] bg-[var(--background)] min-h-[52px] animate-in">
      {/* Pin Toggle */}
      <button onClick={() => onUpdate({ isPinned: !note.isPinned })}
        className={cn('interactive-scale flex items-center gap-2 px-3 py-1.5 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all',
          note.isPinned 
            ? 'bg-[var(--p-amber)] text-white shadow-sm shadow-orange-500/20' 
            : 'text-[var(--muted-text)] hover:bg-[var(--muted)] border border-transparent hover:border-[var(--border)]'
        )}
      >
        {note.isPinned ? <Pin size={13} strokeWidth={2.5} /> : <PinOff size={13} />}
        <span className="hidden sm:inline">{note.isPinned ? 'Pinned' : 'Pin Note'}</span>
      </button>

      <div className="h-4 w-[1px] bg-[var(--border)] mx-1 hidden sm:block" />

      {/* Color Picker */}
      <div className="relative">
        <button onClick={() => setShowColors((v) => !v)}
          className="interactive-scale flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-[11px] font-bold text-[var(--muted-text)] hover:bg-[var(--muted)] border border-transparent hover:border-[var(--border)] transition-all uppercase tracking-wider"
        >
          <div className="w-4 h-4 rounded-full shadow-inner border border-black/5"
            style={{ backgroundColor: COLORS.find((c) => c.key === note.color)?.hex || 'var(--muted-text)' }} />
          <Palette size={13} />
          <span className="hidden md:inline">Appearance</span>
        </button>
        {showColors && (
          <>
             <div className="fixed inset-0 z-30" onClick={() => setShowColors(false)} />
             <div className="absolute top-full mt-2 left-0 glass-card rounded-2xl shadow-2xl p-3 flex gap-2.5 z-40 animate-in origin-top-left">
               {COLORS.map((c) => (
                 <button key={String(c.key)} onClick={() => { onUpdate({ color: c.key }); setShowColors(false) }}
                   className={cn('w-7 h-7 rounded-full border-2 transition-all hover:scale-125 hover:rotate-12', 
                     note.color === c.key ? 'border-[var(--foreground)] scale-110 shadow-md' : 'border-transparent shadow-sm', 
                     !c.key && 'bg-[var(--muted)] border-[var(--border)]')}
                   style={{ backgroundColor: c.key ? c.hex : undefined }}
                   title={c.key || 'Default'}
                 />
               ))}
             </div>
          </>
        )}
      </div>

      <div className="h-4 w-[1px] bg-[var(--border)] mx-1" />

      {/* Tags List */}
      <div className="flex flex-wrap items-center gap-2">
        {note.tags.map((tag) => (
          <span key={tag} className="group flex items-center gap-2 px-3 py-1 rounded-xl bg-[var(--p-purple)]/10 text-[var(--p-purple)] text-[10px] font-bold uppercase tracking-widest border border-[var(--p-purple)]/5 animate-in">
            <Tag size={10} strokeWidth={2.5} className="opacity-70" />
            {tag}
            <button onClick={() => onUpdate({ tags: note.tags.filter((t) => t !== tag) })} 
              className="hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 -mr-1 p-0.5"
            >
              <X size={10} strokeWidth={3} />
            </button>
          </span>
        ))}

        {/* Add Tag Action */}
        {showTagInput ? (
          <div className="flex items-center gap-2 animate-in slide-in-from-left-2">
            <input autoFocus value={tagInput} onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') addTag(); if (e.key === 'Escape') setShowTagInput(false) }}
              placeholder="Tag label..." 
              className="text-[11px] font-bold px-3 py-1 bg-[var(--muted)] rounded-xl outline-none border border-[var(--p-purple)]/40 w-28 placeholder:opacity-50" 
            />
            <button onClick={addTag} className="text-[10px] font-black text-[var(--p-purple)] uppercase tracking-tighter hover:scale-110 transition-transform">Save</button>
            <button onClick={() => setShowTagInput(false)} className="text-[var(--muted-text)] hover:text-red-500 transition-colors p-1">
               <X size={12} strokeWidth={2.5} />
            </button>
          </div>
        ) : (
          <button onClick={() => setShowTagInput(true)} 
            className="interactive-scale flex items-center gap-2 px-3 py-1.5 rounded-xl text-[11px] font-bold text-[var(--muted-text)] hover:bg-[var(--muted)] border border-dashed border-[var(--border)] hover:border-[var(--muted-text)] transition-all uppercase tracking-wider"
          >
            <Plus size={13} />
            <span>Label</span>
          </button>
        )}
      </div>
    </div>

  )
}
