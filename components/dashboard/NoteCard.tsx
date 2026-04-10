'use client'

import { motion } from 'framer-motion'
import { Star, Clock, Tag as TagIcon } from 'lucide-react'
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
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ y: -4 }}
        className={cn(
          "glass-card rounded-2xl p-5 hover:border-[var(--p-purple)] transition-all cursor-pointer group relative overflow-hidden",
          isGrid ? "flex flex-col h-64" : "flex items-center gap-6"
        )}
      >
        <div 
          className="absolute top-0 left-0 w-1 h-full" 
          style={{ backgroundColor: note.color ? `var(--p-${note.color})` : 'transparent' }} 
        />
        
        <div className={cn("flex-1", !isGrid && "flex items-center gap-6")}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-lg truncate pr-8">{note.title || 'Untitled Note'}</h3>
            {note.isFavorite && (
              <Star size={16} className="fill-[var(--p-amber)] text-[var(--p-amber)]" />
            )}
          </div>

          <p className={cn(
            "text-sm text-[var(--muted-text)] line-clamp-3 mb-4",
            !isGrid && "mb-0 line-clamp-1 flex-1"
          )}>
            {note.contentPreview || 'No content yet...'}
          </p>
        </div>

        <div className={cn(
          "flex items-center gap-4 mt-auto border-t border-[var(--border)] pt-4",
          !isGrid && "mt-0 border-t-0 pt-0 ml-auto"
        )}>
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--muted-text)]">
            <Clock size={12} />
            {formatDate(note.updatedAt)}
          </div>

          <div className="flex gap-1 overflow-hidden">
            {note.tags.slice(0, 2).map((tag) => (
              <span key={tag} className="px-2 py-0.5 rounded-md bg-[var(--muted)] text-[10px] text-[var(--muted-text)] font-medium">
                #{tag}
              </span>
            ))}
            {note.tags.length > 2 && (
              <span className="text-[10px] text-[var(--muted-text)] font-medium">+{note.tags.length - 2}</span>
            )}
          </div>
        </div>
      </motion.div>
    </Link>
  )
}
