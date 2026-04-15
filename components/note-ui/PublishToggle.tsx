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
        className={cn('interactive-scale flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border',
          note.isPublished
            ? 'bg-[var(--p-teal)] text-white border-[var(--p-teal)] shadow-sm'
            : 'bg-[var(--muted)] text-[var(--muted-text)] border-[var(--border)] hover:border-[var(--muted-text)]/40'
        )}
      >
        {note.isPublished ? <Globe size={13} strokeWidth={2.5} /> : <Lock size={13} strokeWidth={2} />}
        <span className="hidden sm:inline lowercase tracking-wider">{note.isPublished ? 'Live' : 'Private'}</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-3 w-72 glass-card rounded-2xl shadow-2xl p-5 z-40 animate-in origin-top-right">
            <div className="flex items-center gap-3 mb-4">
               <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm',
                 note.isPublished ? 'bg-[var(--p-teal)]/10 text-[var(--p-teal)]' : 'bg-[var(--muted)] text-[var(--muted-text)]'
               )}>
                 {note.isPublished ? <Globe size={20} /> : <Lock size={20} />}
               </div>
               <div>
                  <p className="font-bold text-sm leading-tight">{note.isPublished ? 'Public Access' : 'Private Access'}</p>
                  <p className="text-[10px] font-bold text-[var(--muted-text)] uppercase tracking-widest mt-0.5 opacity-60">
                    Visibility Settings
                  </p>
               </div>
            </div>

            <p className="text-xs text-[var(--muted-text)] mb-5 leading-relaxed">
              {note.isPublished 
                ? 'Your note is currently indexed and visible to anyone with the unique URL.' 
                : 'Only you can access this note. Content is encrypted and stored securely.'}
            </p>

            {publicUrl && (
              <div className="group flex flex-col gap-2 p-3 bg-[var(--muted)]/50 border border-[var(--border)] rounded-xl mb-4 transition-colors hover:bg-[var(--muted)]">
                <div className="flex items-center justify-between gap-2">
                   <p className="text-[10px] font-bold text-[var(--muted-text)] uppercase tracking-widest opacity-60">Public Link</p>
                   <div className="flex items-center gap-2">
                      <button onClick={copy} className="interactive-scale p-1.5 bg-[var(--card-bg)] border border-[var(--border)] rounded-lg text-[var(--muted-text)] hover:text-[var(--foreground)] shadow-sm">
                        {copied ? <Check size={12} className="text-[var(--p-teal)]" /> : <Copy size={12} />}
                      </button>
                      <a href={publicUrl} target="_blank" rel="noopener" className="interactive-scale p-1.5 bg-[var(--card-bg)] border border-[var(--border)] rounded-lg text-[var(--muted-text)] hover:text-[var(--p-purple)] shadow-sm">
                        <ExternalLink size={12} />
                      </a>
                   </div>
                </div>
                <p className="text-[11px] text-[var(--muted-text)] truncate font-medium">{publicUrl}</p>
              </div>
            )}

            <button onClick={toggle} disabled={loading}
              className={cn('w-full interactive-scale flex items-center justify-center gap-2.5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm',
                note.isPublished
                  ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-100'
                  : 'premium-gradient text-white hover:opacity-90'
              )}
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : note.isPublished ? <><Lock size={14} /> Revoke Public Access</> : <><Globe size={14} /> Go Public</>}
            </button>
          </div>
        </>
      )}
    </div>
  )
}

