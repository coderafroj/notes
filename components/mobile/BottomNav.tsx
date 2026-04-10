'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Home, 
  Search, 
  Plus, 
  Star, 
  Settings 
} from 'lucide-react'
import { cn } from '@/lib/utils'

export default function BottomNav() {
  const pathname = usePathname()

  const navItems = [
    { label: 'Home', icon: Home, href: '/' },
    { label: 'Search', icon: Search, href: '/search' },
    { label: 'New', icon: Plus, href: '/new', isAction: true },
    { label: 'Saved', icon: Star, href: '/favorites' },
    { label: 'Settings', icon: Settings, href: '/settings' },
  ]

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-20 bg-[var(--background)]/80 backdrop-blur-xl border-t border-[var(--border)] px-6 flex items-center justify-between z-50">
      {navItems.map((item) => (
        <Link
          key={item.label}
          href={item.href}
          className={cn(
            "flex flex-col items-center gap-1 transition-all",
            item.isAction ? "relative -top-6" : "",
            pathname === item.href ? "text-[var(--p-purple)]" : "text-[var(--muted-text)]"
          )}
        >
          {item.isAction ? (
            <div className="w-14 h-14 bg-[var(--foreground)] text-[var(--background)] rounded-full flex items-center justify-center shadow-xl border-4 border-[var(--background)]">
              <Plus size={24} />
            </div>
          ) : (
            <>
              <item.icon size={22} />
              <span className="text-[10px] font-medium uppercase tracking-wider">{item.label}</span>
            </>
          )}
        </Link>
      ))}
    </nav>
  )
}
