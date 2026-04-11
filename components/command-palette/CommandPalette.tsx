'use client'
// components/command-palette/CommandPalette.tsx
// Usage: Add <CommandPalette /> anywhere in your (app)/layout.tsx
// Opens with Ctrl+K or Cmd+K

import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Plus, Star, Settings, FileText, Hash, X } from 'lucide-react'
import { useNoteflowStore } from '@/lib/store'
import { cn } from '@/lib/utils'
import { v4 as uuidv4 } from 'uuid'
import { saveNoteWithSync } from '@/lib/sync'
import { useSession } from 'next-auth/react'
import { Note } from '@/types'

export default function CommandPalette() {
  const router = useRouter()
  const { data: session } = useSession()
  const { notes, tags, folders } = useNoteflowStore()

  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  // Open/close with Ctrl+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setOpen((v) => !v)
        setQuery('')
        setSelected(0)
      }
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50)
  }, [open])

  // Build items list
  const staticItems = [
    {
      id: 'new',
      label: 'New Note',
      icon: <Plus size={15} />,
      group: 'Actions',
      action: async () => {
        if (!session?.accessToken) return
        const id = uuidv4()
        const now = new Date().toISOString()
        const note: Note = {
          id, title: 'Untitled Note', content: '', contentText: '',
          contentPreview: '', tags: [], folder: 'all', isPinned: false,
          isFavorite: false, createdAt: now, updatedAt: now, attachments: [], color: null,
        }
        await saveNoteWithSync(session.accessToken, session.user.login, note)
        router.push(`/note/${id}`)
        setOpen(false)
      },
    },
    { id: 'favorites', label: 'Favorites', icon: <Star size={15} />, group: 'Navigate', action: () => { router.push('/favorites'); setOpen(false) } },
    { id: 'settings', label: 'Settings', icon: <Settings size={15} />, group: 'Navigate', action: () => { router.push('/settings'); setOpen(false) } },
    { id: 'search', label: 'Search Notes', icon: <Search size={15} />, group: 'Navigate', action: () => { router.push('/search'); setOpen(false) } },
  ]

  const noteItems = notes
    .filter((n) =>
      !query || n.title.toLowerCase().includes(query.toLowerCase()) ||
      n.contentPreview.toLowerCase().includes(query.toLowerCase())
    )
    .slice(0, 6)
    .map((n) => ({
      id: n.id,
      label: n.title || 'Untitled Note',
      icon: <FileText size={15} />,
      group: 'Notes',
      action: () => { router.push(`/note/${n.id}`); setOpen(false) },
    }))

  const tagItems = tags
    .filter((t) => !query || t.name.includes(query.replace('#', '')))
    .slice(0, 4)
    .map((t) => ({
      id: `tag-${t.name}`,
      label: `#${t.name}`,
      icon: <Hash size={15} />,
      group: 'Tags',
      action: () => { router.push(`/search?q=%23${t.name}`); setOpen(false) },
    }))

  const filtered = query
    ? [...staticItems.filter((i) => i.label.toLowerCase().includes(query.toLowerCase())), ...noteItems, ...tagItems]
    : [...staticItems, ...noteItems.slice(0, 4)]

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!open) return
      if (e.key === 'ArrowDown') { e.preventDefault(); setSelected((v) => Math.min(v + 1, filtered.length - 1)) }
      if (e.key === 'ArrowUp') { e.preventDefault(); setSelected((v) => Math.max(v - 1, 0)) }
      if (e.key === 'Enter') { e.preventDefault(); filtered[selected]?.action() }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, filtered, selected])

  // Group items
  const groups = filtered.reduce((acc, item) => {
    if (!acc[item.group]) acc[item.group] = []
    acc[item.group].push(item)
    return acc
  }, {} as Record<string, typeof filtered>)

  let globalIdx = 0

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ duration: 0.15 }}
            className="fixed top-[15vh] left-1/2 -translate-x-1/2 w-full max-w-lg z-50 px-4"
          >
            <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl shadow-2xl overflow-hidden">
              {/* Input */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--border)]">
                <Search size={18} className="text-[var(--muted-text)] shrink-0" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => { setQuery(e.target.value); setSelected(0) }}
                  placeholder="Search notes, actions, tags..."
                  className="flex-1 bg-transparent outline-none text-sm text-[var(--foreground)] placeholder:text-[var(--muted-text)]"
                />
                {query && (
                  <button onClick={() => setQuery('')}>
                    <X size={15} className="text-[var(--muted-text)]" />
                  </button>
                )}
                <kbd className="text-[10px] px-1.5 py-0.5 bg-[var(--muted)] rounded text-[var(--muted-text)] border border-[var(--border)]">
                  ESC
                </kbd>
              </div>

              {/* Results */}
              <div className="max-h-80 overflow-y-auto py-2">
                {filtered.length === 0 && (
                  <p className="text-center text-sm text-[var(--muted-text)] py-8">
                    No results for "{query}"
                  </p>
                )}
                {Object.entries(groups).map(([group, items]) => (
                  <div key={group}>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted-text)] px-4 py-1.5">
                      {group}
                    </p>
                    {items.map((item) => {
                      const idx = globalIdx++
                      return (
                        <button
                          key={item.id}
                          onClick={item.action}
                          onMouseEnter={() => setSelected(idx)}
                          className={cn(
                            'w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors text-left',
                            selected === idx
                              ? 'bg-[var(--p-purple)]/10 text-[var(--p-purple)]'
                              : 'text-[var(--foreground)] hover:bg-[var(--muted)]'
                          )}
                        >
                          <span className={selected === idx ? 'text-[var(--p-purple)]' : 'text-[var(--muted-text)]'}>
                            {item.icon}
                          </span>
                          <span className="truncate">{item.label}</span>
                        </button>
                      )
                    })}
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="flex items-center gap-4 px-4 py-2 border-t border-[var(--border)] text-[10px] text-[var(--muted-text)]">
                <span><kbd className="bg-[var(--muted)] px-1 rounded border border-[var(--border)]">↑↓</kbd> navigate</span>
                <span><kbd className="bg-[var(--muted)] px-1 rounded border border-[var(--border)]">↵</kbd> select</span>
                <span className="ml-auto">Ctrl+K to toggle</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
