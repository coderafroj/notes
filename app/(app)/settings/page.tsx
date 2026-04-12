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
    <div className="p-4 sm:p-6 lg:p-10 max-w-2xl mx-auto w-full pb-32">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-10 pt-4 sm:pt-0 px-2 lg:px-0">Settings</h1>

      {/* Account */}
      <section className="mb-6 sm:mb-8">
        <h2 className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[var(--muted-text)] mb-3 sm:mb-4 px-3 lg:px-1">
          Account
        </h2>
        <div className="glass-card rounded-2xl sm:rounded-2xl overflow-hidden shadow-sm">
          <div className="p-4 sm:p-5 flex items-center gap-4">
            <div className="relative shrink-0">
              {session?.user?.image ? (
                <Image
                  src={session.user.image}
                  alt="Avatar"
                  width={52}
                  height={52}
                  className="rounded-full ring-2 ring-[var(--p-purple)]/20"
                />
              ) : (
                <div className="w-[52px] h-[52px] rounded-full bg-[var(--muted)] flex items-center justify-center text-[var(--muted-text)]">
                  <Github size={24} />
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[var(--p-teal)] border-2 border-[var(--background)] rounded-full" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-base sm:text-lg truncate">
                {session?.user?.name ?? 'Guest User'}
              </p>
              <p className="text-sm text-[var(--muted-text)] truncate">
                {session?.user?.login ? `@${session.user.login}` : 'Local Mode'}
              </p>
            </div>
            <span className="hidden xs:flex text-[10px] font-bold uppercase tracking-tight bg-[var(--muted)] px-2 py-1 rounded-lg text-[var(--muted-text)]">
              {session?.user?.login ? 'GitHub' : 'Guest'}
            </span>
          </div>
        </div>
      </section>

      {/* Storage */}
      <section className="mb-6 sm:mb-8">
        <h2 className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[var(--muted-text)] mb-3 sm:mb-4 px-3 lg:px-1">
          Storage & Sync
        </h2>
        <div className="glass-card rounded-2xl overflow-hidden divide-y divide-[var(--border)] shadow-sm">
          <div className="p-4 sm:p-5 flex items-center gap-4 active:bg-[var(--muted)] transition-colors cursor-pointer">
            <div className="w-10 h-10 rounded-xl bg-[var(--p-purple)]/10 flex items-center justify-center text-[var(--p-purple)] shrink-0">
              <Github size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold">GitHub Repository</p>
              <p className="text-xs text-[var(--muted-text)] truncate">
                {session?.user?.login ? `${session.user.login}/noteflow-data` : 'Not connected'}
              </p>
            </div>
          </div>
          <div className="p-4 sm:p-5 flex items-center gap-4 active:bg-[var(--muted)] transition-colors cursor-pointer">
            <div className="w-10 h-10 rounded-xl bg-[var(--p-blue)]/10 flex items-center justify-center text-[var(--p-blue)] shrink-0">
              <Database size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold">Local Cache</p>
              <p className="text-xs text-[var(--muted-text)]">
                {session?.user?.login ? 'Synced via IndexedDB' : 'Local only storage'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About */}
      <section className="mb-8 sm:mb-10">
        <h2 className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[var(--muted-text)] mb-3 sm:mb-4 px-3 lg:px-1">
          About Noteflow
        </h2>
        <div className="glass-card rounded-2xl p-4 sm:p-5 flex items-start gap-4 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-[var(--muted)] flex items-center justify-center text-[var(--muted-text)] shrink-0">
            <Info size={20} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold mb-1">Version 1.2.0</p>
            <p className="text-xs text-[var(--muted-text)] leading-relaxed">
              Your notes live in your GitHub repo as encrypted JSON files. 
              Zero vendor lock-in, fully offline, and open source.
            </p>
          </div>
        </div>
      </section>

      {/* Sign out */}
      <div className="px-2 sm:px-0">
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl border border-red-200 dark:border-red-900/40 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 active:scale-[0.98] transition-all font-bold text-sm shadow-sm"
        >
          <LogOut size={18} />
          Sign out of Noteflow
        </button>
      </div>
    </div>

  )
}
