'use client'
// components/mobile/BottomNav.tsx
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useState, useCallback } from 'react'
import { Home, Search, Plus, Star, Settings } from 'lucide-react'
import { cn, generateId } from '@/lib/utils'
import { useNoteflowStore } from '@/lib/store'
import { saveNoteWithSync } from '@/lib/sync'
import { Note } from '@/types'
import TemplateModal from '@/components/ui/TemplateModal'

export default function BottomNav() {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session } = useSession()
  const { selectedFolderId } = useNoteflowStore()
  const [showTemplates, setShowTemplates] = useState(false)
  const [isCreating, setIsCreating] = useState(false)

  const handleNewNote = useCallback(async (content = '', title = 'Untitled Note') => {
    if (!session?.accessToken || isCreating) return
    setIsCreating(true)
    setShowTemplates(false)
    const id = generateId()
    const now = new Date().toISOString()
    const note: Note = {
      id, title, content, contentText: '', contentPreview: '',
      tags: [], folder: selectedFolderId === 'all' ? 'all' : selectedFolderId,
      isPinned: false, isFavorite: false, createdAt: now, updatedAt: now, attachments: [], color: null,
    }
    await saveNoteWithSync(session.accessToken, session.user.login, note)
    router.push(`/note/${id}`)
    setIsCreating(false)
  }, [session, selectedFolderId, isCreating])

  const navItems = [
    { label: 'Home', icon: Home, href: '/' },
    { label: 'Search', icon: Search, href: '/search' },
    { label: 'New', icon: Plus, href: '#', isAction: true, action: () => setShowTemplates(true) },
    { label: 'Saved', icon: Star, href: '/favorites' },
    { label: 'Settings', icon: Settings, href: '/settings' },
  ]

  return (
    <>
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-20 bg-[var(--background)]/90 backdrop-blur-xl border-t border-[var(--border)] px-4 flex items-center justify-between z-50 safe-bottom">
        {navItems.map((item) => (
          item.isAction ? (
            <button key={item.label} onClick={item.action} className="flex flex-col items-center gap-1 relative -top-5">
              <div className={cn(
                'w-14 h-14 rounded-full flex items-center justify-center shadow-xl border-4 border-[var(--background)] transition-all',
                isCreating ? 'bg-[var(--muted)] text-[var(--muted-text)]' : 'bg-[var(--foreground)] text-[var(--background)]'
              )}>
                <Plus size={24} className={isCreating ? 'animate-spin' : ''} />
              </div>
            </button>
          ) : (
            <Link key={item.label} href={item.href}
              className={cn(
                'flex flex-col items-center gap-1 transition-all min-w-[44px]',
                pathname === item.href ? 'text-[var(--p-purple)]' : 'text-[var(--muted-text)]'
              )}
            >
              <item.icon size={21} />
              <span className="text-[9px] font-medium uppercase tracking-wider">{item.label}</span>
            </Link>
          )
        ))}
      </nav>

      {showTemplates && (
        <TemplateModal onSelect={handleNewNote} onClose={() => setShowTemplates(false)} />
      )}
    </>
  )
}
