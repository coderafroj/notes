'use client'
// app/(app)/favorites/page.tsx
import { motion, AnimatePresence } from 'framer-motion'
import { Star } from 'lucide-react'
import { useNoteflowStore } from '@/lib/store'
import NoteCard from '@/components/dashboard/NoteCard'
import { cn } from '@/lib/utils'

export default function FavoritesPage() {
  const { notes, viewMode } = useNoteflowStore()
  const favorites = notes.filter((n) => n.isFavorite)
  return (
    <div className="p-5 lg:p-10 max-w-7xl mx-auto">
      <header className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold tracking-tight mb-1">Favorites</h1>
        <p className="text-sm text-[var(--muted-text)]">{favorites.length} starred note{favorites.length !== 1 ? 's' : ''}</p>
      </header>
      {favorites.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Star size={48} className="text-[var(--muted-text)] opacity-20 mb-4" />
          <h2 className="text-xl font-bold mb-2">No favorites yet</h2>
          <p className="text-[var(--muted-text)] text-sm max-w-xs">Open any note and tap the star to save it here.</p>
        </div>
      ) : (
        <div className={cn('grid gap-4', viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1')}>
          {favorites.map((note) => <NoteCard key={note.id} note={note} viewMode={viewMode} />)}
        </div>
      )}
    </div>
  )
}
