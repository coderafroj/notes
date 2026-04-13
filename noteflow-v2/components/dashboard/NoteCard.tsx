'use client'
// components/dashboard/NoteCard.tsx
import { motion } from 'framer-motion'
import { Star, Clock, Pin } from 'lucide-react'
import { NoteIndexEntry } from '@/types'
import { cn, formatDate } from '@/lib/utils'
import Link from 'next/link'

interface NoteCardProps {
  note: NoteIndexEntry
  viewMode: 'grid' | 'list'
}

export default function NoteCard({ note, viewMode }: NoteCardProps) {
  const isGrid = viewMode === 'grid'

  return (
    <Link href={`/note/${note.id}`}>
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        whileHover={{ y: isGrid ? -3 : 0 }}
        transition={{ duration: 0.15 }}
        className={cn(
          'glass-card rounded-2xl p-4 hover:border-[var(--p-purple)]/50 transition-all cursor-pointer group relative overflow-hidden',
          isGrid ? 'flex flex-col h-56' : 'flex items-center gap-5 py-3'
        )}
      >
        {/* Color accent stripe */}
        <div
          className="absolute top-0 left-0 w-1 h-full rounded-l-2xl transition-opacity"
          style={{
            backgroundColor: note.color ? `var(--p-${note.color})` : 'transparent',
            opacity: note.color ? 1 : 0,
          }}
        />

        {/* Pin badge */}
        {note.isPinned && (
          <div className="absolute top-3 right-3">
            <Pin size={12} className="text-[var(--p-teal)] fill-[var(--p-teal)]" />
          </div>
        )}

        <div className={cn('flex-1 min-w-0', !isGrid && 'flex items-center gap-5')}>
          <div className={cn('flex items-start justify-between gap-2', !isGrid && 'flex-shrink-0 w-64')}>
            <h3 className={cn('font-semibold truncate', isGrid ? 'text-base pr-4' : 'text-sm')}>
              {note.title || 'Untitled Note'}
            </h3>
            {note.isFavorite && !isGrid && (
              <Star size={13} className="fill-[var(--p-amber)] text-[var(--p-amber)] shrink-0 mt-0.5" />
            )}
          </div>

          {isGrid && note.isFavorite && (
            <div className="absolute top-3.5 right-3.5">
              <Star size={13} className="fill-[var(--p-amber)] text-[var(--p-amber)]" />
            </div>
          )}

          <p className={cn('text-xs text-[var(--muted-text)]', isGrid ? 'line-clamp-3 mt-2 flex-1' : 'line-clamp-1 flex-1')}>
            {note.contentPreview || 'No content yet...'}
          </p>
        </div>

        <div className={cn(
          'flex items-center gap-3 text-[var(--muted-text)]',
          isGrid ? 'mt-auto pt-3 border-t border-[var(--border)]' : 'ml-auto shrink-0'
        )}>
          <div className="flex items-center gap-1 text-[10px]">
            <Clock size={10} />
            <span>{formatDate(note.updatedAt)}</span>
          </div>
          {note.tags.length > 0 && (
            <div className="flex gap-1 overflow-hidden">
              {note.tags.slice(0, 2).map((tag) => (
                <span key={tag} className="px-1.5 py-0.5 rounded-md bg-[var(--muted)] text-[9px] font-medium">
                  #{tag}
                </span>
              ))}
              {note.tags.length > 2 && <span className="text-[10px]">+{note.tags.length - 2}</span>}
            </div>
          )}
        </div>
      </motion.div>
    </Link>
  )
}
