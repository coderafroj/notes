'use client'
// app/(app)/history/[id]/page.tsx
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { ChevronLeft, GitCommit, Clock, Loader2 } from 'lucide-react'
import { githubFetch } from '@/lib/github'
import { formatDate } from '@/lib/utils'
import { motion } from 'framer-motion'

const REPO = 'noteflow-data'

export default function HistoryPage() {
  const params = useParams()
  const id = params?.id as string
  const router = useRouter()
  const { data: session } = useSession()
  const [versions, setVersions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!session?.accessToken || !id) return
    githubFetch(`/repos/${session.user.login}/${REPO}/commits?path=notes/note-${id}.json&per_page=20`, session.accessToken)
      .then((commits: any[]) => {
        if (commits) setVersions(commits.map((c) => ({
          sha: c.sha, message: c.commit.message,
          author: c.commit.author.name, date: c.commit.author.date,
        })))
      })
      .finally(() => setLoading(false))
  }, [id, session])

  return (
    <div className="p-8 lg:p-12 max-w-2xl mx-auto animate-in">
      <div className="flex items-center gap-4 mb-10">
        <button onClick={() => router.back()} 
          className="interactive-scale p-2.5 rounded-xl bg-[var(--muted)] hover:bg-[var(--border)] text-[var(--muted-text)] hover:text-[var(--foreground)] transition-all"
        >
          <ChevronLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Version History</h1>
          <p className="text-xs font-semibold text-[var(--muted-text)] uppercase tracking-widest mt-0.5 opacity-60">Snapshot log from GitHub</p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <Loader2 size={24} className="animate-spin text-[var(--p-purple)]" />
          <p className="text-xs font-bold uppercase tracking-widest text-[var(--muted-text)] opacity-50">Fetching history...</p>
        </div>
      ) : versions.length === 0 ? (
        <div className="text-center py-24 glass-card rounded-3xl border-dashed border-2">
          <GitCommit size={48} className="mx-auto mb-4 text-[var(--muted-text)] opacity-20" />
          <p className="font-bold text-[var(--muted-text)]">No revision history found</p>
          <p className="text-xs text-[var(--muted-text)] mt-1 opacity-60">Sync your note with GitHub to see versions</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {versions.map((v, i) => (
            <motion.div 
              key={v.sha} 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: i * 0.05, type: 'spring', damping: 20, stiffness: 100 }}
              className="interactive-scale flex items-start gap-4 p-5 rounded-2xl bg-[var(--card-bg)] border border-[var(--border)] hover:border-[var(--p-purple)]/30 hover:shadow-lg hover:shadow-purple-500/5 transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-[var(--muted)] flex items-center justify-center text-[var(--muted-text)] group-hover:bg-[var(--p-purple)]/10 group-hover:text-[var(--p-purple)] transition-colors">
                <GitCommit size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm font-bold truncate leading-tight">{v.message}</p>
                  {i === 0 && (
                    <span className="premium-gradient text-[10px] text-white px-2.5 py-0.5 rounded-lg font-bold shadow-sm shadow-purple-500/20 whitespace-nowrap">
                      LATEST VERSION
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-2 text-[11px] font-bold text-[var(--muted-text)] opacity-60">
                  <span className="flex items-center gap-1"><Clock size={12} /> {formatDate(v.date)}</span>
                  <span className="select-none">•</span>
                  <span className="font-mono bg-[var(--muted)] px-1.5 py-0.5 rounded text-[10px]">{v.sha.slice(0, 7)}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

