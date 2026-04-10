'use client'

// ============================================================
// app/(app)/settings/page.tsx
// ============================================================

import { signOut } from 'next-auth/react'
import { useSession } from 'next-auth/react'
import { LogOut, Github, Database, Info } from 'lucide-react'
import Image from 'next/image'

export default function SettingsPage() {
  const { data: session } = useSession()

  return (
    <div className="p-6 lg:p-10 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-10">Settings</h1>

      {/* Account */}
      <section className="mb-8">
        <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--muted-text)] mb-4 px-1">
          Account
        </h2>
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="p-5 flex items-center gap-4">
            {session?.user?.image && (
              <Image
                src={session.user.image}
                alt="Avatar"
                width={48}
                height={48}
                className="rounded-full"
              />
            )}
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate">
                {session?.user?.name ?? 'Unknown'}
              </p>
              <p className="text-sm text-[var(--muted-text)] truncate">
                @{session?.user?.login}
              </p>
            </div>
            <span className="text-xs bg-[var(--muted)] px-2 py-1 rounded-full text-[var(--muted-text)]">
              GitHub
            </span>
          </div>
        </div>
      </section>

      {/* Storage */}
      <section className="mb-8">
        <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--muted-text)] mb-4 px-1">
          Storage
        </h2>
        <div className="glass-card rounded-2xl overflow-hidden divide-y divide-[var(--border)]">
          <div className="p-5 flex items-center gap-4">
            <Github size={20} className="text-[var(--muted-text)] shrink-0" />
            <div>
              <p className="text-sm font-medium">GitHub Repository</p>
              <p className="text-xs text-[var(--muted-text)]">
                {session?.user?.login}/noteflow-data (private)
              </p>
            </div>
          </div>
          <div className="p-5 flex items-center gap-4">
            <Database size={20} className="text-[var(--muted-text)] shrink-0" />
            <div>
              <p className="text-sm font-medium">Local Cache</p>
              <p className="text-xs text-[var(--muted-text)]">
                IndexedDB via Dexie — available offline
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About */}
      <section className="mb-10">
        <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--muted-text)] mb-4 px-1">
          About
        </h2>
        <div className="glass-card rounded-2xl p-5 flex items-start gap-4">
          <Info size={20} className="text-[var(--muted-text)] shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium mb-1">Noteflow v1.0</p>
            <p className="text-xs text-[var(--muted-text)] leading-relaxed">
              Your notes live in your GitHub repo as plain JSON files. No
              vendor lock-in. Works offline. Open source.
            </p>
          </div>
        </div>
      </section>

      {/* Sign out */}
      <button
        onClick={() => signOut({ callbackUrl: '/login' })}
        className="w-full flex items-center justify-center gap-3 py-3 rounded-xl border border-red-200 dark:border-red-900/40 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all font-medium"
      >
        <LogOut size={18} />
        Sign out
      </button>
    </div>
  )
}
