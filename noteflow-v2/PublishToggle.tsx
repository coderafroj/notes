'use client'
// components/note-ui/PublishToggle.tsx

import { useState } from 'react'
import { Globe, Lock, Loader2, Copy, Check, ExternalLink } from 'lucide-react'
import { Note } from '@/types'
import { publishNote, unpublishNote } from '@/lib/publish'
import { saveNoteWithSync } from '@/lib/sync'
import { cn } from '@/lib/utils'

interface Props { note: Note; token: string; username: string; onUpdate: (n: Note) => void }

export default function PublishToggle({ note, token, username, onUpdate }: Props) {
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [open, setOpen] = useState(false)

  const publicUrl = note.isPublished ? `https://probanda.tech/@${username}/${note.slug}` : null

  const toggle = async () => {
    setLoading(true)
    try {
      const updated = note.isPublished
        ? await unpublishNote(token, username, note)
        : await publishNote(token, username, note)
      await saveNoteWithSync(token, username, updated)
      onUpdate(updated)
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  const copy = () => {
    if (!publicUrl) return
    navigator.clipboard.writeText(publicUrl)
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative">
      <button onClick={() => setOpen((v) => !v)}
        className={cn('flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all border',
          note.isPublished
            ? 'bg-[var(--p-teal)]/10 text-[var(--p-teal)] border-[var(--p-teal)]/20'
            : 'bg-[var(--muted)] text-[var(--muted-text)] border-[var(--border)]'
        )}
      >
        {note.isPublished ? <Globe size={13} /> : <Lock size={13} />}
        <span className="hidden sm:inline">{note.isPublished ? 'Public' : 'Private'}</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-64 bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl shadow-2xl p-4 z-40">
            <p className="font-semibold text-sm mb-1">{note.isPublished ? 'Note is public' : 'Note is private'}</p>
            <p className="text-xs text-[var(--muted-text)] mb-4">
              {note.isPublished ? 'Anyone with the link can read it' : 'Only you can see this note'}
            </p>
            {publicUrl && (
              <div className="flex items-center gap-2 p-2 bg-[var(--muted)] rounded-lg mb-3">
                <p className="text-xs text-[var(--muted-text)] truncate flex-1">{publicUrl}</p>
                <button onClick={copy} className="shrink-0 text-[var(--muted-text)] hover:text-[var(--foreground)]">
                  {copied ? <Check size={13} className="text-[var(--p-teal)]" /> : <Copy size={13} />}
                </button>
                <a href={publicUrl} target="_blank" rel="noopener" className="shrink-0 text-[var(--muted-text)] hover:text-[var(--p-purple)]"><ExternalLink size={13} /></a>
              </div>
            )}
            <button onClick={toggle} disabled={loading}
              className={cn('w-full flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-medium transition-all',
                note.isPublished
                  ? 'bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/10 dark:text-red-400'
                  : 'bg-[var(--p-purple)] text-white hover:opacity-90'
              )}
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : note.isPublished ? <><Lock size={14} /> Make private</> : <><Globe size={14} /> Publish</>}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
