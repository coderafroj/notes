'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import { LayoutGrid, List, ArrowUpDown, RefreshCw, Plus, ChevronDown, Search } from 'lucide-react'
import { useNoteflowStore } from '@/lib/store'
import { initializeNoteflow } from '@/lib/github'
import { getAllLocalNotes, saveNoteLocal, saveNoteWithSync } from '@/lib/sync'
import { searchNotes } from '@/lib/search'
import { cn, makeSlug, extractText } from '@/lib/utils'
import NoteCard from '@/components/dashboard/NoteCard'
import { v4 as uuidv4 } from 'uuid'
import { Note } from '@/types'

export default function Dashboard() {
  const router = useRouter()
  const { data: session } = useSession()
  const {
    notes, setNotes, setFolders, setTags,
    viewMode, setViewMode,
    selectedFolderId, searchQuery, setSearchQuery,
    sortBy, setSortBy, sortOrder, setSortOrder,
    isGuest,
  } = useNoteflowStore()

  const [isSyncing, setIsSyncing] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [showSortMenu, setShowSortMenu] = useState(false)

  // Load notes
  useEffect(() => {
    if (isGuest) {
      // Guest: load from Dexie
      getAllLocalNotes().then((localNotes) => {
        setNotes(localNotes.map((n) => ({
          id: n.id, title: n.title, contentPreview: n.contentPreview,
          tags: n.tags, folder: n.folder, isPinned: n.isPinned,
          isFavorite: n.isFavorite, color: n.color,
          createdAt: n.createdAt, updatedAt: n.updatedAt,
          isPublished: false, slug: n.slug ?? '',
        })))
      })
      return
    }
    if (!session?.accessToken) return
    setIsSyncing(true)
    initializeNoteflow(session.accessToken, session.user.login)
      .then((index) => {
        setNotes(index.notes)
        setFolders(index.folders)
        setTags(index.tags)
      })
      .catch(console.error)
      .finally(() => setIsSyncing(false))
  }, [session, isGuest])

  // Filter + search + sort
  const folderFiltered = notes.filter(
    (n) => selectedFolderId === 'all' || n.folder === selectedFolderId
  )
  const searched = searchQuery.trim() ? searchNotes(folderFiltered, searchQuery) : folderFiltered
  const sorted = [...searched].sort((a, b) => {
    if (sortBy === 'title') return sortOrder === 'asc' ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title)
    const da = new Date(a[sortBy]).getTime()
    const db_ = new Date(b[sortBy]).getTime()
    return sortOrder === 'asc' ? da - db_ : db_ - da
  })
  const displayNotes = [...sorted.filter((n) => n.isPinned), ...sorted.filter((n) => !n.isPinned)]

  // Create new note
  const handleNewNote = useCallback(async () => {
    if (isCreating) return
    setIsCreating(true)
    const id = uuidv4()
    const now = new Date().toISOString()
    const note: Note = {
      id, title: 'Untitled Note', content: '', contentText: '',
      contentPreview: '', tags: [],
      folder: selectedFolderId === 'all' ? 'all' : selectedFolderId,
      isPinned: false, isFavorite: false, createdAt: now, updatedAt: now,
      attachments: [], color: null, isPublished: false,
      slug: `untitled-${id.slice(0, 6)}`,
    }
    if (isGuest) {
      await saveNoteLocal(note)
    } else if (session?.accessToken) {
      await saveNoteWithSync(session.accessToken, session.user.login, note)
    }
    router.push(`/note/${id}`)
    setIsCreating(false)
  }, [session, isGuest, selectedFolderId, isCreating])

  const sortLabel = sortBy === 'updatedAt' ? 'Last edited' : sortBy === 'createdAt' ? 'Created' : 'Title'

  return (
    <div className="p-5 lg:p-10 max-w-7xl mx-auto">
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight mb-1">
            {selectedFolderId === 'all' ? 'All Notes' : 'Folder'}
          </h1>
          <div className="flex items-center gap-3 text-sm text-[var(--muted-text)]">
            <span>{displayNotes.length} notes</span>
            {isGuest && (
              <span className="text-xs px-2 py-0.5 bg-[var(--p-amber)]/15 text-[var(--p-amber)] rounded-full font-medium">
                Guest mode
              </span>
            )}
            {isSyncing && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-1.5 text-[var(--p-blue)]">
                <RefreshCw size={12} className="animate-spin" />
                Syncing...
              </motion.span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Search bar — mobile */}
          <div className="relative flex-1 sm:hidden">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-text)]" />
            <input
              value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="w-full pl-9 pr-3 py-2 bg-[var(--muted)] rounded-xl text-sm outline-none border border-transparent focus:border-[var(--p-purple)] transition-all"
            />
          </div>

          {/* View toggle */}
          <div className="bg-[var(--muted)] p-1 rounded-xl flex border border-[var(--border)]">
            {(['grid', 'list'] as const).map((m) => (
              <button key={m} onClick={() => setViewMode(m)}
                className={cn('p-2 rounded-lg transition-all', viewMode === m ? 'bg-[var(--card-bg)] shadow-sm text-[var(--foreground)]' : 'text-[var(--muted-text)]')}
              >
                {m === 'grid' ? <LayoutGrid size={16} /> : <List size={16} />}
              </button>
            ))}
          </div>

          {/* Sort */}
          <div className="relative">
            <button onClick={() => setShowSortMenu((v) => !v)}
              className="flex items-center gap-1.5 px-3 py-2 border border-[var(--border)] rounded-xl text-sm font-medium text-[var(--muted-text)] hover:bg-[var(--muted)] transition-all"
            >
              <ArrowUpDown size={14} />
              <span className="hidden sm:inline">{sortLabel}</span>
              <ChevronDown size={12} />
            </button>
            <AnimatePresence>
              {showSortMenu && (
                <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                  className="absolute right-0 mt-2 w-44 bg-[var(--card-bg)] border border-[var(--border)] rounded-xl shadow-xl overflow-hidden z-50"
                >
                  {([['updatedAt', 'Last edited'], ['createdAt', 'Date created'], ['title', 'Title (A–Z)']] as const).map(([key, label]) => (
                    <button key={key} onClick={() => {
                      if (sortBy === key) setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
                      else { setSortBy(key); setSortOrder(key === 'title' ? 'asc' : 'desc') }
                      setShowSortMenu(false)
                    }}
                      className={cn('w-full text-left px-4 py-2.5 text-sm hover:bg-[var(--muted)] transition-colors flex items-center justify-between', sortBy === key && 'text-[var(--p-purple)] font-medium')}
                    >
                      {label}
                      {sortBy === key && <span className="text-xs">{sortOrder === 'asc' ? '↑' : '↓'}</span>}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* New note — desktop */}
          <button onClick={handleNewNote} disabled={isCreating}
            className="hidden sm:flex items-center gap-2 px-4 py-2 bg-[var(--foreground)] text-[var(--background)] rounded-xl text-sm font-medium hover:opacity-90 transition-all disabled:opacity-50 shadow-sm"
          >
            <Plus size={16} />
            New Note
          </button>
        </div>
      </header>

      {/* Empty state */}
      {displayNotes.length === 0 && !isSyncing ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-20 h-20 bg-[var(--muted)] rounded-3xl flex items-center justify-center mb-6 text-4xl">📝</div>
          <h2 className="text-xl font-bold mb-2">No notes yet</h2>
          <p className="text-[var(--muted-text)] mb-8 max-w-xs text-sm">
            {searchQuery ? `No results for "${searchQuery}"` : 'Start writing your first note'}
          </p>
          {!searchQuery && (
            <button onClick={handleNewNote} disabled={isCreating}
              className="bg-[var(--p-purple)] text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-[var(--p-purple)]/20 hover:scale-105 transition-transform active:scale-95 disabled:opacity-50"
            >
              {isCreating ? 'Creating...' : 'Create First Note'}
            </button>
          )}
        </div>
      ) : (
        <motion.div layout className={cn('grid gap-4', viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1')}>
          <AnimatePresence mode="popLayout">
            {displayNotes.map((note, i) => (
              <motion.div key={note.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.03, duration: 0.2 }}
              >
                <NoteCard note={note} viewMode={viewMode} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  )
}
