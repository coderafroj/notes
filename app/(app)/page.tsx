'use client'

// ============================================================
// app/(app)/page.tsx — Dashboard (fully wired)
// ============================================================

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutGrid,
  List,
  ArrowUpDown,
  RefreshCw,
  Plus,
  ChevronDown,
} from 'lucide-react'
import { useNoteflowStore } from '@/lib/store'
import { initializeNoteflow } from '@/lib/github'
import { searchNotes } from '@/lib/search'
import { saveNoteWithSync } from '@/lib/sync'
import NoteCard from '@/components/dashboard/NoteCard'
import SwipeActions from '@/components/mobile/SwipeActions'
import { deleteNoteWithSync, toggleFavoriteWithSync } from '@/lib/sync'
import { cn } from '@/lib/utils'
import { v4 as uuidv4 } from 'uuid'
import { Note } from '@/types'
import { db } from '@/lib/db'

export default function Dashboard() {
  const router = useRouter()
  const { data: session } = useSession()

  const {
    notes,
    setNotes,
    setFolders,
    setTags,
    viewMode,
    setViewMode,
    selectedFolderId,
    searchQuery,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
  } = useNoteflowStore()

  const [isSyncing, setIsSyncing] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [showSortMenu, setShowSortMenu] = useState(false)

  // ── Load notes: Dexie first (instant), then GitHub ────────
  useEffect(() => {
    // 1. Load from local DB immediately
    db.notes.toArray().then((localNotes) => {
      setNotes(localNotes)
    })

    // 2. If logged in, sync with GitHub
    if (session?.accessToken && session?.user?.login) {
      setIsSyncing(true)
      initializeNoteflow(session.accessToken, session.user.login)
        .then((index) => {
          setNotes(index.notes)
          setFolders(index.folders)
          setTags(index.tags)
        })
        .catch((e) => console.error('[Dashboard] load failed:', e))
        .finally(() => setIsSyncing(false))
    }
  }, [session, setNotes, setFolders, setTags])

  // ── Filter → Search → Sort ───────────────────────────────
  const folderFiltered = notes.filter(
    (n) => selectedFolderId === 'all' || n.folder === selectedFolderId
  )

  const searched =
    searchQuery.trim()
      ? searchNotes(folderFiltered, searchQuery)
      : folderFiltered

  const sorted = [...searched].sort((a, b) => {
    if (sortBy === 'title') {
      return sortOrder === 'asc'
        ? a.title.localeCompare(b.title)
        : b.title.localeCompare(a.title)
    }
    const da = new Date(a[sortBy]).getTime()
    const db_ = new Date(b[sortBy]).getTime()
    return sortOrder === 'asc' ? da - db_ : db_ - da
  })

  // ── Pinned notes always first ────────────────────────────
  const displayNotes = [
    ...sorted.filter((n) => n.isPinned),
    ...sorted.filter((n) => !n.isPinned),
  ]

  // ── Create new note ──────────────────────────────────────
  const handleNewNote = useCallback(async () => {
    if (isCreating) return
    setIsCreating(true)
    const id = uuidv4()
    const now = new Date().toISOString()
    const note: Note = {
      id,
      title: 'Untitled Note',
      content: '',
      contentText: '',
      contentPreview: '',
      tags: [],
      folder: selectedFolderId === 'all' ? 'all' : selectedFolderId,
      isPinned: false,
      isFavorite: false,
      createdAt: now,
      updatedAt: now,
      attachments: [],
      color: null,
      isPublished: false,
      slug: '',
    }
    await saveNoteWithSync(session?.accessToken, session?.user?.login, note)
    router.push(`/note/${id}`)
    setIsCreating(false)
  }, [session, selectedFolderId, isCreating])

  // ── Sort button label ────────────────────────────────────
  const sortLabel =
    sortBy === 'updatedAt'
      ? 'Last edited'
      : sortBy === 'createdAt'
      ? 'Created'
      : 'Title'

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            {selectedFolderId === 'all' ? 'Your notes' : 'Folder'}
          </h1>
          <div className="flex items-center gap-3 text-sm text-[var(--muted-text)]">
            <span>{displayNotes.length} notes</span>
            {isSyncing && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-1.5 text-[var(--p-blue)]"
              >
                <RefreshCw size={13} className="animate-spin" />
                Syncing with GitHub...
              </motion.span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* View toggle */}
          <div className="bg-[var(--muted)] p-1 rounded-xl flex border border-[var(--border)]">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                'p-2 rounded-lg transition-all',
                viewMode === 'grid'
                  ? 'bg-[var(--card-bg)] shadow-sm text-[var(--foreground)]'
                  : 'text-[var(--muted-text)] hover:text-[var(--foreground)]'
              )}
            >
              <LayoutGrid size={18} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'p-2 rounded-lg transition-all',
                viewMode === 'list'
                  ? 'bg-[var(--card-bg)] shadow-sm text-[var(--foreground)]'
                  : 'text-[var(--muted-text)] hover:text-[var(--foreground)]'
              )}
            >
              <List size={18} />
            </button>
          </div>

          {/* Sort dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowSortMenu((v) => !v)}
              className="flex items-center gap-2 px-4 py-2 border border-[var(--border)] rounded-xl text-sm font-medium text-[var(--muted-text)] hover:bg-[var(--muted)] transition-all"
            >
              <ArrowUpDown size={15} />
              {sortLabel}
              <ChevronDown size={13} />
            </button>
            {showSortMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-[var(--card-bg)] border border-[var(--border)] rounded-xl shadow-lg overflow-hidden z-50">
                {(
                  [
                    { key: 'updatedAt', label: 'Last edited' },
                    { key: 'createdAt', label: 'Date created' },
                    { key: 'title', label: 'Title (A–Z)' },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.key}
                    onClick={() => {
                      if (sortBy === opt.key) {
                        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
                      } else {
                        setSortBy(opt.key)
                        setSortOrder(opt.key === 'title' ? 'asc' : 'desc')
                      }
                      setShowSortMenu(false)
                    }}
                    className={cn(
                      'w-full text-left px-4 py-3 text-sm hover:bg-[var(--muted)] transition-colors flex items-center justify-between',
                      sortBy === opt.key && 'text-[var(--p-purple)] font-medium'
                    )}
                  >
                    {opt.label}
                    {sortBy === opt.key && (
                      <span className="text-xs">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* New note — mobile */}
          <button
            onClick={handleNewNote}
            disabled={isCreating}
            className="lg:hidden flex items-center justify-center w-10 h-10 bg-[var(--foreground)] text-[var(--background)] rounded-xl shadow-lg disabled:opacity-50"
          >
            <Plus size={20} />
          </button>
        </div>
      </header>

      {displayNotes.length === 0 && !isSyncing ? (
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <div className="w-20 h-20 bg-[var(--muted)] rounded-3xl flex items-center justify-center text-[var(--muted-text)] mb-6 text-4xl">
            📝
          </div>
          <h2 className="text-xl font-bold mb-2">No notes here yet</h2>
          <p className="text-[var(--muted-text)] mb-8 max-w-xs">
            Start capturing your ideas or try changing your filters.
          </p>
          <button
            onClick={handleNewNote}
            disabled={isCreating}
            className="bg-[var(--p-purple)] text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-[var(--p-purple)]/20 hover:scale-105 transition-transform active:scale-95 disabled:opacity-50"
          >
            {isCreating ? 'Creating...' : 'Create First Note'}
          </button>
        </div>
      ) : (
        <motion.div
          layout
          className={cn(
            'grid gap-6',
            viewMode === 'grid'
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
              : 'grid-cols-1'
          )}
        >
          <AnimatePresence>
            {displayNotes.map((note) => (
              <SwipeActions
                key={note.id}
                isFavorite={note.isFavorite}
                onDelete={async () => {
                  if (!session?.accessToken) return
                  if (!confirm('Delete this note?')) return
                  await deleteNoteWithSync(session.accessToken, session.user.login, note.id)
                  setNotes(notes.filter((n) => n.id !== note.id))
                }}
                onFavorite={async () => {
                  if (!session?.accessToken) return
                  await toggleFavoriteWithSync(session.accessToken, session.user.login, note.id, !note.isFavorite)
                  setNotes(notes.map((n) => n.id === note.id ? { ...n, isFavorite: !n.isFavorite } : n))
                }}
              >
                <NoteCard note={note} viewMode={viewMode} />
              </SwipeActions>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  )
}
