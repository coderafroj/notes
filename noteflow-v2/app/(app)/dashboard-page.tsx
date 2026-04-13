'use client'
// app/(app)/page.tsx — Dashboard
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import { LayoutGrid, List, ArrowUpDown, RefreshCw, Plus, ChevronDown } from 'lucide-react'
import { useNoteflowStore } from '@/lib/store'
import { initializeNoteflow } from '@/lib/github'
import { saveNoteWithSync } from '@/lib/sync'
import { searchNotes } from '@/lib/search'
import NoteCard from '@/components/dashboard/NoteCard'
import TemplateModal from '@/components/ui/TemplateModal'
import { cn, generateId } from '@/lib/utils'
import { Note } from '@/types'

export default function Dashboard() {
  const router = useRouter()
  const { data: session } = useSession()
  const {
    notes, setNotes, setFolders, setTags,
    viewMode, setViewMode, selectedFolderId,
    searchQuery, sortBy, setSortBy, sortOrder, setSortOrder,
  } = useNoteflowStore()

  const [isSyncing, setIsSyncing] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [showSort, setShowSort] = useState(false)
  const [showTemplates, setShowTemplates] = useState(false)

  useEffect(() => {
    if (!session?.accessToken) return
    setIsSyncing(true)
    initializeNoteflow(session.accessToken, session.user.login)
      .then((idx) => { setNotes(idx.notes); setFolders(idx.folders); setTags(idx.tags) })
      .catch(console.error)
      .finally(() => setIsSyncing(false))
  }, [session])

  // Filter → Search → Sort → Pin first
  const filtered = notes.filter((n) =>
    (selectedFolderId === 'all' || n.folder === selectedFolderId)
  )
  const searched = searchQuery.trim() ? searchNotes(filtered, searchQuery) : filtered
  const sorted = [...searched].sort((a, b) => {
    if (sortBy === 'title') return sortOrder === 'asc' ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title)
    const da = new Date(a[sortBy]).getTime(), db_ = new Date(b[sortBy]).getTime()
    return sortOrder === 'asc' ? da - db_ : db_ - da
  })
  const display = [...sorted.filter((n) => n.isPinned), ...sorted.filter((n) => !n.isPinned)]

  const createNote = useCallback(async (templateContent = '', templateTitle = 'Untitled Note') => {
    if (!session?.accessToken || isCreating) return
    setIsCreating(true)
    setShowTemplates(false)
    const id = generateId()
    const now = new Date().toISOString()
    const note: Note = {
      id, title: templateTitle, content: templateContent, contentText: '',
      contentPreview: '', tags: [], folder: selectedFolderId === 'all' ? 'all' : selectedFolderId,
      isPinned: false, isFavorite: false, createdAt: now, updatedAt: now, attachments: [], color: null,
    }
    await saveNoteWithSync(session.accessToken, session.user.login, note)
    router.push(`/note/${id}`)
    setIsCreating(false)
  }, [session, selectedFolderId, isCreating])

  const sortLabel = sortBy === 'updatedAt' ? 'Last edited' : sortBy === 'createdAt' ? 'Created' : 'Title'

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto">
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-1">
            {selectedFolderId === 'all' ? 'All Notes' : 'Folder'}
          </h1>
          <div className="flex items-center gap-3 text-sm text-[var(--muted-text)]">
            <span>{display.length} notes</span>
            {isSyncing && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-1.5 text-[var(--p-blue)]">
                <RefreshCw size={12} className="animate-spin" /> Syncing...
              </motion.span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-[var(--muted)] p-1 rounded-xl flex border border-[var(--border)]">
            <button onClick={() => setViewMode('grid')} className={cn('p-2 rounded-lg transition-all', viewMode === 'grid' ? 'bg-[var(--card-bg)] shadow-sm text-[var(--foreground)]' : 'text-[var(--muted-text)]')}>
              <LayoutGrid size={16} />
            </button>
            <button onClick={() => setViewMode('list')} className={cn('p-2 rounded-lg transition-all', viewMode === 'list' ? 'bg-[var(--card-bg)] shadow-sm text-[var(--foreground)]' : 'text-[var(--muted-text)]')}>
              <List size={16} />
            </button>
          </div>

          <div className="relative">
            <button onClick={() => setShowSort((v) => !v)} className="flex items-center gap-1.5 px-3 py-2 border border-[var(--border)] rounded-xl text-sm text-[var(--muted-text)] hover:bg-[var(--muted)] transition-all">
              <ArrowUpDown size={14} /> {sortLabel} <ChevronDown size={12} />
            </button>
            {showSort && (
              <div className="absolute right-0 mt-2 w-44 bg-[var(--card-bg)] border border-[var(--border)] rounded-xl shadow-lg overflow-hidden z-50">
                {([['updatedAt', 'Last edited'], ['createdAt', 'Created'], ['title', 'Title A–Z']] as const).map(([key, label]) => (
                  <button key={key} onClick={() => { if (sortBy === key) setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'); else { setSortBy(key); setSortOrder(key === 'title' ? 'asc' : 'desc') } setShowSort(false) }}
                    className={cn('w-full text-left px-4 py-3 text-sm hover:bg-[var(--muted)] flex items-center justify-between', sortBy === key && 'text-[var(--p-purple)] font-medium')}
                  >
                    {label} {sortBy === key && <span className="text-xs">{sortOrder === 'asc' ? '↑' : '↓'}</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button onClick={() => setShowTemplates(true)} disabled={isCreating} className="lg:hidden flex items-center justify-center w-9 h-9 bg-[var(--foreground)] text-[var(--background)] rounded-xl shadow-sm disabled:opacity-50">
            <Plus size={18} />
          </button>
        </div>
      </header>

      {display.length === 0 && !isSyncing ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="text-5xl mb-6">📝</div>
          <h2 className="text-xl font-bold mb-2">No notes here yet</h2>
          <p className="text-[var(--muted-text)] mb-8 max-w-xs text-sm">Start capturing your ideas</p>
          <button onClick={() => setShowTemplates(true)} className="bg-[var(--p-purple)] text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-[var(--p-purple)]/20 hover:scale-105 transition-transform">
            Create First Note
          </button>
        </div>
      ) : (
        <motion.div layout className={cn('grid gap-4', viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1')}>
          <AnimatePresence>
            {display.map((note) => <NoteCard key={note.id} note={note} viewMode={viewMode} />)}
          </AnimatePresence>
        </motion.div>
      )}

      {showTemplates && (
        <TemplateModal onSelect={createNote} onClose={() => setShowTemplates(false)} />
      )}
    </div>
  )
}
