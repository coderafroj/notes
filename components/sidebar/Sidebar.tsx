'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  Plus, 
  Search, 
  Folder, 
  Tag, 
  Settings, 
  Star, 
  LayoutGrid,
  List,
  PenLine,
  ChevronRight
} from 'lucide-react'
import { useNoteflowStore } from '@/lib/store'
import { cn } from '@/lib/utils'

export default function Sidebar() {
  const pathname = usePathname()
  const { folders, tags, selectedFolderId, setSelectedFolderId } = useNoteflowStore()

  const navItems = [
    { label: 'All Notes', icon: PenLine, id: 'all', href: '/' },
    { label: 'Favorites', icon: Star, id: 'fav', href: '/favorites' },
  ]

  return (
    <aside className="hidden lg:flex w-72 flex-col h-screen border-r border-[var(--border)] bg-[var(--background)] p-6 gap-8">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-[var(--p-purple)] rounded-xl flex items-center justify-center text-white">
          <PenLine size={18} />
        </div>
        <span className="font-bold text-xl tracking-tight">Noteflow</span>
      </div>

      <button className="flex items-center gap-2 justify-center w-full bg-[var(--foreground)] text-[var(--background)] py-3 rounded-xl font-medium hover:opacity-90 transition-all shadow-sm">
        <Plus size={18} />
        New Note
      </button>

      <div className="flex flex-col gap-2">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-text)]" />
          <input 
            type="text" 
            placeholder="Quick search..." 
            className="w-full pl-10 pr-4 py-2 bg-[var(--muted)] border border-transparent focus:border-[var(--p-purple)] outline-none rounded-xl text-sm transition-all"
          />
        </div>
      </div>

      <nav className="flex flex-col gap-1">
        <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted-text)] mb-2 px-2">Navigation</p>
        {navItems.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all",
              pathname === item.href ? "bg-[var(--p-purple)]/10 text-[var(--p-purple)]" : "text-[var(--muted-text)] hover:bg-[var(--muted)]"
            )}
          >
            <item.icon size={18} />
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="flex flex-col gap-1 overflow-y-auto">
        <div className="flex items-center justify-between mb-2 px-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted-text)]">Folders</p>
          <button className="text-[var(--muted-text)] hover:text-[var(--p-purple)]">
            <Plus size={14} />
          </button>
        </div>
        {folders.map((folder) => (
          <button
            key={folder.id}
            onClick={() => setSelectedFolderId(folder.id)}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all group",
              selectedFolderId === folder.id ? "bg-[var(--muted)] text-[var(--foreground)]" : "text-[var(--muted-text)] hover:bg-[var(--muted)]/50"
            )}
          >
            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: folder.color }} />
            <span className="flex-1 text-left truncate">{folder.name}</span>
            <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        ))}
      </div>

      <div className="mt-auto pt-6 border-t border-[var(--border)]">
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
