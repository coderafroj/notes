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
  const { id } = useParams()
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
    <div className="p-5 lg:p-10 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-[var(--muted)] text-[var(--muted-text)]"><ChevronLeft size={18} /></button>
        <div>
          <h1 className="text-2xl font-bold">Version History</h1>
          <p className="text-sm text-[var(--muted-text)]">All saves from GitHub</p>
        </div>
      </div>
      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 size={22} className="animate-spin text-[var(--muted-text)]" /></div>
      ) : versions.length === 0 ? (
        <div className="text-center py-20 text-[var(--muted-text)]">
          <GitCommit size={40} className="mx-auto mb-4 opacity-20" />
          <p>No history yet.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {versions.map((v, i) => (
            <motion.div key={v.sha} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
              className="flex items-start gap-3 p-4 rounded-xl border border-[var(--border)] hover:border-[var(--p-purple)]/50 transition-all"
            >
              <GitCommit size={15} className="text-[var(--muted-text)] mt-0.5 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{v.message}</p>
                <div className="flex items-center gap-2 mt-1 text-xs text-[var(--muted-text)]">
                  <Clock size={10} />{formatDate(v.date)}
                  <span className="font-mono opacity-60">{v.sha.slice(0, 7)}</span>
                </div>
              </div>
              {i === 0 && <span className="text-[10px] bg-[var(--p-teal)]/15 text-[var(--p-teal)] px-2 py-0.5 rounded-full font-medium shrink-0">Latest</span>}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
