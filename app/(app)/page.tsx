'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  LayoutGrid, 
  List, 
  ArrowUpDown, 
  CloudSync, 
  Filter,
  Plus
} from 'lucide-react'
import { useNoteflowStore } from '@/lib/store'
import NoteCard from '@/components/dashboard/NoteCard'
import { cn } from '@/lib/utils'

export default function Dashboard() {
  const { 
    notes, 
    viewMode, 
    setViewMode, 
    selectedFolderId,
    searchQuery,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder
  } = useNoteflowStore()

  const [isSyncing, setIsSyncing] = useState(false)

  // Filter notes based on selection and search
  const filteredNotes = notes.filter(note => {
    const matchesFolder = selectedFolderId === 'all' || note.folder === selectedFolderId
    const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          note.contentPreview.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesFolder && matchesSearch
  })

  // Simulated sync effect for UI demonstration
  useEffect(() => {
    setIsSyncing(true)
    const timer = setTimeout(() => setIsSyncing(false), 2000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2 font-[var(--font-heading)]">
            {selectedFolderId === 'all' ? 'Your notes' : 'Folder'}
          </h1>
          <div className="flex items-center gap-2 text-sm text-[var(--muted-text)]">
            <span>{filteredNotes.length} notes found</span>
            {isSyncing && (
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2 text-[var(--p-blue)]"
              >
                <CloudSync size={14} className="animate-spin-slow" />
                Updating repository...
              </motion.span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-[var(--muted)] p-1 rounded-xl flex border border-[var(--border)]">
            <button 
              onClick={() => setViewMode('grid')}
              className={cn(
                "p-2 rounded-lg transition-all",
                viewMode === 'grid' ? "bg-[var(--card-bg)] shadow-sm text-[var(--foreground)]" : "text-[var(--muted-text)] hover:text-[var(--foreground)]"
              )}
            >
              <LayoutGrid size={18} />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={cn(
                "p-2 rounded-lg transition-all",
                viewMode === 'list' ? "bg-[var(--card-bg)] shadow-sm text-[var(--foreground)]" : "text-[var(--muted-text)] hover:text-[var(--foreground)]"
              )}
            >
              <List size={18} />
            </button>
          </div>

          <button className="flex items-center gap-2 px-4 py-2 border border-[var(--border)] rounded-xl text-sm font-medium text-[var(--muted-text)] hover:bg-[var(--muted)] transition-all">
            <ArrowUpDown size={16} />
            Sort
          </button>

          <button className="lg:hidden flex items-center justify-center w-10 h-10 bg-[var(--foreground)] text-[var(--background)] rounded-xl shadow-lg">
            <Plus size={20} />
          </button>
        </div>
      </header>

      {filteredNotes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <div className="w-20 h-20 bg-[var(--muted)] rounded-3xl flex items-center justify-center text-[var(--muted-text)] mb-6">
            <CloudSync size={40} />
          </div>
          <h2 className="text-xl font-bold mb-2">No notes found here</h2>
          <p className="text-[var(--muted-text)] mb-8 max-w-xs">
            Start capturing your ideas or try changing your filters.
          </p>
          <button className="bg-[var(--p-purple)] text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-[var(--p-purple)]/20 hover:scale-105 transition-transform active:scale-95">
            Create First Note
          </button>
        </div>
      ) : (
        <motion.div 
          layout
          className={cn(
            "grid gap-6",
            viewMode === 'grid' ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
          )}
        >
          <AnimatePresence>
            {filteredNotes.map((note) => (
              <NoteCard key={note.id} note={note} viewMode={viewMode} />
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  )
}
