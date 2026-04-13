'use client'
// app/(app)/settings/page.tsx
import { signOut } from 'next-auth/react'
import { useSession } from 'next-auth/react'
import { LogOut, Github, Database, Info, Sun, Moon, Monitor } from 'lucide-react'
import Image from 'next/image'
import { useNoteflowStore } from '@/lib/store'
import { cn } from '@/lib/utils'

export default function SettingsPage() {
  const { data: session } = useSession()
  const { theme, setTheme } = useNoteflowStore()

  const themeOptions = [
    { value: 'light' as const, icon: Sun, label: 'Light' },
    { value: 'dark' as const, icon: Moon, label: 'Dark' },
    { value: 'system' as const, icon: Monitor, label: 'System' },
  ]

  return (
    <div className="p-6 lg:p-10 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-8">Settings</h1>

      {/* Account */}
      <section className="mb-7">
        <h2 className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted-text)] mb-3 px-1">Account</h2>
        <div className="glass-card rounded-2xl p-5 flex items-center gap-4">
          {session?.user?.image && (
            <Image src={session.user.image} alt="Avatar" width={48} height={48} className="rounded-full" />
          )}
          <div className="flex-1 min-w-0">
            <p className="font-semibold truncate">{session?.user?.name ?? 'User'}</p>
            <p className="text-sm text-[var(--muted-text)]">@{session?.user?.login}</p>
          </div>
          <span className="text-xs bg-[var(--muted)] px-2.5 py-1 rounded-full text-[var(--muted-text)] font-medium">GitHub</span>
        </div>
      </section>

      {/* Theme */}
      <section className="mb-7">
        <h2 className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted-text)] mb-3 px-1">Appearance</h2>
        <div className="glass-card rounded-2xl p-5">
          <p className="text-sm font-medium mb-4">Theme</p>
          <div className="grid grid-cols-3 gap-3">
            {themeOptions.map((t) => (
              <button key={t.value} onClick={() => setTheme(t.value)}
                className={cn(
                  'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all',
                  theme === t.value ? 'border-[var(--p-purple)] bg-[var(--p-purple)]/5' : 'border-[var(--border)] hover:border-[var(--muted-text)]'
                )}
              >
                <t.icon size={20} className={theme === t.value ? 'text-[var(--p-purple)]' : 'text-[var(--muted-text)]'} />
                <span className={cn('text-xs font-medium', theme === t.value ? 'text-[var(--p-purple)]' : 'text-[var(--muted-text)]')}>{t.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Storage */}
      <section className="mb-7">
        <h2 className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted-text)] mb-3 px-1">Storage</h2>
        <div className="glass-card rounded-2xl overflow-hidden divide-y divide-[var(--border)]">
          <div className="p-4 flex items-center gap-4">
            <Github size={18} className="text-[var(--muted-text)] shrink-0" />
            <div>
              <p className="text-sm font-medium">GitHub Repository</p>
              <p className="text-xs text-[var(--muted-text)]">{session?.user?.login}/noteflow-data (private)</p>
            </div>
          </div>
          <div className="p-4 flex items-center gap-4">
            <Database size={18} className="text-[var(--muted-text)] shrink-0" />
            <div>
              <p className="text-sm font-medium">Local Cache</p>
              <p className="text-xs text-[var(--muted-text)]">IndexedDB — works offline</p>
            </div>
          </div>
        </div>
      </section>

      {/* Keyboard shortcuts */}
      <section className="mb-8">
        <h2 className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted-text)] mb-3 px-1">Keyboard Shortcuts</h2>
        <div className="glass-card rounded-2xl overflow-hidden divide-y divide-[var(--border)]">
          {[
            ['Ctrl + K', 'Open command palette'],
            ['Ctrl + B', 'Bold text'],
            ['Ctrl + I', 'Italic text'],
            ['Ctrl + U', 'Underline text'],
            ['Ctrl + Z', 'Undo'],
            ['Ctrl + Y', 'Redo'],
          ].map(([key, desc]) => (
            <div key={key} className="flex items-center justify-between px-4 py-3">
              <span className="text-sm text-[var(--muted-text)]">{desc}</span>
              <kbd className="text-[10px] px-2 py-1 bg-[var(--muted)] rounded-lg font-mono text-[var(--muted-text)]">{key}</kbd>
            </div>
          ))}
        </div>
      </section>

      {/* Sign out */}
      <button
        onClick={() => signOut({ callbackUrl: '/login' })}
        className="w-full flex items-center justify-center gap-3 py-3 rounded-xl border border-red-200 dark:border-red-900/40 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all font-medium text-sm"
      >
        <LogOut size={16} />
        Sign out
      </button>
    </div>
  )
}
