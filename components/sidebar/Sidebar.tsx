'use client'

// ============================================================
// components/sidebar/Sidebar.tsx — fully wired
// ============================================================

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useCallback, useState } from 'react'
import {
  Plus,
  Search,
  Settings,
  Star,
  PenLine,
  ChevronRight,
  Loader2,
  Tag,
} from 'lucide-react'
import { useNoteflowStore } from '@/lib/store'
import { saveNoteWithSync } from '@/lib/sync'
import { cn } from '@/lib/utils'
import { v4 as uuidv4 } from 'uuid'
import { Note } from '@/types'
import TemplatesPicker from '@/components/note-ui/TemplatesPicker'

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session } = useSession()

  const {
    folders,
    tags,
    selectedFolderId,
    setSelectedFolderId,
    searchQuery,
    setSearchQuery,
  } = useNoteflowStore()

  const [isCreating, setIsCreating] = useState(false)
  const [showTemplates, setShowTemplates] = useState(false)

  const navItems = [
    { label: 'All Notes', icon: PenLine, id: 'all', href: '/' },
    { label: 'Favorites', icon: Star, id: 'fav', href: '/favorites' },
  ]

  // ── Create new note ───────────────────────────────────────
  const handleNewNote = useCallback(() => {
    if (isCreating) return
    setShowTemplates(true)
  }, [isCreating])

  return (
    <aside className="hidden lg:flex w-72 flex-col h-screen border-r border-[var(--border)] bg-[var(--background)] p-6 gap-6 overflow-hidden">
      {showTemplates && (
        <TemplatesPicker
          onSelect={async (key, content, title) => {
            setShowTemplates(false)
            setIsCreating(true)
            const id = uuidv4()
            const now = new Date().toISOString()
            const note: Note = {
              id,
              title: title || 'Untitled Note',
              content: content ? JSON.stringify(content) : '',
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
          }}
          onClose={() => setShowTemplates(false)}
        />
      )}
      {/* Logo */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-8 h-8 bg-[var(--p-purple)] rounded-xl flex items-center justify-center text-white">
          <PenLine size={18} />
        </div>
        <span className="font-bold text-xl tracking-tight">Noteflow</span>
      </div>

      {/* New Note */}
      <button
        onClick={handleNewNote}
        disabled={isCreating}
        className="flex items-center gap-2 justify-center w-full bg-[var(--foreground)] text-[var(--background)] py-3 rounded-xl font-medium hover:opacity-90 transition-all shadow-sm disabled:opacity-60 shrink-0"
      >
        {isCreating ? (
          <Loader2 size={18} className="animate-spin" />
        ) : (
          <Plus size={18} />
        )}
        {isCreating ? 'Creating...' : 'New Note'}
      </button>

      {/* Search */}
      <div className="shrink-0">
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-text)]"
          />
          <input
            type="text"
            placeholder="Quick search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[var(--muted)] border border-transparent focus:border-[var(--p-purple)] outline-none rounded-xl text-sm transition-all"
          />
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex flex-col gap-6 overflow-y-auto flex-1 min-h-0">
        {/* Navigation */}
        <nav className="flex flex-col gap-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted-text)] mb-2 px-2">
            Navigation
          </p>
          {navItems.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all',
                pathname === item.href
                  ? 'bg-[var(--p-purple)]/10 text-[var(--p-purple)]'
                  : 'text-[var(--muted-text)] hover:bg-[var(--muted)]'
              )}
            >
              <item.icon size={18} />
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Folders */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between mb-2 px-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted-text)]">
              Folders
            </p>
            <button className="text-[var(--muted-text)] hover:text-[var(--p-purple)] transition-colors">
              <Plus size={14} />
            </button>
          </div>
          {folders.length === 0 && (
            <p className="text-xs text-[var(--muted-text)] px-3 py-1">
              No folders yet
            </p>
          )}
          {folders.map((folder) => (
            <button
              key={folder.id}
              onClick={() => setSelectedFolderId(folder.id)}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all group',
                selectedFolderId === folder.id
                  ? 'bg-[var(--muted)] text-[var(--foreground)]'
                  : 'text-[var(--muted-text)] hover:bg-[var(--muted)]/50'
              )}
            >
              <div
                className="w-1.5 h-1.5 rounded-full shrink-0"
                style={{ backgroundColor: folder.color }}
              />
              <span className="flex-1 text-left truncate">{folder.name}</span>
              <ChevronRight
                size={14}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              />
            </button>
          ))}
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-col gap-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted-text)] mb-2 px-2">
              Tags
            </p>
            {tags.map((tag) => (
              <button
                key={tag.name}
                onClick={() => setSearchQuery(`#${tag.name}`)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all',
                  searchQuery === `#${tag.name}`
                    ? 'bg-[var(--p-purple)]/10 text-[var(--p-purple)]'
                    : 'text-[var(--muted-text)] hover:bg-[var(--muted)]/50'
                )}
              >
                <Tag size={14} />
                <span className="flex-1 text-left">{tag.name}</span>
                <span className="text-[10px] bg-[var(--muted)] px-1.5 py-0.5 rounded-full">
                  {tag.count}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Settings footer */}
      <div className="pt-4 border-t border-[var(--border)] shrink-0">
        <Link
          href="/settings"
          className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-[var(--muted-text)] hover:bg-[var(--muted)] transition-all"
        >
          <Settings size={18} />
          Settings
        </Link>
      </div>
    </aside>
  )
}
