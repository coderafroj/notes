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
    <Link href={`/note/${note.id}`} className="block group/card">
      <motion.div
        layout
        whileHover={{ y: isGrid ? -4 : 0, scale: isGrid ? 1 : 1.005 }}
        whileTap={{ scale: 0.975 }}
        className={cn(
          'relative overflow-hidden rounded-2xl cursor-pointer transition-all border border-[var(--border)] bg-[var(--card-bg)]',
          'hover:border-[var(--p-purple)]/20 hover:shadow-lg hover:shadow-purple-500/5',
          isGrid ? 'flex flex-col h-52 p-5 gap-3' : 'flex items-center gap-5 h-20 px-5'
        )}
        style={accentColor ? { borderLeftColor: accentColor, borderLeftWidth: '3px' } : undefined}
      >
        <div className={cn('flex-1 min-w-0', !isGrid && 'flex items-center gap-5')}>
          {/* Title row */}
          <div className={cn('flex items-start justify-between gap-3', isGrid ? 'mb-1' : '')}>
            <div className="flex items-center gap-2 min-w-0 flex-1">
              {note.isPinned && <Pin size={13} className="text-[var(--p-amber)] shrink-0 fill-[var(--p-amber)] opacity-80" />}
              <h3 className="font-bold text-[0.95rem] truncate leading-tight group-hover/card:text-[var(--p-purple)] transition-colors">
                {note.title || 'Untitled Note'}
              </h3>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              {note.isPublished && (
                <span className="flex items-center gap-1 text-[9px] font-bold text-[var(--p-teal)] bg-[var(--p-teal)]/10 px-2 py-0.5 rounded-lg uppercase tracking-wider">
                  <Globe size={10} />Live
                </span>
              )}
              {note.isFavorite && <Star size={14} className="fill-[var(--p-amber)] text-[var(--p-amber)]" />}
            </div>
          </div>

          {/* Preview text */}
          {isGrid && (
            <p className="text-sm text-[var(--muted-text)] line-clamp-3 leading-relaxed flex-1 text-[0.82rem]">
              {note.contentPreview || <span className="italic opacity-40">No content yet...</span>}
            </p>
          )}
          {!isGrid && (
            <p className="text-sm text-[var(--muted-text)] line-clamp-1 flex-1 hidden sm:block text-[0.82rem]">
              {note.contentPreview || <span className="italic opacity-40">No content yet...</span>}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className={cn(
          'flex items-center gap-3',
          isGrid ? 'mt-auto pt-3 border-t border-[var(--border)]' : 'ml-auto shrink-0'
        )}>
          <span className="flex items-center gap-1.5 text-[10px] font-bold text-[var(--muted-text)] uppercase tracking-widest opacity-50">
            <Clock size={10} />
            {formatRelative(note.updatedAt)}
          </span>
          {isGrid && note.tags.length > 0 && (
            <div className="flex gap-1.5 overflow-hidden ml-auto">
              {note.tags.slice(0, 2).map((tag) => (
                <span key={tag} className="px-2 py-0.5 rounded-lg bg-[var(--p-purple)]/8 text-[var(--p-purple)] text-[9px] font-black uppercase tracking-wider">
                  #{tag}
                </span>
              ))}
              {note.tags.length > 2 && (
                <span className="text-[9px] font-bold text-[var(--muted-text)] opacity-60">+{note.tags.length - 2}</span>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </Link>
  )
}

