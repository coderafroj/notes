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
    <div className="p-8 lg:p-12 max-w-4xl mx-auto animate-in">
      <div className="mb-10">
        <h1 className="text-3xl font-black tracking-tight leading-tight">Search Notes</h1>
        <p className="text-sm font-bold text-[var(--muted-text)] uppercase tracking-[0.2em] mt-1 opacity-50">Global knowledge retrieval</p>
      </div>

      <div className="relative mb-12 group">
        <Search size={22} className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--muted-text)] group-focus-within:text-[var(--p-purple)] transition-colors opacity-60" />
        <input autoFocus type="text" value={query} onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by keywords, tags (#), or content..."
          className="w-full pl-14 pr-14 py-5 bg-[var(--muted)] border border-transparent focus:border-[var(--p-purple)]/30 focus:bg-[var(--card-bg)] outline-none rounded-3xl text-lg font-medium transition-all shadow-inner"
        />
        {query && (
          <button onClick={() => setQuery('')} className="absolute right-5 top-1/2 -translate-y-1/2 p-1.5 hover:bg-[var(--muted)] rounded-full transition-colors">
            <X size={20} className="text-[var(--muted-text)]" />
          </button>
        )}
      </div>

      {!query.trim() && (
        <div className="flex flex-col items-center justify-center py-24 text-center glass-card rounded-3xl border-dashed border-2">
          <div className="w-16 h-16 bg-[var(--muted)] rounded-2xl flex items-center justify-center text-[var(--muted-text)] mb-4 opacity-40">
             <Search size={32} />
          </div>
          <p className="font-bold text-[var(--muted-text)]">Awaiting your query...</p>
          <p className="text-xs text-[var(--muted-text)] mt-1 opacity-60">Scan across all your thoughts and archives instantly</p>
        </div>
      )}

      {query.trim() && results.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center glass-card rounded-3xl">
          <div className="w-16 h-16 bg-red-500/5 text-red-500 rounded-2xl flex items-center justify-center mb-4 opacity-40">
             <X size={32} />
          </div>
          <p className="font-bold text-[var(--muted-text)]">No matches found for "{query}"</p>
          <p className="text-xs text-[var(--muted-text)] mt-1 opacity-60">Try different keywords or tags</p>
        </div>
      )}

      {results.length > 0 && (
        <div className="animate-in slide-in-from-bottom-4">
          <div className="flex items-center justify-between mb-6 px-4">
            <p className="text-[10px] font-black text-[var(--muted-text)] uppercase tracking-widest">
              Retrieved {results.length} result{results.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="grid gap-4">
            {results.map((note) => <NoteCard key={note.id} note={note} viewMode="list" />)}
          </div>
        </div>
      )}
    </div>
  )
}

