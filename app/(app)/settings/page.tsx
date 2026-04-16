'use client'

import { signOut } from 'next-auth/react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { LogOut, Github, Database, Shield, LogIn, ChevronRight, Info } from 'lucide-react'
import { useNoteflowStore } from '@/lib/store'
import { motion } from 'framer-motion'

export default function SettingsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const { isGuest, setIsGuest } = useNoteflowStore()

  const Section = ({ title, children }: any) => (
    <section className="mb-8">
      <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-[#888780] mb-3 px-1 opacity-60">{title}</h2>
      <div className="bg-white border border-[#e5e4df] rounded-[24px] overflow-hidden divide-y divide-[#f2f1ed] shadow-sm">
        {children}
      </div>
    </section>
  )

  const Row = ({ icon, title, sub, right, onClick }: any) => (
    <div 
      onClick={onClick}
      className={`flex items-center gap-4 p-5 ${onClick ? 'cursor-pointer active:bg-[#f8f8f6] transition-colors' : ''}`}
    >
      <div className="w-10 h-10 rounded-[14px] bg-[#f2f1ed] flex items-center justify-center text-[#0f0f0f] shrink-0 border border-black/5">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[15px] font-black leading-tight text-[#0f0f0f]">{title}</p>
        {sub && <p className="text-[12px] text-[#888780] mt-1 truncate font-bold leading-none">{sub}</p>}
      </div>
      {right}
      {onClick && !right && <ChevronRight size={18} className="text-[#e5e4df]" />}
    </div>
  )

  return (
    <div className="p-6 md:p-12 max-w-2xl mx-auto min-h-screen">
      <header className="mb-10">
        <div className="flex items-center gap-2 mb-1.5 px-0.5">
           <div className="w-1.5 h-6 bg-[#7F77DD] rounded-full" />
           <h1 className="text-3xl font-black tracking-tight text-[#0f0f0f]">System settings</h1>
        </div>
        <p className="text-[12px] font-black text-[#888780] uppercase tracking-[0.1em] mt-1 px-1">Control your shell environment</p>
      </header>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        {!isGuest && session?.user ? (
          <Section title="Account Identity">
            <Row
              icon={<img src={session.user.image ?? ''} alt="" width={32} height={32} className="rounded-full border border-black/5" />}
              title={session.user.name}
              sub={`@${session.user.login} • Via GitHub`}
            />
          </Section>
        ) : (
          <Section title="Account Identity">
            <Row icon={<Shield size={20} />} title="Guest Session"
              sub="Notes storing in Local Persistence"
              right={
                <button onClick={() => router.push('/login')}
                  className="flex items-center gap-2 px-4 py-2 bg-[#7F77DD] text-white rounded-xl text-xs font-black shadow-lg shadow-[#7F77DD]/20 active:scale-95 transition-all"
                >
                  <LogIn size={13} /> Link GitHub
                </button>
              }
            />
          </Section>
        )}

        <Section title="Core Infrastructure">
          <Row icon={<Database size={20} />} title="Local Storage" sub="Managed by IndexedDB Engine" />
          {!isGuest && (
            <Row icon={<Github size={20} />} title="Cloud Sync" sub={`${session?.user?.login}/noteflow-data`} />
          )}
        </Section>

        <Section title="Core Documentation">
          <Row
            icon={<Info size={20} />}
            title="Version 2.0.0-PRO"
            sub="Next.js 16 + TipTap + GitHub REST"
            onClick={() => window.open('https://github.com/coderafroj/notes', '_blank')}
          />
        </Section>

        <div className="mt-12 space-y-3">
          {!isGuest ? (
            <button onClick={() => signOut({ callbackUrl: '/login' })}
              className="w-full flex items-center justify-center gap-2.5 py-4 rounded-[22px] border border-red-200 text-red-500 hover:bg-red-50 active:scale-95 transition-all font-black text-sm shadow-sm"
            >
              <LogOut size={18} /> Kill Active Session
            </button>
          ) : (
            <button onClick={() => { setIsGuest(false); router.push('/login') }}
              className="w-full flex items-center justify-center gap-2.5 py-4 rounded-[22px] border border-[#e5e4df] text-[#0f0f0f] bg-white hover:bg-[#f8f8f6] active:scale-95 transition-all font-black text-sm shadow-sm"
            >
              <LogIn size={18} /> Authenticate with GitHub
            </button>
          )}
          <p className="text-[10px] text-center text-[#888780] font-bold uppercase tracking-widest pt-4">Noteflow Engineering · 2026</p>
        </div>
      </motion.div>
    </div>
  )
}

