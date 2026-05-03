'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useState, useCallback } from 'react'
import { Plus, Search, Settings, Star, PenLine, ChevronRight, Tag, Loader2, LogIn, UserCircle2, UploadCloud } from 'lucide-react'
import { useNoteflowStore } from '@/lib/store'
import { saveNoteLocal, saveNoteWithSync } from '@/lib/sync'
import { cn } from '@/lib/utils'
import { v4 as uuidv4 } from 'uuid'
import { Note } from '@/types'
import ImportModal from './ImportModal'

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session } = useSession()
  const { folders, tags, selectedFolderId, setSelectedFolderId, searchQuery, setSearchQuery, isGuest } = useNoteflowStore()
  const [isCreating, setIsCreating] = useState(false)
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)

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
    { label: 'All Notes', icon: PenLine, id: 'all', href: '/dashboard' },
    { label: 'Favorites', icon: Star, id: 'fav', href: '/favorites' },
  ]

  return (
    <aside className="hidden lg:flex w-72 flex-col h-screen border-r border-[var(--border)] bg-[var(--background)] p-6 gap-6 overflow-hidden animate-in">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 premium-gradient rounded-xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-purple-500/20">
          <PenLine size={18} />
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-lg tracking-tight leading-none">Noteflow</span>
          {isGuest && <span className="text-[10px] text-[var(--p-amber)] font-semibold mt-0.5">Guest Workspace</span>}
        </div>
      </div>

      {/* New Note & Import */}
      <div className="flex gap-2">
        <button onClick={handleNewNote} disabled={isCreating}
          className="flex-1 interactive-scale flex items-center gap-2 justify-center bg-[var(--foreground)] text-[var(--background)] py-3 rounded-2xl font-semibold hover:opacity-90 transition-all premium-shadow disabled:opacity-60 text-sm"
        >
          {isCreating ? <Loader2 size={16} className="animate-spin" /> : <Plus size={18} />}
          {isCreating ? 'Creating...' : 'New'}
        </button>
        <button onClick={() => setIsImportModalOpen(true)}
          className="interactive-scale flex items-center justify-center w-12 bg-[var(--muted)] text-[var(--foreground)] py-3 rounded-2xl hover:bg-[var(--p-purple)] hover:text-white transition-all premium-shadow text-sm"
          title="Import Note"
        >
          <UploadCloud size={18} />
        </button>
      </div>

      {/* Search */}
      <div className="relative group">
        <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted-text)] group-focus-within:text-[var(--p-purple)] transition-colors" />
        <input type="text" placeholder="Quick search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-[var(--muted)] border border-transparent focus:border-[var(--p-purple)]/30 focus:bg-[var(--card-bg)] outline-none rounded-2xl text-sm transition-all shadow-inner"
        />
      </div>

      {/* Scrollable nav */}
      <div className="flex flex-col gap-6 overflow-y-auto flex-1 min-h-0 scrollbar-hide">
        {/* Nav */}
        <nav className="flex flex-col gap-1">
          <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--muted-text)] mb-2 px-3 opacity-50">Navigation</p>
          {navItems.map((item) => (
            <Link key={item.id} href={item.href}
              className={cn('interactive-scale flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all',
                pathname === item.href ? 'bg-[var(--p-purple)] text-white shadow-md shadow-purple-500/20' : 'text-[var(--muted-text)] hover:bg-[var(--muted)]'
              )}
            >
              <item.icon size={18} strokeWidth={pathname === item.href ? 2.5 : 2} />
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Folders */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between mb-2 px-3">
            <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--muted-text)] opacity-50">Folders</p>
            <button className="text-[var(--muted-text)] hover:text-[var(--p-purple)] transition-colors p-1 rounded-md hover:bg-[var(--muted)]"><Plus size={13} /></button>
          </div>
          {folders.length === 0 && <p className="text-[11px] text-[var(--muted-text)] px-3 italic opacity-60">No folders created</p>}
          {folders.map((folder) => (
            <button key={folder.id} onClick={() => setSelectedFolderId(folder.id)}
              className={cn('interactive-scale flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group',
                selectedFolderId === folder.id ? 'bg-[var(--muted)] text-[var(--foreground)] border border-[var(--border)]' : 'text-[var(--muted-text)] hover:bg-[var(--muted)]/50'
              )}
            >
              <div className="w-2 h-2 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: folder.color }} />
              <span className="flex-1 text-left truncate">{folder.name}</span>
              <ChevronRight size={14} className={cn('opacity-0 group-hover:opacity-100 transition-opacity', selectedFolderId === folder.id && 'opacity-30')} />
            </button>
          ))}
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-col gap-1">
            <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--muted-text)] mb-2 px-3 opacity-50">Tags</p>
            <div className="flex flex-wrap gap-2 px-3">
              {tags.map((tag) => (
                <button key={tag.name} onClick={() => setSearchQuery(`#${tag.name}`)}
                  className={cn('interactive-scale px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all border',
                    searchQuery === `#${tag.name}` 
                      ? 'bg-[var(--p-purple)] text-white border-[var(--p-purple)] shadow-sm' 
                      : 'bg-[var(--muted)] text-[var(--muted-text)] border-[var(--border)] hover:border-[var(--muted-text)]'
                  )}
                >
                  #{tag.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer Account */}
      <div className="pt-5 border-t border-[var(--border)] flex flex-col gap-2">
        {!isGuest && session?.user ? (
          <div className="glass-card p-3 rounded-2xl flex items-center gap-3 mb-2">
            <img src={session.user.image ?? ''} alt="" width={32} height={32} className="rounded-full shadow-sm" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold truncate leading-tight">{session.user.name}</p>
              <p className="text-[10px] text-[var(--muted-text)] truncate">@github/{session.user.login}</p>
            </div>
          </div>
        ) : (
          <Link href="/login" className="interactive-scale flex items-center gap-3 px-4 py-3 rounded-2xl bg-[var(--p-purple)]/10 text-[var(--p-purple)] text-xs font-bold hover:bg-[var(--p-purple)]/20 transition-all mb-2">
            <LogIn size={16} />
            Connect GitHub
          </Link>
        )}
        
        <Link href="/settings" className={cn('interactive-scale flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all',
          pathname === '/settings' ? 'bg-[var(--muted)] text-[var(--foreground)]' : 'text-[var(--muted-text)] hover:bg-[var(--muted)]'
        )}>
          <Settings size={18} className={pathname === '/settings' ? 'animate-spin-slow' : ''} />
          Settings
        </Link>
      </div>

      <ImportModal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} />
    </aside>
  )
}
