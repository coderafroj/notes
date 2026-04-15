'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useState, useCallback } from 'react'
import { Plus, Search, Settings, Star, PenLine, ChevronRight, Tag, Loader2, LogIn, UserCircle2 } from 'lucide-react'
import { useNoteflowStore } from '@/lib/store'
import { saveNoteLocal, saveNoteWithSync } from '@/lib/sync'
import { cn } from '@/lib/utils'
import { v4 as uuidv4 } from 'uuid'
import { Note } from '@/types'

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session } = useSession()
  const { folders, tags, selectedFolderId, setSelectedFolderId, searchQuery, setSearchQuery, isGuest } = useNoteflowStore()
  const [isCreating, setIsCreating] = useState(false)

  const handleNewNote = useCallback(async () => {
    if (isCreating) return
    setIsCreating(true)
    const id = uuidv4()
    const now = new Date().toISOString()
    const note: Note = {
      id, title: 'Untitled Note', content: '', contentText: '',
      contentPreview: '', tags: [],
      folder: selectedFolderId === 'all' ? 'all' : selectedFolderId,
      isPinned: false, isFavorite: false, createdAt: now, updatedAt: now,
      attachments: [], color: null, isPublished: false,
      slug: `untitled-${id.slice(0, 6)}`,
    }
    if (isGuest) await saveNoteLocal(note)
    else if (session?.accessToken) await saveNoteWithSync(session.accessToken, session.user.login, note)
    router.push(`/note/${id}`)
    setIsCreating(false)
  }, [session, isGuest, selectedFolderId, isCreating])

  const navItems = [
    { label: 'All Notes', icon: PenLine, id: 'all', href: '/' },
    { label: 'Favorites', icon: Star, id: 'fav', href: '/favorites' },
  ]

  return (
    <aside className="hidden lg:flex w-68 flex-col h-screen border-r border-[var(--border)] bg-[var(--background)] p-5 gap-5 overflow-hidden">
      {/* Logo */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 bg-[var(--p-purple)] rounded-xl flex items-center justify-center text-white shrink-0">
          <PenLine size={16} />
        </div>
        <div>
          <span className="font-bold text-lg tracking-tight">Noteflow</span>
          {isGuest && <span className="ml-2 text-[10px] bg-[var(--p-amber)]/15 text-[var(--p-amber)] px-1.5 py-0.5 rounded-full font-medium">Guest</span>}
        </div>
      </div>

      {/* New Note */}
      <button onClick={handleNewNote} disabled={isCreating}
        className="flex items-center gap-2 justify-center w-full bg-[var(--foreground)] text-[var(--background)] py-2.5 rounded-xl font-medium hover:opacity-90 transition-all shadow-sm disabled:opacity-60 text-sm"
      >
        {isCreating ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
        {isCreating ? 'Creating...' : 'New Note'}
      </button>

      {/* Search */}
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-text)]" />
        <input type="text" placeholder="Search notes..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-3 py-2 bg-[var(--muted)] border border-transparent focus:border-[var(--p-purple)] outline-none rounded-xl text-sm transition-all"
        />
      </div>

      {/* Scrollable nav */}
      <div className="flex flex-col gap-5 overflow-y-auto flex-1 min-h-0 scrollbar-hide">
        {/* Nav */}
        <nav className="flex flex-col gap-0.5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted-text)] mb-1.5 px-2">Navigation</p>
          {navItems.map((item) => (
            <Link key={item.id} href={item.href}
              className={cn('flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-all',
                pathname === item.href ? 'bg-[var(--p-purple)]/10 text-[var(--p-purple)]' : 'text-[var(--muted-text)] hover:bg-[var(--muted)]'
              )}
            >
              <item.icon size={16} />
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Folders */}
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center justify-between mb-1.5 px-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted-text)]">Folders</p>
            <button className="text-[var(--muted-text)] hover:text-[var(--p-purple)] transition-colors"><Plus size={13} /></button>
          </div>
          {folders.length === 0 && <p className="text-xs text-[var(--muted-text)] px-3">No folders yet</p>}
          {folders.map((folder) => (
            <button key={folder.id} onClick={() => setSelectedFolderId(folder.id)}
              className={cn('flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-all group',
                selectedFolderId === folder.id ? 'bg-[var(--muted)] text-[var(--foreground)]' : 'text-[var(--muted-text)] hover:bg-[var(--muted)]/50'
              )}
            >
              <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: folder.color }} />
              <span className="flex-1 text-left truncate">{folder.name}</span>
              <ChevronRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          ))}
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-col gap-0.5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted-text)] mb-1.5 px-2">Tags</p>
            {tags.map((tag) => (
              <button key={tag.name} onClick={() => setSearchQuery(`#${tag.name}`)}
                className={cn('flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-all',
                  searchQuery === `#${tag.name}` ? 'bg-[var(--p-purple)]/10 text-[var(--p-purple)]' : 'text-[var(--muted-text)] hover:bg-[var(--muted)]/50'
                )}
              >
                <Tag size={13} />
                <span className="flex-1 text-left">{tag.name}</span>
                <span className="text-[10px] bg-[var(--muted)] px-1.5 py-0.5 rounded-full">{tag.count}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="pt-4 border-t border-[var(--border)] flex flex-col gap-1">
        {isGuest ? (
          <Link href="/login" className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-[var(--p-purple)] hover:bg-[var(--p-purple)]/10 transition-all">
            <LogIn size={16} />
            Sign in with GitHub
          </Link>
        ) : session?.user && (
          <div className="flex items-center gap-2.5 px-3 py-2">
            <img src={session.user.image ?? ''} alt="" width={24} height={24} className="rounded-full" />
            <span className="text-xs font-medium truncate">{session.user.name}</span>
          </div>
        )}
        <Link href="/settings" className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-[var(--muted-text)] hover:bg-[var(--muted)] transition-all">
          <Settings size={16} />
          Settings
        </Link>
      </div>
    </aside>
  )
}
