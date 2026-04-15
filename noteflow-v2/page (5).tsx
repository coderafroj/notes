'use client'
// app/(app)/focus/[id]/page.tsx
import { useEffect, useState, useCallback, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { X, Check, Loader2 } from 'lucide-react'
import { Note } from '@/types'
import { getFile } from '@/lib/github'
import { saveNoteWithSync, saveNoteLocal } from '@/lib/sync'
import { db } from '@/lib/db'
import { extractText } from '@/lib/utils'
import { useNoteflowStore } from '@/lib/store'
import Editor from '@/components/editor/Editor'

export default function FocusPage() {
  const { id } = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const { isGuest } = useNoteflowStore()
  const [note, setNote] = useState<Note | null>(null)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pending = useRef<Note | null>(null)

  useEffect(() => {
    if (!id) return
    const noteId = id as string
    db.notes.get(noteId).then((l) => { if (l) setNote(l) })
    if (!isGuest && session?.accessToken) {
      getFile(session.accessToken, session.user.login, `notes/note-${noteId}.json`)
        .then((r) => { if (r?.content) { setNote(r.content); db.notes.put({ ...r.content, sha: r.sha }) } })
    }
  }, [id, session, isGuest])

  const save = useCallback(async (n: Note) => {
    if (isGuest) await saveNoteLocal(n)
    else if (session?.accessToken) await saveNoteWithSync(session.accessToken, session.user.login, n)
  }, [session, isGuest])

  const handleChange = useCallback((content: string) => {
    if (!note) return
    const contentText = (() => { try { return extractText(JSON.parse(content)) } catch { return '' } })()
    const updated = { ...note, content, contentText, contentPreview: contentText.slice(0, 200), updatedAt: new Date().toISOString() }
    pending.current = updated; setNote(updated); setSaveStatus('saving')
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(async () => {
      if (pending.current) { await save(pending.current); setSaveStatus('saved'); setTimeout(() => setSaveStatus('idle'), 2000) }
    }, 1500)
  }, [note, save])

  if (!note) return <div className="flex items-center justify-center h-screen"><Loader2 size={22} className="animate-spin text-[var(--muted-text)]" /></div>

  const words = note.contentText?.trim().split(/\s+/).filter(Boolean).length ?? 0

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col">
      {/* Minimal bar */}
      <div className="fixed top-0 left-0 right-0 flex items-center justify-between px-6 py-3 z-10 bg-[var(--background)]/80 backdrop-blur-sm border-b border-[var(--border)]">
        <input defaultValue={note.title} onBlur={async (e) => { const u = { ...note, title: e.target.value }; setNote(u); await save(u) }}
          className="text-sm font-medium bg-transparent outline-none text-[var(--muted-text)] focus:text-[var(--foreground)] transition-colors max-w-xs" />
        <div className="flex items-center gap-4 text-xs text-[var(--muted-text)]">
          {saveStatus === 'saving' && <span className="animate-pulse flex items-center gap-1"><Loader2 size={10} className="animate-spin" />Saving</span>}
          {saveStatus === 'saved' && <span className="text-[var(--p-teal)] flex items-center gap-1"><Check size={10} />Saved</span>}
          <span>{words} words</span>
          <button onClick={() => router.push(`/note/${note.id}`)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--muted)] hover:bg-[var(--border)] transition-all">
            <X size={12} />Exit
          </button>
        </div>
      </div>
      <div className="flex-1 max-w-2xl mx-auto w-full px-6 pt-20 pb-32">
        <Editor content={note.content} onChange={handleChange} editable />
      </div>
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 text-xs text-[var(--muted-text)] bg-[var(--muted)] px-4 py-1.5 rounded-full border border-[var(--border)]">
        {words} words
      </div>
    </div>
  )
}
