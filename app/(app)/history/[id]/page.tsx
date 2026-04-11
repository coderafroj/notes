'use client'
// app/(app)/history/[id]/page.tsx
// Shows GitHub commit history for a note
// Link: router.push(`/history/${note.id}`)

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { ChevronLeft, GitCommit, Clock, Loader2, Eye } from 'lucide-react'
import { githubFetch } from '@/lib/github'
import { formatDate } from '@/lib/utils'
import { motion } from 'framer-motion'

interface Commit {
  sha: string
  commit: {
    message: string
    author: { name: string; date: string }
  }
}

interface HistoryVersion {
  sha: string
  message: string
  author: string
  date: string
  content?: string
}

const REPO_NAME = 'noteflow-data'

export default function HistoryPage() {
  const { id } = useParams()
  const router = useRouter()
  const { data: session } = useSession()

  const [versions, setVersions] = useState<HistoryVersion[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<HistoryVersion | null>(null)
  const [loadingPreview, setLoadingPreview] = useState(false)

  useEffect(() => {
    if (!session?.accessToken || !id) return
    const noteId = id as string

    githubFetch(
      `/repos/${session.user.login}/${REPO_NAME}/commits?path=notes/note-${noteId}.json&per_page=20`,
      session.accessToken
    )
      .then((commits: Commit[]) => {
        if (!commits) return
        setVersions(
          commits.map((c) => ({
            sha: c.sha,
            message: c.commit.message,
            author: c.commit.author.name,
            date: c.commit.author.date,
          }))
        )
      })
      .finally(() => setLoading(false))
  }, [id, session])

  const loadPreview = async (version: HistoryVersion) => {
    if (!session?.accessToken) return
    setLoadingPreview(true)
    setSelected(version)

    try {
      // Get file content at that commit
      const data = await githubFetch(
        `/repos/${session.user.login}/${REPO_NAME}/contents/notes/note-${id}.json?ref=${version.sha}`,
        session.accessToken
      )
      if (data?.content) {
        const raw = atob(data.content.replace(/\n/g, ''))
        const note = JSON.parse(raw)
        setSelected({ ...version, content: note.contentText || note.title || '(empty)' })
      }
    } catch {}
    setLoadingPreview(false)
  }

  return (
    <div className="p-6 lg:p-10 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-xl hover:bg-[var(--muted)] transition-all text-[var(--muted-text)]"
        >
          <ChevronLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold">Version History</h1>
          <p className="text-sm text-[var(--muted-text)]">Saved to your GitHub repo</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-[var(--muted-text)]">
          <Loader2 size={24} className="animate-spin" />
        </div>
      ) : versions.length === 0 ? (
        <div className="text-center py-20 text-[var(--muted-text)]">
          <GitCommit size={40} className="mx-auto mb-4 opacity-30" />
          <p>No history yet. Save the note to create a version.</p>
        </div>
      ) : (
        <div className="flex gap-6">
          {/* Commit list */}
          <div className="flex-1 flex flex-col gap-2">
            {versions.map((v, i) => (
              <motion.button
                key={v.sha}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => loadPreview(v)}
                className={`flex items-start gap-3 p-4 rounded-xl border transition-all text-left ${
                  selected?.sha === v.sha
                    ? 'border-[var(--p-purple)] bg-[var(--p-purple)]/5'
                    : 'border-[var(--border)] hover:border-[var(--p-purple)]/50 hover:bg-[var(--muted)]'
                }`}
              >
                <GitCommit size={16} className="text-[var(--muted-text)] mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{v.message}</p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-[var(--muted-text)]">
                    <Clock size={11} />
                    <span>{formatDate(v.date)}</span>
                    <span className="font-mono opacity-60">{v.sha.slice(0, 7)}</span>
                  </div>
                </div>
                {i === 0 && (
                  <span className="ml-auto shrink-0 text-[10px] bg-[var(--p-teal)]/15 text-[var(--p-teal)] px-2 py-0.5 rounded-full font-medium">
                    Latest
                  </span>
                )}
              </motion.button>
            ))}
          </div>

          {/* Preview panel */}
          {selected && (
            <div className="w-64 shrink-0 hidden lg:block">
              <div className="sticky top-6 bg-[var(--card-bg)] border border-[var(--border)] rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Eye size={14} className="text-[var(--muted-text)]" />
                  <span className="text-xs font-medium text-[var(--muted-text)]">Preview</span>
                </div>
                {loadingPreview ? (
                  <Loader2 size={16} className="animate-spin text-[var(--muted-text)] mx-auto" />
                ) : (
                  <p className="text-xs text-[var(--muted-text)] leading-relaxed line-clamp-10">
                    {selected.content || 'Loading...'}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
