'use client'

import { usePathname, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  PenLine,
  Search,
  Star,
  Settings,
  Plus,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useNoteflowStore } from '@/lib/store'
import { useSession } from 'next-auth/react'
import { useCallback, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { Note } from '@/types'
import { saveNoteWithSync } from '@/lib/sync'

export default function BottomNav() {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session } = useSession()
  const { selectedFolderId } = useNoteflowStore()
  const [isCreating, setIsCreating] = useState(false)

  const handleNewNote = useCallback(async () => {
    if (isCreating) return
    setIsCreating(true)
    const id = uuidv4()
    const now = new Date().toISOString()
    const note: Note = {
      id,
      title: 'Untitled Note',
      content: '',
      contentText: '',
      contentPreview: '',
      tags: [],
      folder: selectedFolderId === 'all' ? 'all' : selectedFolderId,
      isPinned: false,
      isFavorite: false,
      createdAt: now,
      updatedAt: now,
      attachments: [],
      color: null,
      isPublished: false,
      slug: '',
    }
    await saveNoteWithSync(session?.accessToken, session?.user?.login, note)
    router.push(`/note/${id}`)
    setIsCreating(false)
  }, [session, selectedFolderId, isCreating, router])

  const tabs = [
    { label: 'Notes', icon: PenLine, href: '/', id: 'home' },
    { label: 'Search', icon: Search, href: '/search', id: 'search' },
    { label: 'Favorites', icon: Star, href: '/favorites', id: 'fav' },
    { label: 'Settings', icon: Settings, href: '/settings', id: 'settings' },
  ]

  const triggerHaptic = (pattern: number | number[] = 10) => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(pattern)
    }
  }


  const handleTabClick = (href: string) => {
    triggerHaptic()
    router.push(href)
  }

  // Hide BottomNav on Note Editor page
  if (pathname.includes('/note/')) return null

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden px-4 pb-safe pt-2 select-none">
      {/* Background with blur */}
      <div className="absolute inset-0 bg-[var(--background)]/70 backdrop-blur-2xl border-t border-[var(--border)] -z-10" />

      <div className="max-w-md mx-auto flex items-center justify-between pb-[env(safe-area-inset-bottom)]">
        {tabs.slice(0, 2).map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab.href)}
            className="flex flex-col items-center gap-1.5 px-4 py-2 relative active:scale-90 transition-transform"
          >
            <tab.icon
              size={22}
              className={cn(
                "transition-all duration-300",
                pathname === tab.href ? "text-[var(--p-purple)]" : "text-[var(--muted-text)]"
              )}
            />
            <span className={cn(
               "text-[10px] font-bold uppercase tracking-tighter transition-all duration-300",
               pathname === tab.href ? "text-[var(--p-purple)] opacity-100" : "text-[var(--muted-text)] opacity-60"
            )}>
              {tab.label}
            </span>
            {pathname === tab.href && (
              <motion.div
                layoutId="bottom-nav-active"
                className="absolute -top-1 w-1 h-1 rounded-full bg-[var(--p-purple)] shadow-[0_0_8px_var(--p-purple)]"
              />
            )}
          </button>
        ))}

        {/* Center Action Button */}
        <button
          onClick={() => {
            triggerHaptic([10, 30, 10]);
            handleNewNote();
          }}
          disabled={isCreating}
          className="relative -top-6 flex items-center justify-center w-14 h-14 bg-[var(--foreground)] text-[var(--background)] rounded-2xl shadow-2xl shadow-[var(--p-purple)]/30 active:scale-90 active:rotate-12 transition-all disabled:opacity-50"
        >
          <Plus size={28} className={cn(isCreating && "animate-spin")} />
        </button>

        {tabs.slice(2).map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab.href)}
            className="flex flex-col items-center gap-1.5 px-4 py-2 relative active:scale-90 transition-transform"
          >
            <tab.icon
              size={22}
              className={cn(
                "transition-all duration-300",
                pathname === tab.href ? "text-[var(--p-purple)]" : "text-[var(--muted-text)]"
              )}
            />
            <span className={cn(
               "text-[10px] font-bold uppercase tracking-tighter transition-all duration-300",
               pathname === tab.href ? "text-[var(--p-purple)] opacity-100" : "text-[var(--muted-text)] opacity-60"
            )}>
              {tab.label}
            </span>
            {pathname === tab.href && (
              <motion.div
                layoutId="bottom-nav-active"
                className="absolute -top-1 w-1 h-1 rounded-full bg-[var(--p-purple)] shadow-[0_0_8px_var(--p-purple)]"
              />
            )}
          </button>
        ))}
      </div>
    </nav>
  )
}

