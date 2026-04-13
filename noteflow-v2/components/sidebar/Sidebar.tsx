'use client'
// components/sidebar/Sidebar.tsx
import { useState, useCallback } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import {
  Plus, Search, Settings, Star, PenLine, ChevronRight,
  Loader2, Tag, Sun, Moon, Monitor, Folder, X, Check,
  Command,
} from 'lucide-react'
import { useNoteflowStore } from '@/lib/store'
import { saveNoteWithSync, deleteNoteWithSync } from '@/lib/sync'
import { saveFile, getFile } from '@/lib/github'
import { cn, generateId, NOTE_COLORS } from '@/lib/utils'
import { Note } from '@/types'
import TemplateModal from '@/components/ui/TemplateModal'

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session } = useSession()
  const {
    folders, tags, selectedFolderId, setSelectedFolderId,
    searchQuery, setSearchQuery, theme, setTheme,
    setCommandPaletteOpen, notes,
    setFolders,
  } = useNoteflowStore()

  const [isCreating, setIsCreating] = useState(false)
  const [showTemplates, setShowTemplates] = useState(false)
  const [showNewFolder, setShowNewFolder] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [newFolderColor, setNewFolderColor] = useState('#7F77DD')

  const navItems = [
    { label: 'All Notes', icon: PenLine, id: 'all', href: '/' },
    { label: 'Favorites', icon: Star, id: 'fav', href: '/favorites' },
  ]

  const themeOptions = [
    { value: 'light', icon: Sun, label: 'Light' },
    { value: 'dark', icon: Moon, label: 'Dark' },
    { value: 'system', icon: Monitor, label: 'System' },
  ] as const

  const handleNewNote = useCallback(async (templateContent = '', templateTitle = 'Untitled Note') => {
    if (!session?.accessToken || isCreating) return
    setIsCreating(true)
    setShowTemplates(false)
    const id = generateId()
    const now = new Date().toISOString()
    const note: Note = {
      id, title: templateTitle, content: templateContent, contentText: '',
      contentPreview: '', tags: [], folder: selectedFolderId === 'all' ? 'all' : selectedFolderId,
      isPinned: false, isFavorite: false, createdAt: now, updatedAt: now, attachments: [], color: null,
    }
    await saveNoteWithSync(session.accessToken, session.user.login, note)
    router.push(`/note/${id}`)
    setIsCreating(false)
  }, [session, selectedFolderId, isCreating])

  const handleCreateFolder = useCallback(async () => {
    if (!session?.accessToken || !newFolderName.trim()) return
    const newFolder = { id: generateId(), name: newFolderName.trim(), color: newFolderColor }
    const updatedFolders = [...folders, newFolder]
    setFolders(updatedFolders)
    // Save to index.json
    const indexFile = await getFile(session.accessToken, session.user.login, 'index.json')
    if (indexFile) {
      indexFile.content.folders = updatedFolders
      await saveFile(session.accessToken, session.user.login, 'index.json', indexFile.content, indexFile.sha)
    }
    setNewFolderName('')
    setShowNewFolder(false)
  }, [session, folders, newFolderName, newFolderColor])

  const folderNoteCounts = folders.reduce((acc, f) => {
    acc[f.id] = notes.filter((n) => n.folder === f.id).length
    return acc
  }, {} as Record<string, number>)

  return (
    <>
      <aside className="hidden lg:flex w-72 flex-col h-screen border-r border-[var(--border)] bg-[var(--background)] p-5 gap-5 overflow-hidden">
        {/* Logo + Command shortcut */}
        <div className="flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[var(--p-purple)] rounded-xl flex items-center justify-center text-white shadow-sm">
              <PenLine size={16} />
            </div>
            <span className="font-bold text-lg tracking-tight">Noteflow</span>
          </div>
          <button
            onClick={() => setCommandPaletteOpen(true)}
            title="Command palette (Ctrl+K)"
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[var(--muted)] text-[var(--muted-text)] hover:text-[var(--foreground)] transition-colors text-[10px]"
          >
            <Command size={11} />
            <span>K</span>
          </button>
        </div>

        {/* New Note button */}
        <button
          onClick={() => setShowTemplates(true)}
          disabled={isCreating}
          className="flex items-center gap-2 justify-center w-full bg-[var(--foreground)] text-[var(--background)] py-2.5 rounded-xl font-medium hover:opacity-90 transition-all shadow-sm disabled:opacity-60 shrink-0 text-sm"
        >
          {isCreating ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
          {isCreating ? 'Creating...' : 'New Note'}
        </button>

        {/* Search */}
        <div className="relative shrink-0">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-text)]" />
          <input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[var(--muted)] border border-transparent focus:border-[var(--p-purple)] outline-none rounded-xl text-sm transition-all"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted-text)]">
              <X size={13} />
            </button>
          )}
        </div>

        {/* Scrollable nav */}
        <div className="flex flex-col gap-5 overflow-y-auto flex-1 min-h-0">
          {/* Navigation */}
          <nav className="flex flex-col gap-0.5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted-text)] mb-1.5 px-2">Navigation</p>
            {navItems.map((item) => (
              <Link key={item.id} href={item.href}
                className={cn(
                  'flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-all',
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
              <button onClick={() => setShowNewFolder(true)} className="text-[var(--muted-text)] hover:text-[var(--p-purple)] transition-colors">
                <Plus size={13} />
              </button>
            </div>

            {showNewFolder && (
              <div className="mb-2 p-3 bg-[var(--muted)] rounded-xl flex flex-col gap-2">
                <input
                  autoFocus
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
                  placeholder="Folder name"
                  className="w-full bg-[var(--card-bg)] border border-[var(--border)] px-3 py-1.5 rounded-lg text-sm outline-none focus:border-[var(--p-purple)]"
                />
                <div className="flex gap-1.5 flex-wrap">
                  {NOTE_COLORS.map((c) => (
                    <button key={c.name} onClick={() => setNewFolderColor(c.hex)}
                      className="w-5 h-5 rounded-full transition-transform hover:scale-110 relative"
                      style={{ backgroundColor: c.hex }}
                    >
                      {newFolderColor === c.hex && <Check size={11} className="absolute inset-0 m-auto text-white" />}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <button onClick={handleCreateFolder} className="flex-1 py-1.5 bg-[var(--p-purple)] text-white rounded-lg text-xs font-medium hover:opacity-90">Create</button>
                  <button onClick={() => { setShowNewFolder(false); setNewFolderName('') }} className="flex-1 py-1.5 bg-[var(--border)] rounded-lg text-xs text-[var(--muted-text)]">Cancel</button>
                </div>
              </div>
            )}

            {folders.length === 0 && !showNewFolder && (
              <p className="text-xs text-[var(--muted-text)] px-3 py-1">No folders yet</p>
            )}
            {folders.map((folder) => (
              <button key={folder.id} onClick={() => setSelectedFolderId(folder.id)}
                className={cn(
                  'flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-all group',
                  selectedFolderId === folder.id ? 'bg-[var(--muted)] text-[var(--foreground)]' : 'text-[var(--muted-text)] hover:bg-[var(--muted)]/50'
                )}
              >
                <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: folder.color }} />
                <span className="flex-1 text-left truncate">{folder.name}</span>
                {folderNoteCounts[folder.id] > 0 && (
                  <span className="text-[10px] bg-[var(--muted)] px-1.5 py-0.5 rounded-full text-[var(--muted-text)]">
                    {folderNoteCounts[folder.id]}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-col gap-0.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted-text)] mb-1.5 px-2">Tags</p>
              {tags.map((tag) => (
                <button key={tag.name} onClick={() => setSearchQuery(`#${tag.name}`)}
                  className={cn(
                    'flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-all',
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

        {/* Footer: theme + settings */}
        <div className="pt-4 border-t border-[var(--border)] shrink-0 flex flex-col gap-2">
          {/* Theme toggle */}
          <div className="flex items-center gap-1 bg-[var(--muted)] rounded-xl p-1">
            {themeOptions.map((t) => (
              <button key={t.value} onClick={() => setTheme(t.value)} title={t.label}
                className={cn(
                  'flex-1 flex items-center justify-center py-1.5 rounded-lg transition-all',
                  theme === t.value ? 'bg-[var(--card-bg)] text-[var(--foreground)] shadow-sm' : 'text-[var(--muted-text)] hover:text-[var(--foreground)]'
                )}
              >
                <t.icon size={14} />
              </button>
            ))}
          </div>
          <Link href="/settings"
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-[var(--muted-text)] hover:bg-[var(--muted)] transition-all"
          >
            <Settings size={16} />
            Settings
          </Link>
        </div>
      </aside>

      {/* Template Modal */}
      {showTemplates && (
        <TemplateModal
          onSelect={(content, title) => handleNewNote(content, title)}
          onClose={() => setShowTemplates(false)}
        />
      )}
    </>
  )
}
