'use client'

import { motion } from 'framer-motion'
import { Star, Clock, Pin, Globe } from 'lucide-react'
import { NoteIndexEntry } from '@/types'
import { cn, formatRelative } from '@/lib/utils'
import Link from 'next/link'

interface NoteCardProps {
  note: NoteIndexEntry
  viewMode: 'grid' | 'list'
}

const COLOR_MAP: Record<string, string> = {
  purple: '#7F77DD', teal: '#1D9E75', amber: '#EF9F27',
  blue: '#378ADD', red: '#E24B4A', green: '#639922',
}

export default function NoteCard({ note, viewMode }: NoteCardProps) {
  const isGrid = viewMode === 'grid'
  const accentColor = note.color ? COLOR_MAP[note.color] : undefined

  return (
    <Link href={`/note/${note.id}`} className="block">
      <motion.div
        layout
        whileHover={{ y: isGrid ? -3 : 0 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          'glass-card rounded-2xl p-4 cursor-pointer group relative overflow-hidden transition-all',
          isGrid ? 'flex flex-col h-52' : 'flex items-center gap-4 h-20'
        )}
      >
        {/* Color accent */}
        {accentColor && (
          <div className="absolute top-0 left-0 w-1 h-full rounded-l-2xl" style={{ backgroundColor: accentColor }} />
        )}

        <div className={cn('flex-1 min-w-0', !isGrid && 'flex items-center gap-4')}>
          {/* Title row */}
          <div className={cn('flex items-start justify-between gap-2', isGrid ? 'mb-2' : '')}>
            <div className="flex items-center gap-1.5 min-w-0 flex-1">
              {note.isPinned && <Pin size={12} className="text-[var(--p-amber)] shrink-0 fill-[var(--p-amber)]" />}
              <h3 className="font-bold text-base truncate">{note.title || 'Untitled Note'}</h3>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {note.isPublished && <Globe size={12} className="text-[var(--p-teal)]" />}
              {note.isFavorite && <Star size={13} className="fill-[var(--p-amber)] text-[var(--p-amber)]" />}
            </div>
          </div>

          {/* Preview */}
          {isGrid && (
            <p className="text-sm text-[var(--muted-text)] line-clamp-3 leading-relaxed flex-1">
              {note.contentPreview || 'No content yet...'}
            </p>
          )}
          {!isGrid && (
            <p className="text-sm text-[var(--muted-text)] line-clamp-1 flex-1 hidden sm:block">
              {note.contentPreview || 'No content yet...'}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className={cn(
          'flex items-center gap-3',
          isGrid ? 'mt-auto pt-3 border-t border-[var(--border)]' : 'ml-auto shrink-0'
        )}>
          <span className="flex items-center gap-1 text-[10px] font-medium text-[var(--muted-text)] uppercase tracking-wide">
            <Clock size={10} />
            {formatRelative(note.updatedAt)}
          </span>
          {isGrid && note.tags.length > 0 && (
            <div className="flex gap-1 overflow-hidden ml-auto">
              {note.tags.slice(0, 2).map((tag) => (
                <span key={tag} className="px-2 py-0.5 rounded-md bg-[var(--muted)] text-[10px] text-[var(--muted-text)] font-medium">
                  #{tag}
                </span>
              ))}
              {note.tags.length > 2 && <span className="text-[10px] text-[var(--muted-text)]">+{note.tags.length - 2}</span>}
            </div>
          )}
        </div>
      </motion.div>
    </Link>
  )
}
