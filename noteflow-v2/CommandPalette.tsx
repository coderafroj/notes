'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Plus, Star, Settings, FileText, Hash, X, LogIn } from 'lucide-react'
import { useNoteflowStore } from '@/lib/store'
import { saveNoteLocal, saveNoteWithSync } from '@/lib/sync'
import { cn } from '@/lib/utils'
import { v4 as uuidv4 } from 'uuid'
import { Note } from '@/types'

export default function CommandPalette() {
  const router = useRouter()
  const { data: session } = useSession()
  const { notes, tags, isGuest, selectedFolderId } = useNoteflowStore()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); setOpen((v) => !v); setQuery(''); setSelected(0) }
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [])

  useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus(), 50) }, [open])

  const createNote = useCallback(async () => {
    const id = uuidv4(); const now = new Date().toISOString()
    const note: Note = { id, title: 'Untitled Note', content: '', contentText: '', contentPreview: '', tags: [], folder: 'all', isPinned: false, isFavorite: false, createdAt: now, updatedAt: now, attachments: [], color: null, isPublished: false, slug: `untitled-${id.slice(0, 6)}` }
    if (isGuest) await saveNoteLocal(note)
    else if (session?.accessToken) await saveNoteWithSync(session.accessToken, session.user.login, note)
    router.push(`/note/${id}`); setOpen(false)
  }, [session, isGuest])

  const staticItems = [
    { id: 'new', label: 'New Note', icon: <Plus size={14} />, group: 'Actions', action: createNote },
    { id: 'fav', label: 'Favorites', icon: <Star size={14} />, group: 'Navigate', action: () => { router.push('/favorites'); setOpen(false) } },
    { id: 'settings', label: 'Settings', icon: <Settings size={14} />, group: 'Navigate', action: () => { router.push('/settings'); setOpen(false) } },
    { id: 'search', label: 'Search', icon: <Search size={14} />, group: 'Navigate', action: () => { router.push('/search'); setOpen(false) } },
  ]

  const noteItems = notes.filter((n) => !query || n.title.toLowerCase().includes(query.toLowerCase())).slice(0, 5)
    .map((n) => ({ id: n.id, label: n.title || 'Untitled', icon: <FileText size={14} />, group: 'Notes', action: () => { router.push(`/note/${n.id}`); setOpen(false) } }))

  const filtered = query
    ? [...staticItems.filter((i) => i.label.toLowerCase().includes(query.toLowerCase())), ...noteItems]
    : [...staticItems, ...noteItems.slice(0, 4)]

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (!open) return
      if (e.key === 'ArrowDown') { e.preventDefault(); setSelected((v) => Math.min(v + 1, filtered.length - 1)) }
      if (e.key === 'ArrowUp') { e.preventDefault(); setSelected((v) => Math.max(v - 1, 0)) }
      if (e.key === 'Enter') { e.preventDefault(); filtered[selected]?.action() }
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [open, filtered, selected])

  const groups = filtered.reduce((acc, item) => {
    if (!acc[item.group]) acc[item.group] = []
    acc[item.group].push(item); return acc
  }, {} as Record<string, typeof filtered>)

  let gi = 0

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" />
          <motion.div initial={{ opacity: 0, scale: 0.96, y: -8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }} transition={{ duration: 0.15 }}
            className="fixed top-[15vh] left-1/2 -translate-x-1/2 w-full max-w-lg px-4 z-50"
          >
            <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl shadow-2xl overflow-hidden">
              <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--border)]">
                <Search size={16} className="text-[var(--muted-text)] shrink-0" />
                <input ref={inputRef} value={query} onChange={(e) => { setQuery(e.target.value); setSelected(0) }}
                  placeholder="Search notes, actions..." className="flex-1 bg-transparent outline-none text-sm" />
                {query && <button onClick={() => setQuery('')}><X size={14} className="text-[var(--muted-text)]" /></button>}
                <kbd className="text-[10px] px-1.5 py-0.5 bg-[var(--muted)] rounded border border-[var(--border)] text-[var(--muted-text)]">ESC</kbd>
              </div>
              <div className="max-h-72 overflow-y-auto py-2">
                {filtered.length === 0 && <p className="text-center text-sm text-[var(--muted-text)] py-8">No results</p>}
                {Object.entries(groups).map(([group, items]) => (
                  <div key={group}>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted-text)] px-4 py-1.5">{group}</p>
                    {items.map((item) => {
                      const idx = gi++
                      return (
                        <button key={item.id} onClick={item.action} onMouseEnter={() => setSelected(idx)}
                          className={cn('w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors',
                            selected === idx ? 'bg-[var(--p-purple)]/10 text-[var(--p-purple)]' : 'text-[var(--foreground)] hover:bg-[var(--muted)]'
                          )}
                        >
                          <span className={selected === idx ? 'text-[var(--p-purple)]' : 'text-[var(--muted-text)]'}>{item.icon}</span>
                          <span className="truncate">{item.label}</span>
                        </button>
                      )
                    })}
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-4 px-4 py-2 border-t border-[var(--border)] text-[10px] text-[var(--muted-text)]">
                <span><kbd className="bg-[var(--muted)] px-1 rounded">↑↓</kbd> navigate</span>
                <span><kbd className="bg-[var(--muted)] px-1 rounded">↵</kbd> select</span>
                <span className="ml-auto">Ctrl+K</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
