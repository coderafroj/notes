'use client'
// app/(app)/settings/page.tsx
import { signOut } from 'next-auth/react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { LogOut, Github, Database, Shield, LogIn } from 'lucide-react'
import { useNoteflowStore } from '@/lib/store'

export default function SettingsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const { isGuest, setIsGuest } = useNoteflowStore()

  const Section = ({ title, children }: any) => (
    <section className="mb-8">
      <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-[var(--muted-text)] mb-3 px-2 opacity-40">{title}</h2>
      <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl overflow-hidden divide-y divide-[var(--border)] premium-shadow">{children}</div>
    </section>
  )

  const Row = ({ icon, title, sub, right }: any) => (
    <div className="flex items-center gap-4 p-5">
      <div className="w-10 h-10 rounded-xl bg-[var(--muted)] flex items-center justify-center text-[var(--muted-text)] shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold leading-tight">{title}</p>
        {sub && <p className="text-xs text-[var(--muted-text)] mt-0.5 truncate font-medium opacity-60">{sub}</p>}
      </div>
      {right}
    </div>
  )

  return (
    <div className="p-8 lg:p-12 max-w-2xl mx-auto animate-in">
      <div className="mb-10">
        <h1 className="text-3xl font-black tracking-tight leading-tight">Settings</h1>
        <p className="text-sm font-bold text-[var(--muted-text)] uppercase tracking-[0.2em] mt-1 opacity-50">Manage your workspace</p>
      </div>

      {!isGuest && session?.user && (
        <Section title="Account">
          <Row
            icon={<img src={session.user.image ?? ''} alt="" width={32} height={32} className="rounded-full shadow-sm" />}
            title={session.user.name}
            sub={`@${session.user.login} • Connected via GitHub`}
          />
        </Section>
      )}

      {isGuest && (
        <Section title="Account">
          <Row icon={<Shield size={20} />} title="Guest Workspace"
            sub="Notes saved locally in your browser — no account required"
            right={
              <button onClick={() => router.push('/login')}
                className="interactive-scale flex items-center gap-2 px-4 py-2 premium-gradient text-white rounded-xl text-xs font-bold shadow-md shadow-purple-500/20 hover:opacity-90 transition-all"
              >
                <LogIn size={14} />Connect GitHub
              </button>
            }
          />
        </Section>
      )}

      <Section title="Storage & Sync">
        <Row icon={<Database size={20} />} title="Local cache" sub="IndexedDB via Dexie — works offline without internet" />
        {!isGuest && <Row icon={<Github size={20} />} title="GitHub repository" sub={`${session?.user?.login}/noteflow-data (private)`} />}
      </Section>

      <Section title="About Noteflow">
        <Row
          icon={<div className="w-10 h-10 premium-gradient rounded-xl flex items-center justify-center text-white font-black shadow-sm shadow-purple-500/30">N</div>}
          title="Noteflow v2.0"
          sub="Your notes. Your GitHub. Zero lock-in."
        />
      </Section>

      <div className="mt-8">
        {!isGuest ? (
          <button onClick={() => signOut({ callbackUrl: '/login' })}
            className="interactive-scale w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl border border-red-200/60 dark:border-red-900/30 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all font-bold text-sm"
          >
            <LogOut size={18} />Sign Out of Noteflow
          </button>
        ) : (
          <button onClick={() => { setIsGuest(false); router.push('/login') }}
            className="interactive-scale w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl border border-[var(--border)] text-[var(--muted-text)] hover:bg-[var(--muted)] transition-all font-bold text-sm"
          >
            <LogIn size={18} />Sign in with GitHub for Sync
          </button>
        )}
      </div>
    </div>
  )
}

