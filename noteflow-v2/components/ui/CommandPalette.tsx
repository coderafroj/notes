'use client'
// components/ui/CommandPalette.tsx
import { useEffect, useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Search, Plus, Star, Settings, FileText, Folder, X } from 'lucide-react'
import { useNoteflowStore } from '@/lib/store'
import { searchNotes } from '@/lib/search'
import { saveNoteWithSync } from '@/lib/sync'
import { generateId, NOTE_TEMPLATES } from '@/lib/utils'
import { Note } from '@/types'
import { cn } from '@/lib/utils'

export default function CommandPalette() {
  const router = useRouter()
  const { data: session } = useSession()
  const { commandPaletteOpen, setCommandPaletteOpen, notes, folders } = useNoteflowStore()
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  // Open/close with Ctrl+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setCommandPaletteOpen(!commandPaletteOpen)
      }
      if (e.key === 'Escape') setCommandPaletteOpen(false)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [commandPaletteOpen])

  useEffect(() => {
    if (commandPaletteOpen) {
      setQuery('')
      setSelected(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [commandPaletteOpen])

  const matchedNotes = query ? searchNotes(notes, query).slice(0, 5) : notes.slice(0, 5)

  const actions = [
    { id: 'new', label: 'New Note', icon: Plus, action: async () => {
      if (!session?.accessToken) return
      const id = generateId()
      const now = new Date().toISOString()
      const note: Note = {
        id, title: 'Untitled Note', content: '', contentText: '',
        contentPreview: '', tags: [], folder: 'all', isPinned: false,
        isFavorite: false, createdAt: now, updatedAt: now, attachments: [], color: null,
      }
      await saveNoteWithSync(session.accessToken, session.user.login, note)
      router.push(`/note/${id}`)
      setCommandPaletteOpen(false)
    }},
    { id: 'favorites', label: 'Go to Favorites', icon: Star, action: () => { router.push('/favorites'); setCommandPaletteOpen(false) }},
    { id: 'settings', label: 'Open Settings', icon: Settings, action: () => { router.push('/settings'); setCommandPaletteOpen(false) }},
  ]

  const allItems = [
    ...(!query ? actions.map((a) => ({ type: 'action' as const, ...a })) : []),
    ...matchedNotes.map((n) => ({ type: 'note' as const, id: n.id, label: n.title || 'Untitled', icon: FileText, action: () => { router.push(`/note/${n.id}`); setCommandPaletteOpen(false) } })),
  ]

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelected((s) => Math.min(s + 1, allItems.length - 1)) }
    if (e.key === 'ArrowUp') { e.preventDefault(); setSelected((s) => Math.max(s - 1, 0)) }
    if (e.key === 'Enter' && allItems[selected]) allItems[selected].action()
  }

  if (!commandPaletteOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] px-4" onClick={() => setCommandPaletteOpen(false)}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="relative w-full max-w-lg bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--border)]">
          <Search size={18} className="text-[var(--muted-text)] shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelected(0) }}
            onKeyDown={handleKeyDown}
            placeholder="Search notes or type a command..."
            className="flex-1 bg-transparent outline-none text-sm"
          />
          <kbd className="text-[10px] px-1.5 py-0.5 bg-[var(--muted)] rounded text-[var(--muted-text)]">ESC</kbd>
        </div>
        {/* Results */}
        <div className="max-h-80 overflow-y-auto py-2">
          {allItems.length === 0 && (
            <p className="text-center text-sm text-[var(--muted-text)] py-8">No results found</p>
          )}
          {allItems.map((item, i) => (
            <button
              key={item.id}
              onClick={item.action}
              onMouseEnter={() => setSelected(i)}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors',
                i === selected ? 'bg-[var(--p-purple)]/10 text-[var(--p-purple)]' : 'text-[var(--foreground)] hover:bg-[var(--muted)]'
              )}
            >
              <item.icon size={16} className="shrink-0 text-[var(--muted-text)]" />
              <span className="flex-1 truncate">{item.label}</span>
              {item.type === 'note' && <span className="text-[10px] text-[var(--muted-text)]">Note</span>}
            </button>
          ))}
        </div>
        <div className="px-4 py-2 border-t border-[var(--border)] flex items-center gap-4 text-[10px] text-[var(--muted-text)]">
          <span>↑↓ navigate</span>
          <span>↵ select</span>
          <span>esc close</span>
        </div>
      </div>
    </div>
  )
}
