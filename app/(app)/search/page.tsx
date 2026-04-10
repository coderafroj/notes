'use client'

// ============================================================
// app/(app)/search/page.tsx — Full-text search page
// ============================================================

import { useState, useEffect } from 'react'
import { Search, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNoteflowStore } from '@/lib/store'
import { searchNotes } from '@/lib/search'
import NoteCard from '@/components/dashboard/NoteCard'

export default function SearchPage() {
  const { notes, viewMode } = useNoteflowStore()
  const [query, setQuery] = useState('')

  const results = query.trim() ? searchNotes(notes, query) : []

  return (
    <div className="p-6 lg:p-10 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Search</h1>

      {/* Search input */}
      <div className="relative mb-10">
        <Search
          size={20}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted-text)]"
        />
        <input
          autoFocus
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search notes, tags, content..."
          className="w-full pl-12 pr-12 py-4 bg-[var(--muted)] border border-transparent focus:border-[var(--p-purple)] outline-none rounded-2xl text-base transition-all"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--muted-text)] hover:text-[var(--foreground)]"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {query.trim() === '' && (
        <p className="text-center text-[var(--muted-text)] py-12">
          Type to search across all your notes.
        </p>
      )}

      {query.trim() !== '' && results.length === 0 && (
        <div className="text-center py-12">
          <p className="text-[var(--muted-text)]">
            No notes match <strong>"{query}"</strong>
          </p>
        </div>
      )}

      {results.length > 0 && (
        <>
          <p className="text-sm text-[var(--muted-text)] mb-6">
            {results.length} result{results.length !== 1 ? 's' : ''} for "{query}"
          </p>
          <motion.div layout className="grid gap-4 grid-cols-1">
            <AnimatePresence>
              {results.map((note) => (
                <NoteCard key={note.id} note={note} viewMode="list" />
              ))}
            </AnimatePresence>
          </motion.div>
        </>
      )}
    </div>
  )
}
