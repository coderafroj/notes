'use client'
// components/note-ui/PublishToggle.tsx
// Add this to your note page header area
// Props: note, session, onUpdate

import { useState } from 'react'
import { Globe, Lock, Loader2, Copy, Check, ExternalLink } from 'lucide-react'
import { Note } from '@/types'
import { publishNote, unpublishNote } from '@/lib/publish'
import { saveNoteWithSync } from '@/lib/sync'
import { cn } from '@/lib/utils'

interface PublishToggleProps {
  note: Note
  token: string
  username: string
  onUpdate: (note: Note) => void
}

export default function PublishToggle({
  note,
  token,
  username,
  onUpdate,
}: PublishToggleProps) {
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [showPanel, setShowPanel] = useState(false)

  const publicUrl = note.isPublished
    ? `https://mynotes.bytecores.in/@${username}/${note.slug}`
    : null

  const handleToggle = async () => {
    setLoading(true)
    try {
      let updated: Note
      if (note.isPublished) {
        updated = await unpublishNote(token, username, note)
      } else {
        updated = await publishNote(token, username, note)
      }
      await saveNoteWithSync(token, username, updated)
      onUpdate(updated)
    } catch (e) {
      console.error('[publish] toggle failed:', e)
    }
    setLoading(false)
  }

  const handleCopy = () => {
    if (!publicUrl) return
    navigator.clipboard.writeText(publicUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowPanel((v) => !v)}
        className={cn(
          'flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium transition-all',
          note.isPublished
            ? 'bg-[var(--p-teal)]/15 text-[var(--p-teal)] border border-[var(--p-teal)]/30'
            : 'bg-[var(--muted)] text-[var(--muted-text)] hover:bg-[var(--border)]'
        )}
      >
        {note.isPublished ? <Globe size={14} /> : <Lock size={14} />}
        {note.isPublished ? 'Published' : 'Private'}
      </button>

      {showPanel && (
        <>
          <div
            className="fixed inset-0 z-30"
            onClick={() => setShowPanel(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-72 bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl shadow-2xl p-4 z-40">
            <div className="flex items-center gap-3 mb-4">
              <div
                className={cn(
                  'w-10 h-10 rounded-xl flex items-center justify-center',
                  note.isPublished
                    ? 'bg-[var(--p-teal)]/15'
                    : 'bg-[var(--muted)]'
                )}
              >
                {note.isPublished ? (
                  <Globe size={20} className="text-[var(--p-teal)]" />
                ) : (
                  <Lock size={20} className="text-[var(--muted-text)]" />
                )}
              </div>
              <div>
                <p className="font-semibold text-sm">
                  {note.isPublished ? 'Note is public' : 'Note is private'}
                </p>
                <p className="text-xs text-[var(--muted-text)]">
                  {note.isPublished
                    ? 'Anyone with the link can read it'
                    : 'Only you can see this'}
                </p>
              </div>
            </div>

            {note.isPublished && publicUrl && (
              <div className="mb-4 flex items-center gap-2 p-2.5 bg-[var(--muted)] rounded-xl">
                <p className="text-xs text-[var(--muted-text)] truncate flex-1">
                  {publicUrl}
                </p>
                <button
                  onClick={handleCopy}
                  className="shrink-0 text-[var(--muted-text)] hover:text-[var(--foreground)]"
                >
                  {copied ? (
                    <Check size={14} className="text-[var(--p-teal)]" />
                  ) : (
                    <Copy size={14} />
                  )}
                </button>
                <a
                  href={publicUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 text-[var(--muted-text)] hover:text-[var(--p-purple)]"
                >
                  <ExternalLink size={14} />
                </a>
              </div>
            )}

            <button
              onClick={handleToggle}
              disabled={loading}
              className={cn(
                'w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium text-sm transition-all',
                note.isPublished
                  ? 'bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/15 dark:text-red-400'
                  : 'bg-[var(--p-purple)] text-white hover:opacity-90'
              )}
            >
              {loading ? (
                <Loader2 size={15} className="animate-spin" />
              ) : note.isPublished ? (
                <>
                  <Lock size={15} />
                  Make private
                </>
              ) : (
                <>
                  <Globe size={15} />
                  Publish note
                </>
              )}
            </button>

            {!note.isPublished && (
              <p className="text-[10px] text-[var(--muted-text)] text-center mt-2">
                Students can read without logging in
              </p>
            )}
          </div>
        </>
      )}
    </div>
  )
}
