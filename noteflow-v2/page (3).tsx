'use client'
// app/(app)/search/page.tsx
import { useState } from 'react'
import { Search, X } from 'lucide-react'
import { useNoteflowStore } from '@/lib/store'
import { searchNotes } from '@/lib/search'
import NoteCard from '@/components/dashboard/NoteCard'

export default function SearchPage() {
  const { notes } = useNoteflowStore()
  const [query, setQuery] = useState('')
  const results = query.trim() ? searchNotes(notes, query) : []

  return (
    <div className="p-5 lg:p-10 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Search</h1>
      <div className="relative mb-8">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted-text)]" />
        <input autoFocus type="text" value={query} onChange={(e) => setQuery(e.target.value)}
          placeholder="Search notes, tags, content..."
          className="w-full pl-12 pr-10 py-3.5 bg-[var(--muted)] border border-transparent focus:border-[var(--p-purple)] outline-none rounded-2xl text-base transition-all"
        />
        {query && <button onClick={() => setQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--muted-text)]"><X size={16} /></button>}
      </div>
      {!query.trim() && <p className="text-center text-[var(--muted-text)] py-12 text-sm">Type to search across all notes</p>}
      {query.trim() && results.length === 0 && <p className="text-center text-[var(--muted-text)] py-12 text-sm">No results for "{query}"</p>}
      {results.length > 0 && (
        <>
          <p className="text-sm text-[var(--muted-text)] mb-4">{results.length} result{results.length !== 1 ? 's' : ''}</p>
          <div className="grid gap-3">
            {results.map((note) => <NoteCard key={note.id} note={note} viewMode="list" />)}
          </div>
        </>
      )}
    </div>
  )
}
