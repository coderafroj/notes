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
      <h2 className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted-text)] mb-3 px-1">{title}</h2>
      <div className="glass-card rounded-2xl overflow-hidden divide-y divide-[var(--border)]">{children}</div>
    </section>
  )

  const Row = ({ icon, title, sub, right }: any) => (
    <div className="flex items-center gap-4 p-4">
      <div className="w-9 h-9 rounded-xl bg-[var(--muted)] flex items-center justify-center text-[var(--muted-text)] shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{title}</p>
        {sub && <p className="text-xs text-[var(--muted-text)] mt-0.5 truncate">{sub}</p>}
      </div>
      {right}
    </div>
  )

  return (
    <div className="p-5 lg:p-10 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-8">Settings</h1>

      {!isGuest && session?.user && (
        <Section title="Account">
          <Row
            icon={<img src={session.user.image ?? ''} alt="" width={28} height={28} className="rounded-full" />}
            title={session.user.name}
            sub={`@${session.user.login} • GitHub`}
          />
        </Section>
      )}

      {isGuest && (
        <Section title="Account">
          <Row icon={<Shield size={18} />} title="Guest mode" sub="Notes saved locally in your browser"
            right={
              <button onClick={() => router.push('/login')} className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--p-purple)] text-white rounded-xl text-xs font-medium hover:opacity-90 transition-all">
                <LogIn size={13} />Sign in
              </button>
            }
          />
        </Section>
      )}

      <Section title="Storage">
        <Row icon={<Database size={18} />} title="Local cache" sub="IndexedDB via Dexie — works offline" />
        {!isGuest && <Row icon={<Github size={18} />} title="GitHub repo" sub={`${session?.user?.login}/noteflow-data (private)`} />}
      </Section>

      <Section title="About">
        <Row icon={<span className="font-bold text-[var(--p-purple)]">N</span>} title="Noteflow v1.0" sub="probanda.tech — Your notes. Your GitHub." />
      </Section>

      {!isGuest ? (
        <button onClick={() => signOut({ callbackUrl: '/login' })}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-red-200 dark:border-red-900/30 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all font-medium text-sm"
        >
          <LogOut size={16} />Sign out
        </button>
      ) : (
        <button onClick={() => { setIsGuest(false); router.push('/login') }}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-[var(--border)] text-[var(--muted-text)] hover:bg-[var(--muted)] transition-all font-medium text-sm"
        >
          <LogIn size={16} />Sign in with GitHub
        </button>
      )}
    </div>
  )
}
