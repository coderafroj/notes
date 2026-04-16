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
        whileHover={{ y: isGrid ? -6 : 0, scale: isGrid ? 1.02 : 1.01 }}
        whileTap={{ scale: 0.96 }}
        className={cn(
          'relative overflow-hidden rounded-[24px] cursor-pointer transition-all border border-[#e5e4df] dark:border-white/10 bg-white dark:bg-[#1a1a1a]',
          'hover:border-[#7F77DD]/30 hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)]',
          isGrid ? 'flex flex-col h-[210px] p-6 gap-3' : 'flex items-center gap-5 h-20 px-6'
        )}
      >
        {/* Accent bar */}
        <div 
          className="absolute top-0 left-0 w-1.5 h-full opacity-80" 
          style={{ backgroundColor: accentColor || '#7F77DD' }} 
        />

        <div className={cn('flex-1 min-w-0', !isGrid && 'flex items-center gap-5')}>
          {/* Title row */}
          <div className={cn('flex items-start justify-between gap-3', isGrid ? 'mb-2' : '')}>
            <div className="flex items-center gap-2 min-w-0 flex-1">
              {note.isPinned && (
                <div className="p-1 bg-[#EF9F27]/10 rounded-md">
                   <Pin size={12} className="text-[#EF9F27] fill-[#EF9F27]" />
                </div>
              )}
              <h3 className="font-extrabold text-[15px] md:text-[16px] truncate leading-tight group-hover/card:text-[#7F77DD] transition-colors">
                {note.title || 'Untitled Note'}
              </h3>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              {note.isPublished && (
                <div className="flex items-center gap-1 text-[9px] font-black text-[#1D9E75] bg-[#1D9E75]/10 px-2 py-0.5 rounded-full uppercase tracking-tighter">
                  <div className="w-1 h-1 bg-[#1D9E75] rounded-full animate-pulse" />
                  Live
                </div>
              )}
              {note.isFavorite && <Star size={14} className="fill-[#EF9F27] text-[#EF9F27]" />}
            </div>
          </div>

          {/* Preview text */}
          {isGrid && (
            <p className="text-[13px] text-[#888780] line-clamp-3 leading-relaxed flex-1 font-medium">
              {note.contentPreview || <span className="italic opacity-30">No content yet...</span>}
            </p>
          )}
          {!isGrid && (
            <p className="text-[13px] text-[#888780] line-clamp-1 flex-1 hidden sm:block font-medium">
              {note.contentPreview || <span className="italic opacity-30">No content yet...</span>}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className={cn(
          'flex items-center gap-3',
          isGrid ? 'mt-auto pt-4 border-t border-[#f2f1ed] dark:border-white/5' : 'ml-auto shrink-0'
        )}>
          <span className="flex items-center gap-1.5 text-[10px] font-bold text-[#888780] uppercase tracking-widest opacity-60">
            <Clock size={11} className="opacity-50" />
            {formatRelative(note.updatedAt)}
          </span>
          {isGrid && note.tags.length > 0 && (
            <div className="flex gap-1.5 overflow-hidden ml-auto">
              {note.tags.slice(0, 2).map((tag) => (
                <span key={tag} className="px-2.5 py-1 rounded-lg bg-[#7F77DD]/5 text-[#7F77DD] text-[10px] font-black uppercase tracking-tight border border-[#7F77DD]/10">
                  #{tag}
                </span>
              ))}
              {note.tags.length > 2 && (
                <span className="text-[10px] font-bold text-[#888780] px-1">+{note.tags.length - 2}</span>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </Link>
  )
}

