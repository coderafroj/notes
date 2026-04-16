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
import { cn } from '@/lib/utils'
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
      getAllLocalNotes().then((localNotes) => {
        setNotes(localNotes.map((n: any) => ({
          ...n,
          isPublished: n.isPublished ?? false,
          slug: n.slug ?? '',
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
  }, [session, isGuest, setNotes, setFolders, setTags])

  // Filter + search + sort
  const folderFiltered = notes.filter(
    (n) => selectedFolderId === 'all' || n.folder === selectedFolderId
  )
  const searched = searchQuery.trim() ? searchNotes(folderFiltered, searchQuery) : folderFiltered
  const sorted = [...searched].sort((a: any, b: any) => {
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
      folder: selectedFolderId === 'all' ? 'personal' : selectedFolderId,
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
  }, [session, isGuest, selectedFolderId, isCreating, router])

  const sortLabel = sortBy === 'updatedAt' ? 'Edited' : sortBy === 'createdAt' ? 'Created' : 'Title'

  return (
    <div className="p-6 md:p-8 lg:p-12 max-w-7xl mx-auto min-h-screen">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <div className="flex items-center gap-2 mb-1.5 px-0.5">
             <div className="w-1.5 h-6 bg-[#7F77DD] rounded-full" />
             <h1 className="text-[28px] md:text-3xl lg:text-4xl font-black tracking-tight text-[#0f0f0f]">
              {selectedFolderId === 'all' ? 'All Notes' : 'Personal Workspace'}
            </h1>
          </div>
          <div className="flex items-center gap-3 text-sm text-[#888780] font-bold px-1">
            <span className="bg-[#f2f1ed] px-2.5 py-1 rounded-lg">{displayNotes.length} articles</span>
            {isGuest && (
              <span className="text-[10px] px-2 py-1 bg-[#EF9F27]/10 text-[#EF9F27] rounded-lg uppercase tracking-wider">
                Guest Mode
              </span>
            )}
            {isSyncing && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-1.5 text-[#7F77DD]">
                <RefreshCw size={14} className="animate-spin" />
                Updating...
              </motion.span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Search bar — hidden on tiny screens, shown above bottom nav on mobile */}
          <div className="relative flex-1 md:flex-none md:w-64 group">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#888780] group-focus-within:text-[#7F77DD] transition-colors" />
            <input
              value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Deep search..."
              className="w-full pl-11 pr-4 py-3 bg-[#f2f1ed] border border-transparent focus:bg-white focus:border-[#7F77DD]/30 rounded-[18px] text-[14px] outline-none shadow-inner transition-all"
            />
          </div>

          {/* View Toggle */}
          <div className="hidden sm:flex bg-[#f2f1ed] p-1 rounded-[16px] border border-[#e5e4df]">
            {(['grid', 'list'] as const).map((m) => (
              <button key={m} onClick={() => setViewMode(m)}
                className={cn('p-2.5 rounded-[12px] transition-all', viewMode === m ? 'bg-white shadow-sm text-[#0f0f0f]' : 'text-[#888780]')}
              >
                {m === 'grid' ? <LayoutGrid size={18} /> : <List size={18} />}
              </button>
            ))}
          </div>

          {/* Sort Menu */}
          <div className="relative">
            <button onClick={() => setShowSortMenu((v) => !v)}
              className="flex items-center gap-2 px-4 py-3 bg-white border border-[#e5e4df] rounded-[18px] text-sm font-bold text-[#0f0f0f] shadow-sm hover:shadow-md transition-all active:scale-95"
            >
              <ArrowUpDown size={16} className="text-[#888780]" />
              <span className="hidden sm:inline">{sortLabel}</span>
              <ChevronDown size={14} className="opacity-50" />
            </button>
            <AnimatePresence>
              {showSortMenu && (
                <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-3 w-52 bg-white border border-[#e5e4df] rounded-[24px] shadow-2xl overflow-hidden z-50 p-2"
                >
                  {([['updatedAt', 'Last edited'], ['createdAt', 'Date created'], ['title', 'Title (A–Z)']] as const).map(([key, label]) => (
                    <button key={key} onClick={() => {
                      if (sortBy === key) setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
                      else { setSortBy(key); setSortOrder(key === 'title' ? 'asc' : 'desc') }
                      setShowSortMenu(false)
                    }}
                      className={cn('w-full text-left px-4 py-3 text-[13px] rounded-xl hover:bg-[#f8f8f6] transition-colors flex items-center justify-between font-bold', sortBy === key ? 'text-[#7F77DD] bg-[#7F77DD]/5' : 'text-[#888780]')}
                    >
                      {label}
                      {sortBy === key && <span className="text-[10px]">{sortOrder === 'asc' ? 'ASC' : 'DESC'}</span>}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button onClick={handleNewNote} disabled={isCreating}
            className="hidden sm:flex items-center gap-2 px-5 py-3 bg-[#0f0f0f] text-white rounded-[18px] text-sm font-black shadow-lg shadow-black/10 hover:-translate-y-0.5 active:scale-95 transition-all disabled:opacity-50"
          >
            <Plus size={18} />
            New Note
          </button>
        </div>
      </header>

      {/* Grid */}
      {displayNotes.length === 0 && !isSyncing ? (
        <div className="flex flex-col items-center justify-center py-32 text-center animate-in fade-in slide-in-from-bottom-5 duration-700">
          <div className="w-24 h-24 bg-[#f2f1ed] rounded-[32px] flex items-center justify-center mb-8 text-5xl shadow-inner">📄</div>
          <h2 className="text-2xl font-black mb-3">Your workspace is quiet</h2>
          <p className="text-[#888780] mb-10 max-w-xs text-[15px] font-medium leading-relaxed">
            {searchQuery ? `Nothing found for "${searchQuery}". Maybe try a different keyword?` : 'Capture your thoughts, code snippets, or study notes. Everything stays synced to GitHub.'}
          </p>
          {!searchQuery && (
            <button onClick={handleNewNote} disabled={isCreating}
              className="bg-[#7F77DD] text-white px-10 py-4 rounded-[20px] font-black text-lg shadow-2xl shadow-[#7F77DD]/30 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
            >
              {isCreating ? 'Booting shell...' : 'Initialise First Note'}
            </button>
          )}
        </div>
      ) : (
        <motion.div layout className={cn('grid gap-5 md:gap-6', viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1')}>
          <AnimatePresence mode="popLayout" initial={false}>
            {displayNotes.map((note, i) => (
              <motion.div key={note.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                transition={{ type: "spring", stiffness: 300, damping: 25, delay: i * 0.02 }}
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
