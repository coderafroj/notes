'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Home, Search, Plus, Star, Settings, UploadCloud, LayoutDashboard, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useNoteflowStore } from '@/lib/store'
import { saveNoteLocal, saveNoteWithSync } from '@/lib/sync'
import { v4 as uuidv4 } from 'uuid'
import { Note } from '@/types'
import { motion } from 'framer-motion'

import { useState } from 'react'
import ImportModal from '../sidebar/ImportModal'

export default function BottomNav() {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session } = useSession()
  const { isGuest, selectedFolderId } = useNoteflowStore()
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)

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
    { label: 'Explore', icon: Search, href: '/browse' },
    { label: 'Create', icon: Plus, href: '#', isAction: true, onClick: handleNew },
    { label: 'Dash', icon: LayoutDashboard, href: '/dashboard' },
    { label: 'Profile', icon: User, href: session ? `/@${session.user.login}` : '/login' },
  ]

  // Only show on mobile
  return (
    <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm z-50">
      <nav className="relative h-16 bg-white/80 dark:bg-black/80 backdrop-blur-2xl border border-white/20 dark:border-white/10 rounded-[28px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] flex items-center justify-around px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          
          if (item.isAction) {
            return (
              <motion.button 
                key={item.label} 
                onClick={item.onClick}
                whileTap={{ scale: 0.9 }}
                className="relative -top-8 w-14 h-14 bg-gradient-to-tr from-[#7F77DD] to-[#9F97ED] text-white rounded-[20px] flex items-center justify-center shadow-[0_10px_25px_rgba(127,119,221,0.4)] border-4 border-[#f8f8f6] dark:border-[#0f0f0f]"
              >
                <Plus size={24} strokeWidth={3} />
              </motion.button>
            )
          }

          return (
            <Link 
              key={item.label} 
              href={item.href}
              className={cn(
                'relative flex flex-col items-center justify-center w-12 h-12 rounded-2xl transition-all duration-300',
                isActive ? 'text-[#7F77DD]' : 'text-[#888780]'
              )}
            >
              {isActive && (
                <motion.div 
                  layoutId="bottom-nav-active"
                  className="absolute inset-0 bg-[#7F77DD]/10 rounded-2xl"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <item.icon size={20} className={cn('transition-transform duration-300', isActive && 'scale-110')} strokeWidth={isActive ? 2.5 : 2} />
              <span className={cn('text-[9px] font-bold uppercase tracking-tighter mt-0.5', isActive ? 'opacity-100' : 'opacity-60')}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </nav>
      <ImportModal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} />
    </div>
  )
}
