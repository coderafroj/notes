'use client'
// components/command-palette/CommandPalette.tsx
// Usage: Add <CommandPalette /> anywhere in your (app)/layout.tsx
// Opens with Ctrl+K or Cmd+K

import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Plus, Star, Settings, FileText, Hash, X, Moon, Sun, Monitor, Focus, History, Trash2, Copy } from 'lucide-react'
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
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    setTheme(document.documentElement.classList.contains('dark') ? 'dark' : 'light')
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    document.documentElement.classList.remove('light', 'dark')
    document.documentElement.classList.add(newTheme)
    setTheme(newTheme)
    setOpen(false)
  }

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

  // ── Build items list ───────────────────────────────────────
  const staticItems = [
    {
      id: 'new',
      label: 'New Note',
      icon: <Plus size={15} />,
      group: 'Actions',
      action: async () => {
        const id = uuidv4()
        const now = new Date().toISOString()
        const note: Note = {
          id, title: 'Untitled Note', content: '', contentText: '',
          contentPreview: '', tags: [], folder: 'all', isPinned: false,
          isFavorite: false, createdAt: now, updatedAt: now, attachments: [], color: null,
          isPublished: false, slug: '',
        }
        await saveNoteWithSync(session?.accessToken, session?.user?.login, note)
        router.push(`/note/${id}`)
        setOpen(false)
      },
    },
    { id: 'theme', label: `Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`, icon: theme === 'light' ? <Moon size={15} /> : <Sun size={15} />, group: 'System', action: toggleTheme },
    { id: 'favorites', label: 'Go to Favorites', icon: <Star size={15} />, group: 'Navigate', action: () => { router.push('/favorites'); setOpen(false) } },
    { id: 'settings', label: 'Go to Settings', icon: <Settings size={15} />, group: 'Navigate', action: () => { router.push('/settings'); setOpen(false) } },
    { id: 'search', label: 'Quick Search', icon: <Search size={15} />, group: 'Navigate', action: () => { router.push('/search'); setOpen(false) } },
  ]

  // Add contextual commands if on a note page
  const pathname = typeof window !== 'undefined' ? window.location.pathname : ''
  const isOnNotePage = pathname.startsWith('/note/')
  const currentNoteId = isOnNotePage ? pathname.split('/').pop() : null

  if (isOnNotePage && currentNoteId) {
    staticItems.push(
      { id: 'focus', label: 'Open Focus Mode', icon: <Focus size={15} />, group: 'Current Note', action: () => { router.push(`/focus/${currentNoteId}`); setOpen(false) } },
      { id: 'history', label: 'View Version History', icon: <History size={15} />, group: 'Current Note', action: () => { router.push(`/history/${currentNoteId}`); setOpen(false) } },
      { id: 'copy', label: 'Copy Link', icon: <Copy size={15} />, group: 'Current Note', action: () => { navigator.clipboard.writeText(window.location.href); alert('Link copied!'); setOpen(false) } },
    )
  }

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
            className="fixed top-[10vh] sm:top-[15vh] left-1/2 -translate-x-1/2 w-full max-w-lg z-50 px-3 sm:px-4"
          >
            <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-3xl shadow-2xl overflow-hidden glass-card animate-in">
              {/* Input */}
              <div className="flex items-center gap-4 px-5 py-5 border-b border-[var(--border)]">
                <Search size={22} className="text-[var(--p-purple)] shrink-0 opacity-80" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => { setQuery(e.target.value); setSelected(0) }}
                  placeholder="What are you looking for?"
                  className="flex-1 bg-transparent outline-none text-base sm:text-lg text-[var(--foreground)] placeholder:text-[var(--muted-text)] font-medium"
                />

                {query && (
                  <button onClick={() => setQuery('')} className="p-1 hover:bg-[var(--muted)] rounded-full transition-colors">
                    <X size={16} className="text-[var(--muted-text)]" />
                  </button>
                )}
                <kbd className="hidden sm:inline-flex text-[10px] px-2 py-1 bg-[var(--muted)] rounded-lg text-[var(--muted-text)] border border-[var(--border)] font-bold">
                  ESC
                </kbd>
              </div>

              {/* Results */}
              <div className="max-h-[60vh] overflow-y-auto py-3 no-scrollbar">
                {filtered.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                    <div className="w-12 h-12 bg-[var(--muted)] rounded-2xl flex items-center justify-center text-[var(--muted-text)] mb-3 opacity-50">
                       <Search size={24} />
                    </div>
                    <p className="text-sm font-semibold">No results found</p>
                    <p className="text-xs text-[var(--muted-text)] mt-1">Try searching for something else</p>
                  </div>
                )}
                {Object.entries(groups).map(([group, items]) => (
                  <div key={group} className="mb-2 last:mb-0">
                    <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[var(--muted-text)] px-6 py-2 opacity-50">
                      {group}
                    </p>
                    <div className="px-2">
                      {items.map((item) => {
                        const idx = globalIdx++
                        const isActive = selected === idx
                        return (
                          <button
                            key={item.id}
                            onClick={item.action}
                            onMouseEnter={() => setSelected(idx)}
                            className={cn(
                              'interactive-scale w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-sm transition-all text-left group',
                              isActive
                                ? 'bg-[var(--p-purple)] text-white shadow-lg shadow-purple-500/30'
                                : 'text-[var(--foreground)] hover:bg-[var(--muted)]'
                            )}
                          >
                            <span className={cn(
                              'w-8 h-8 rounded-xl flex items-center justify-center transition-colors',
                              isActive ? 'bg-white/20 text-white' : 'bg-[var(--muted)] text-[var(--muted-text)] group-hover:bg-[var(--card-bg)]'
                            )}>
                              {item.icon}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold truncate">{item.label}</p>
                              {item.group === 'Notes' && <p className={cn('text-[10px] truncate opacity-70', isActive ? 'text-white' : 'text-[var(--muted-text)]')}>Jump to note content</p>}
                            </div>
                            {isActive && <kbd className="text-[10px] font-bold opacity-70">ENTER</kbd>}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="flex items-center gap-5 px-6 py-3 bg-[var(--muted)]/50 border-t border-[var(--border)] text-[10px] text-[var(--muted-text)] font-semibold uppercase tracking-wider">
                <span className="flex items-center gap-1.5"><kbd className="bg-[var(--card-bg)] px-1.5 py-0.5 rounded border border-[var(--border)] shadow-sm">↑↓</kbd> navigate</span>
                <span className="flex items-center gap-1.5"><kbd className="bg-[var(--card-bg)] px-1.5 py-0.5 rounded border border-[var(--border)] shadow-sm">↵</kbd> select</span>
                <span className="ml-auto opacity-60">Ctrl+K TO CLOSE</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
