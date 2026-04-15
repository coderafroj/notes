'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Home, Search, Plus, Star, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useNoteflowStore } from '@/lib/store'
import { saveNoteLocal, saveNoteWithSync } from '@/lib/sync'
import { v4 as uuidv4 } from 'uuid'
import { Note } from '@/types'

export default function BottomNav() {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session } = useSession()
  const { isGuest, selectedFolderId } = useNoteflowStore()

  const handleNew = async () => {
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
  }

  const navItems = [
    { label: 'Home', icon: Home, href: '/' },
    { label: 'Search', icon: Search, href: '/search' },
    { label: 'New', icon: Plus, href: '#', isAction: true, onClick: handleNew },
    { label: 'Saved', icon: Star, href: '/favorites' },
    { label: 'Settings', icon: Settings, href: '/settings' },
  ]

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-[68px] bg-[var(--background)]/90 backdrop-blur-xl border-t border-[var(--border)] px-4 flex items-center justify-between z-50">
      {navItems.map((item) => (
        item.isAction ? (
          <button key={item.label} onClick={item.onClick}
            className="relative -top-5 w-14 h-14 bg-[var(--p-purple)] text-white rounded-full flex items-center justify-center shadow-xl shadow-[var(--p-purple)]/30 border-4 border-[var(--background)] active:scale-95 transition-transform"
          >
            <Plus size={22} />
          </button>
        ) : (
          <Link key={item.label} href={item.href}
            className={cn('flex flex-col items-center gap-1 transition-all', pathname === item.href ? 'text-[var(--p-purple)]' : 'text-[var(--muted-text)]')}
          >
            <item.icon size={20} />
            <span className="text-[9px] font-semibold uppercase tracking-wider">{item.label}</span>
          </Link>
        )
      ))}
    </nav>
  )
}
