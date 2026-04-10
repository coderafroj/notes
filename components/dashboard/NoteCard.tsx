'use client'

import { motion } from 'framer-motion'
import { Star, Clock, ChevronRight, FileText } from 'lucide-react'
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
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -4, scale: 1.01 }}
        transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
        className={cn(
          "group relative flex flex-col justify-between overflow-hidden cursor-pointer transition-all duration-300",
          "bg-[var(--card-bg)] border border-[var(--border)] hover:border-[var(--p-purple)] rounded-3xl premium-shadow",
          isGrid ? "p-6 h-[280px]" : "p-5 flex-row items-center h-24"
        )}
      >
        {/* Color stripe */}
        <div 
          className={cn(
            "absolute top-0 left-0 transition-all duration-300",
            isGrid ? "w-full h-1.5 opacity-60" : "w-1.5 h-full opacity-60 group-hover:w-2"
          )}
          style={{ 
            backgroundColor: note.color ? `var(--p-${note.color})` : 'transparent' 
          }} 
        />

        <div className={cn("flex flex-col flex-1 min-w-0", !isGrid && "flex-row items-center gap-6")}>
          <div className={cn("flex items-start justify-between mb-3", !isGrid && "mb-0 w-1/3 shrink-0")}>
            <div className="flex flex-col min-w-0">
               <div className="flex items-center gap-2 mb-1">
                 <FileText size={14} className="text-[var(--p-purple)] shrink-0" />
                 <span className="text-[10px] uppercase tracking-widest font-bold text-[var(--muted-text)]">
                   Note
                 </span>
               </div>
               <h3 className="font-bold text-lg leading-tight truncate group-hover:text-[var(--p-purple)] transition-colors">
                {note.title || 'Untitled'}
              </h3>
            </div>
            {note.isFavorite && (
              <Star size={16} className="fill-[var(--p-amber)] text-[var(--p-amber)] shrink-0 mt-1" />
            )}
          </div>

          <p className={cn(
            "text-sm text-[var(--muted-text)] leading-relaxed line-clamp-4",
            !isGrid && "mb-0 line-clamp-1 flex-1 px-4 border-l border-[var(--border)]"
          )}>
            {note.contentPreview || 'Empty note...'}
          </p>
        </div>

        <div className={cn(
          "flex items-center justify-between mt-6 pt-4 border-t border-[var(--border)]",
          !isGrid && "mt-0 border-t-0 pt-0 shrink-0 ml-4 pl-4 border-l border-[var(--border)] w-48"
        )}>
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-[var(--muted-text)]">
              <Clock size={12} />
              {formatDate(note.updatedAt)}
            </div>
            {note.tags.length > 0 && (
              <div className="flex gap-2 mt-1">
                {note.tags.slice(0, 2).map((tag) => (
                  <span key={tag} className="text-[10px] text-[var(--p-purple)] font-medium">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
          
          <div className="p-2 rounded-full bg-[var(--muted)] opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0">
            <ChevronRight size={16} />
          </div>
        </div>
      </motion.div>
    </Link>
  )
}
